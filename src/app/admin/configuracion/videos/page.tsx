"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";
import {youtubeIdFromUrl,youtubeThumbnailUrl,youtubeWatchUrl,videoCategoryLabels,type EditorialVideo} from "@/lib/editorial-videos";

const types=Object.entries(videoCategoryLabels) as [EditorialVideo["category"],string][];
export default function VideosAdmin(){
 const router=useRouter();
 const [allowed,setAllowed]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [rows,setRows]=useState<EditorialVideo[]>([]);
 const [url,setUrl]=useState(""),[title,setTitle]=useState(""),[description,setDescription]=useState("");
 const [category,setCategory]=useState<EditorialVideo["category"]>("stream"),[order,setOrder]=useState(100);
 const [notice,setNotice]=useState(""),[error,setError]=useState("");
 const id=youtubeIdFromUrl(url);
 async function refresh(){
  const db=supabase();if(!db)throw Error("Supabase no está disponible.");
  const {data,error:readError}=await db.from("editorial_videos")
   .select("id,youtube_id,title,description,category,status,display_order,published_at,created_at")
   .order("created_at",{ascending:false}).limit(100);
  if(readError)throw readError;
  setRows((data??[]) as EditorialVideo[]);
 }
 useEffect(()=>{let alive=true;(async()=>{try{
  const db=supabase();if(!db)throw Error("Supabase no está configurado.");
  const {data:{user}}=await db.auth.getUser();
  if(!alive)return;
  if(!user){router.replace("/admin/login");return}
  if(await getRole()!=="admin"){router.replace("/admin");return}
  setAllowed(true);await refresh();
 }catch(cause){if(alive)setError(cause instanceof Error?cause.message:"No se pudo cargar la videoteca.")}
 finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[router]);
 async function create(event:React.FormEvent){
  event.preventDefault();if(busy)return;
  if(!id){setError("Ingresá una URL válida de YouTube.");return}
  if(title.trim().length<5||description.length>420||!Number.isInteger(order)||order<0||order>10000){setError("Revisá los datos del video.");return}
  setBusy(true);setError("");setNotice("");
  try{
   const db=supabase();if(!db)throw Error("Sin conexión.");
   const {error:writeError}=await db.from("editorial_videos").insert({
    youtube_id:id,title:title.trim(),description:description.trim(),category,display_order:order,status:"draft"
   });
   if(writeError)throw writeError;
   setUrl("");setTitle("");setDescription("");setCategory("stream");setOrder(100);
   await refresh();setNotice("Video guardado como borrador. No aparece aún en el sitio público.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo crear el video.")}
  finally{setBusy(false)}
 }
 async function statusChange(video:EditorialVideo,status:"published"|"archived"|"draft"){
  if(busy)return;
  if(!window.confirm("¿Confirmás cambiar el estado de «"+video.title+"»?"))return;
  setBusy(true);setError("");setNotice("");
  try{
   const db=supabase();if(!db)throw Error("Sin conexión.");
   const {data,error:writeError}=await db.from("editorial_videos")
    .update({status,published_at:status==="published"?(video.published_at??new Date().toISOString()):video.published_at,updated_at:new Date().toISOString()})
    .eq("id",video.id).select("id").maybeSingle();
   if(writeError||!data)throw Error(writeError?.message??"No fue posible guardar el cambio.");
   await refresh();setNotice(status==="published"?"Video publicado en la videoteca y en la portada.":"Estado actualizado.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo cambiar el estado.")}
  finally{setBusy(false)}
 }
 async function changeOrder(video:EditorialVideo,display_order:number){
  if(busy)return;
  if(!Number.isInteger(display_order)||display_order<0||display_order>10000){setError("El orden debe estar entre 0 y 10.000.");return}
  setBusy(true);setError("");setNotice("");
  try{
   const db=supabase();if(!db)throw Error("Sin conexión.");
   const {data,error:writeError}=await db.from("editorial_videos").update({display_order,updated_at:new Date().toISOString()}).eq("id",video.id).select("id").maybeSingle();
   if(writeError||!data)throw Error(writeError?.message??"No se pudo actualizar el orden.");
   await refresh();setNotice("Orden actualizado.");
  }catch(cause){setError(cause instanceof Error?cause.message:"Error al ordenar.")}
  finally{setBusy(false)}
 }
 return <main className="container main editorial-dashboard">
  <Link href="/admin/configuracion" className="more-link">← Configuración general</Link>
  <div className="eyebrow" style={{marginTop:28}}>CONTENIDOS / AUDIOVISUAL</div><h1>Videoteca de Pesse</h1>
  <p className="dashboard-subtitle">Cargá enlaces oficiales de YouTube para mostrar programas, entrevistas, coberturas y Pesse Stream. Las miniaturas se obtienen directamente de YouTube.</p>
  {error&&<p role="alert" className="writing-upload-notice">{error}</p>}
  {notice&&<p role="status" className="writing-upload-notice">{notice}</p>}
  {loading?<p role="status">Cargando videos...</p>:allowed&&<>
   <section className="admin-shell" style={{maxWidth:830,marginTop:24}}>
    <h2>Agregar video</h2>
    <form className="editor-form" onSubmit={create}>
     <label>Enlace de YouTube<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></label>
     {url.length>0&&!id&&<p role="alert" className="muted">El enlace debe corresponder a un video de YouTube, Shorts o una emisión en vivo.</p>}
     {id&&<div style={{maxWidth:280}}><img src={youtubeThumbnailUrl(id)} alt="Vista previa de la miniatura" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",borderRadius:8}}/></div>}
     <label>Título<input required maxLength={180} minLength={5} value={title} onChange={e=>setTitle(e.target.value)}/></label>
     <label>Descripción<textarea maxLength={420} rows={3} value={description} onChange={e=>setDescription(e.target.value)}/></label>
     <label>Tipo<select value={category} onChange={e=>setCategory(e.target.value as EditorialVideo["category"])}>{types.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>
     <label>Orden (menor aparece antes)<input type="number" min={0} max={10000} value={order} onChange={e=>setOrder(Number(e.target.value))}/></label>
     <p className="muted">Primero se guardará como borrador. Comprobá título y miniatura antes de publicarlo.</p>
     <button className="primary-button" disabled={busy||!id} type="submit">{busy?"Guardando...":"Guardar video como borrador"}</button>
    </form>
   </section>
   <section style={{marginTop:30}}><h2>Videos cargados</h2>
    {rows.length===0?<p className="muted">Todavía no hay videos cargados. La sección pública mostrará un enlace al canal de Pesse.</p>:<div className="editor-list">{rows.map(video=><article className="editor-row" key={video.id} style={{alignItems:"flex-start",flexWrap:"wrap"}}>
     <div style={{display:"flex",gap:15,alignItems:"flex-start",flexWrap:"wrap"}}>
      <img src={youtubeThumbnailUrl(video.youtube_id)} alt="" style={{width:145,aspectRatio:"16/9",objectFit:"cover",borderRadius:6}}/>
      <div style={{maxWidth:420}}><strong>{video.title}</strong><p className="muted">{videoCategoryLabels[video.category]} · {video.status}</p><a className="more-link" href={youtubeWatchUrl(video.youtube_id)} target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a></div>
     </div>
     <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <label style={{fontSize:12}}>Orden <input aria-label={"Orden de "+video.title} type="number" min={0} max={10000} defaultValue={video.display_order} key={video.id+"-"+video.display_order} onBlur={e=>{const n=Number(e.target.value);if(n!==video.display_order)void changeOrder(video,n)}} style={{width:75,padding:7}}/></label>
      {video.status!=="published"&&<button className="secondary-button" disabled={busy} onClick={()=>void statusChange(video,"published")} type="button">Publicar</button>}
      {video.status==="published"&&<button className="secondary-button" disabled={busy} onClick={()=>void statusChange(video,"draft")} type="button">Ocultar</button>}
      {video.status!=="archived"&&<button className="secondary-button" disabled={busy} onClick={()=>void statusChange(video,"archived")} type="button">Archivar</button>}
     </div>
    </article>)}</div>}
   </section>
  </>}
 </main>;
}
