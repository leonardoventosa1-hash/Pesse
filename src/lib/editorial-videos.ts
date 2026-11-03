import {supabase} from "@/lib/supabase";

export type EditorialVideo={
 id:string;youtube_id:string;title:string;description:string;
 category:"stream"|"entrevista"|"cobertura"|"videos";
 status:"draft"|"published"|"archived";display_order:number;
 published_at:string|null;created_at:string;
};
export const videoCategoryLabels:Record<EditorialVideo["category"],string>={
 stream:"Pesse Stream",entrevista:"Entrevistas",cobertura:"Coberturas",videos:"Videos"
};
export function youtubeIdFromUrl(input:string):string|null{
 try{
  const parsed=new URL(input.trim());
  if(parsed.protocol!=="https:"||parsed.username||parsed.password)return null;
  const host=parsed.hostname.toLowerCase().replace(/^www\./,"");
  let id:string|null=null;
  if(host==="youtube.com"&&(parsed.pathname==="/watch"))id=parsed.searchParams.get("v");
  else if(host==="youtube.com"&&/^\/(shorts|live|embed)\//.test(parsed.pathname))id=parsed.pathname.split("/")[2]??null;
  else if(host==="youtu.be")id=parsed.pathname.slice(1).split("/")[0];
  return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
 }catch{return null}
}
export const youtubeWatchUrl=(id:string)=>"https://www.youtube.com/watch?v="+encodeURIComponent(id);
export const youtubeThumbnailUrl=(id:string)=>"https://i.ytimg.com/vi/"+encodeURIComponent(id)+"/hqdefault.jpg";
export async function publishedVideos(limit=12):Promise<EditorialVideo[]>{
 const db=supabase();if(!db)return [];
 try{
  const {data,error}=await db.from("editorial_videos")
   .select("id,youtube_id,title,description,category,status,display_order,published_at,created_at")
   .eq("status","published").lte("published_at",new Date().toISOString())
   .order("display_order",{ascending:true}).order("published_at",{ascending:false})
   .limit(limit);
  return error?[]:(data??[]) as EditorialVideo[];
 }catch{return []}
}
