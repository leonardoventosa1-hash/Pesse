"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";
import {drawStoryCard} from "@/lib/story-card";
type StoryArticle={id:string;title:string;slug:string;cover_url:string|null};
function loadImage(url:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{
 const img=new Image();img.crossOrigin="anonymous";
 const timer=window.setTimeout(()=>{img.onload=null;img.onerror=null;reject(Error("La imagen tardó demasiado en cargar."))},15000);
 img.onload=()=>{window.clearTimeout(timer);resolve(img)};img.onerror=()=>{window.clearTimeout(timer);reject(Error("No se pudo cargar la imagen. Podés generar la historia sin fotografía."))};img.src=url;
})}
export default function StoryCardCreator({articleId}:{articleId:string}){
 const router=useRouter();const canvas=useRef<HTMLCanvasElement>(null);
 const [article,setArticle]=useState<StoryArticle|null>(null),[title,setTitle]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [logo,setLogo]=useState<HTMLImageElement|null>(null),[photo,setPhoto]=useState<HTMLImageElement|null>(null),[photoError,setPhotoError]=useState(""),[usePhoto,setUsePhoto]=useState(true),[focus,setFocus]=useState(50),[renderError,setRenderError]=useState(""),[notice,setNotice]=useState(""),[downloading,setDownloading]=useState(false),[url,setUrl]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{
  const db=supabase();if(!db)throw Error("No se pudo conectar con Pesse.");
  if(!await getRole()){router.replace("/admin/login");return}
  const {data,error}=await db.from("articles").select("id,title,slug,cover_url").eq("id",articleId).eq("status","published").is("deleted_at",null).maybeSingle();
  if(error||!data)throw Error("Esta nota no está publicada o no tenés permiso para acceder a ella.");
  const brand=await loadImage("/pesse-logo-verde.svg");if(!active)return;
  setArticle(data);setTitle(data.title);setLogo(brand);setUsePhoto(Boolean(data.cover_url));
  setUrl(new URL("/noticias/"+encodeURIComponent(data.slug),window.location.origin).href);
  if(data.cover_url){try{const imageUrl=new URL(data.cover_url);if(imageUrl.protocol!=="https:")throw Error("La foto necesita un enlace HTTPS.");const image=await loadImage(imageUrl.href);if(active)setPhoto(image)}catch(error){if(active)setPhotoError(error instanceof Error?error.message:"No se pudo cargar la fotografía.")}}
 }catch(error){if(active)setError(error instanceof Error?error.message:"No se pudo abrir el creador.")}
 finally{if(active)setLoading(false)}})();return()=>{active=false}},[articleId,router]);
 useEffect(()=>{
  if(!canvas.current||!logo||!article)return;
  try{drawStoryCard(canvas.current,{title:title.trim()||article.title,photo:usePhoto?photo:null,logo,focus});setRenderError("")}
  catch(error){setRenderError(error instanceof Error?error.message:"No se pudo generar la vista previa.")}
 },[title,photo,logo,article,usePhoto,focus,loading]);
 async function download(){
  if(!canvas.current||!article||renderError||loading||downloading||(usePhoto&&!photo))return;
  setDownloading(true);setNotice("");try{
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.current!.toBlob(value=>value?resolve(value):reject(Error("No se pudo generar el archivo.")),"image/png"));
   const objectUrl=URL.createObjectURL(blob);const link=document.createElement("a");link.href=objectUrl;link.download="pesse-historia-"+article.slug.replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,100)+".png";document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);
   setNotice("Historia descargada. Subila a Instagram y agregá el enlace de la nota con el sticker de enlace.");
  }catch{setNotice("No se pudo descargar la imagen. Si la fotografía es externa, probá generar la historia sin foto.")}
  finally{setDownloading(false)}
 }
 async function copyLink(){try{await navigator.clipboard.writeText(url);setNotice("Enlace copiado. Pegalo en el sticker de enlace de Instagram.")}catch{setNotice("No se pudo copiar automáticamente. Seleccioná y copiá el enlace que aparece abajo.")}}
 return <main className="container main story-creator"><Link href="/admin" className="more-link">← Volver a redacción</Link><div className="eyebrow" style={{marginTop:28}}>DIFUSIÓN DE NOTICIAS</div><h1>Crear historia de Instagram</h1><p>Prepará una placa vertical de 1080 × 1920 px. Los cambios de esta pantalla solo afectan la imagen para redes.</p>
 {loading?<p role="status">Preparando la historia…</p>:error?<p role="alert">{error}</p>:article&&<div className="story-creator-grid"><section className="story-creator-controls" aria-label="Personalizar historia">
 <label htmlFor="story-title">Título para la historia</label><textarea id="story-title" rows={5} maxLength={180} value={title} onChange={event=>setTitle(event.target.value)}/><small>{title.length}/180 caracteres. Podés acortarlo sin modificar la nota.</small><button className="secondary-button" type="button" onClick={()=>setTitle(article.title)}>Usar título original</button>
 {article.cover_url&&<><label className="story-photo-toggle"><input type="checkbox" checked={usePhoto} onChange={event=>setUsePhoto(event.target.checked)}/> Usar fotografía de portada</label>{photoError&&<p role="alert">{photoError} Desmarcá “Usar fotografía de portada” para descargar una placa solo con texto.</p>}{usePhoto&&photo&&<><label htmlFor="story-focus">Encuadre vertical de la fotografía</label><input id="story-focus" type="range" min={0} max={100} value={focus} onChange={event=>setFocus(Number(event.target.value))}/><small>Mové el encuadre y revisá que se vea el protagonista de la foto.</small></>}</>}
 {renderError&&<p role="alert">{renderError}</p>}<button className="primary-button" type="button" disabled={downloading||!!renderError||(usePhoto&&!photo)||!logo} onClick={()=>void download()}>{downloading?"Generando PNG…":"Descargar historia PNG"}</button>
 <h2>Enlace de la noticia</h2><input aria-label="Enlace publicado de la noticia" value={url} readOnly onFocus={event=>event.target.select()}/><button type="button" className="secondary-button" onClick={()=>void copyLink()}>Copiar enlace de la nota</button><p>Subí la imagen a las historias de Instagram de Pesse y agregá un sticker de enlace con esta dirección. El enlace no queda clickeable dentro del PNG.</p><p>La descarga no publica en Instagram ni requiere conectar la cuenta.</p>{notice&&<p role="status" aria-live="polite">{notice}</p>}
 </section><section className="story-preview" aria-label="Vista previa de la historia"><canvas ref={canvas} width={1080} height={1920} role="img" aria-label={"Vista previa de historia: "+(title||article.title)}/><p>Vista previa · 9:16 · PNG</p></section></div>}
 </main>;
}
