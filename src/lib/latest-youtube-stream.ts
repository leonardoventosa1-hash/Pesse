/**
 * Obtiene el último vivo FINALIZADO de Pesse Stream.
 *
 * Usa YouTube Data API v3 cuando hay YOUTUBE_API_KEY configurada, ya que
 * eventType=completed permite distinguir los vivos de clips o Shorts.
 * Si no hay credenciales, consulta la pestaña pública /streams del canal
 * (sin introducir secretos en el cliente). Si falla, el componente mantiene
 * el contenido editorial existente como respaldo.
 *
 * Cache: 30 minutos; la web detecta nuevas emisiones sin intervención.
 */
export type ArchivedStream={id:string;title:string;publishedAt:string|null;source:"api"|"channel"};

const ID=/^[A-Za-z0-9_-]{11}$/;
const CHANNEL_HANDLE="@pesseinfo";
const CACHE_SECONDS=1800;

function jsonFromPage(html:string):unknown|null{
 const labels=["var ytInitialData = ","window[\"ytInitialData\"] = ","ytInitialData = "];
 for(const label of labels){
  const marker=html.indexOf(label);
  if(marker<0)continue;
  const start=html.indexOf("{",marker+label.length);
  if(start<0)continue;
  let depth=0,inString=false,escape=false;
  for(let i=start;i<html.length;i++){
   const ch=html[i];
   if(inString){if(escape)escape=false;else if(ch==="\\")escape=true;else if(ch==='"')inString=false;continue}
   if(ch==='"'){inString=true;continue}
   if(ch==="{")depth++;
   else if(ch==="}"&&--depth===0){
    try{return JSON.parse(html.slice(start,i+1))}catch{break}
   }
  }
 }
 return null;
}
function textOf(value:unknown):string{
 if(!value||typeof value!=="object")return "";
 const node=value as {simpleText?:string;runs?:Array<{text?:string}>};
 return typeof node.simpleText==="string"?node.simpleText:Array.isArray(node.runs)?node.runs.map(x=>x.text??"").join(""):"";
}
function videoFromNode(value:unknown):ArchivedStream|null{
 if(!value||typeof value!=="object")return null;
 const x=value as Record<string,unknown>;
 const renderer=(x.videoRenderer||x.gridVideoRenderer||x.reelItemRenderer) as Record<string,unknown>|undefined;
 // Shorts aren't streams. /streams surfaces videoRenderer and gridVideoRenderer.
 if(!renderer||x.reelItemRenderer)return null;
 const id=renderer.videoId;
 if(typeof id!=="string"||!ID.test(id))return null;
 const title=textOf(renderer.title).trim();
 const overlays=JSON.stringify([renderer.thumbnailOverlays,renderer.badges,renderer.upcomingEventData,renderer.badge]);
 if(/UPCOMING|EN DIRECTO|LIVE_NOW|LIVE\b|PRÓXIMAMENTE|ESTRENO|PREMIERE|LIVE_STREAMING/i.test(overlays))return null;
 if(renderer.upcomingEventData)return null;
 const publishedAt=textOf(renderer.publishedTimeText)||null;
 return {id,title:title||"Último Pesse Stream",publishedAt,source:"channel"};
}
function extractArchivedStreams(data:unknown):ArchivedStream[]{
 const found:ArchivedStream[]=[];
 const seen=new Set<string>();
 function walk(node:unknown,depth:number){
  if(depth>28||found.length>=40||!node||typeof node!=="object")return;
  if(Array.isArray(node)){for(const item of node)walk(item,depth+1);return}
  const value=node as Record<string,unknown>;
  const candidate=videoFromNode(value);
  if(candidate&&!seen.has(candidate.id)){seen.add(candidate.id);found.push(candidate)}
  for(const [key,child] of Object.entries(value)){
   if(key==="responseContext"||key==="metadata"||key==="trackingParams"||key==="frameworkUpdates")continue;
   if(child&&typeof child==="object")walk(child,depth+1);
  }
 }
 walk(data,0);
 return found;
}
async function fromChannelPage():Promise<ArchivedStream|null>{
 try{
  const response=await fetch("https://www.youtube.com/"+CHANNEL_HANDLE+"/streams",{
   headers:{"Accept-Language":"es-AR,es;q=0.9,en;q=0.8","User-Agent":"Mozilla/5.0 (compatible; PessePortal/1.0; +https://pesse-gilt.vercel.app)"},
   next:{revalidate:CACHE_SECONDS},signal:AbortSignal.timeout(9000)
  });
  if(!response.ok)return null;
  const html=await response.text();
  if(html.length>3000000)return null;
  const data=jsonFromPage(html);
  return extractArchivedStreams(data)[0]??null;
 }catch{return null}
}
async function fromDataApi():Promise<ArchivedStream|null>{
 const key=process.env.YOUTUBE_API_KEY;
 const channelId=process.env.YOUTUBE_CHANNEL_ID;
 if(!key||!channelId||!/^UC[A-Za-z0-9_-]{22}$/.test(channelId))return null;
 try{
  const url=new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part","snippet");
  url.searchParams.set("channelId",channelId);
  url.searchParams.set("eventType","completed");
  url.searchParams.set("type","video");
  url.searchParams.set("order","date");
  url.searchParams.set("maxResults","10");
  url.searchParams.set("key",key);
  const response=await fetch(url,{next:{revalidate:CACHE_SECONDS},signal:AbortSignal.timeout(9000)});
  if(!response.ok)return null;
  const result=await response.json() as {items?:Array<{id?:{videoId?:string};snippet?:{title?:string;publishedAt?:string}}>};
  const chosen=result.items?.find(item=>item.id?.videoId&&ID.test(item.id.videoId));
  if(!chosen?.id?.videoId)return null;
  return {id:chosen.id.videoId,title:chosen.snippet?.title||"Último Pesse Stream",publishedAt:chosen.snippet?.publishedAt||null,source:"api"};
 }catch{return null}
}
export async function latestArchivedPesseStream():Promise<ArchivedStream|null>{
 return (await fromDataApi())||(await fromChannelPage());
}
