"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";
import {youtubeIdFromUrl,youtubeWatchUrl} from "@/lib/editorial-videos";

type SavedStream={id:string;youtube_id:string;title:string;description:string;status:string;published_at:string|null};
export default function StreamSettings(){
 const router=useRouter();
 const [authorized,setAuthorized]=useState(false);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [url,setUrl]=useState("");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [record,setRecord]=useState<SavedStream|null>(null);
 const [notice,setNotice]=useState("");
 const id=youtubeIdFromUrl(url);
 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    const db=supabase();if(!db)throw Error("Supabase no está configurado.");
    const {data:{user},error}=await db.auth.getUser();if(error)throw error;
    if(!user){router.replace("/admin/login");return}
    const role=await getRole();
    if(role!=="admin"){router.replace("/admin");return}
    const result=await db.from("editorial_videos")
     .select("id,youtube_id,title,description,status,published_at")
     .eq("category","stream").order("published_at",{ascending:false,nullsFirst:false}).limit(1).maybeSingle();
    if(result.error)throw result.error;
    if(!active)return;
    setAuthorized(true);
    const current=result.data as SavedStream|null;
    if(current){
     setRecord(current);
     setUrl(youtubeWatchUrl(current.youtube_id));
     setTitle(current.title);
     setDescription(current.description);
    }
   }catch(error){
    if(active)setNotice("No se pudo cargar la configuración: "+(error instanceof Error?error.message:"Error desconocido"));
   }finally{if(active)setLoading(false)}
  })();
  return ()=>{active=false};
 },[router]);
 async function publish(){
  if(!authorized||busy||!id)return;
  const cleanedTitle=title.trim()||"Pesse Stream · Última emisión";
  if(cleanedTitle.length>180){setNotice("El título debe tener hasta 180 caracteres.");return}
  if(description.trim().length>1000){setNotice("La descripción debe tener hasta 1000 caracteres.");return}
  const db=supabase();if(!db)return;
  setBusy(true);setNotice("Guardando el video destacado…");
  try{
   const date=new Date().toISOString();
   const data={youtube_id:id,title:cleanedTitle,description:description.trim(),category:"stream",status:"published",published_at:date,display_order:0};
   const result=record
    ?await db.from("editorial_videos").update(data).eq("id",record.id).select("id,youtube_id,title,description,status,published_at").single()
    :await db.from("editorial_videos").insert(data).select("id,youtube_id,title,description,status,published_at").single();
   if(result.error||!result.data)throw result.error||Error("No se devolvió el registro guardado.");
   setRecord(result.data as SavedStream);
   setTitle(cleanedTitle);
   setNotice("Video destacado guardado. Aparecerá en la portada y en Pesse Stream al volver a cargar la página.");
  }catch(error){setNotice("No se pudo guardar el video: "+(error instanceof Error?error.message:"Error desconocido"))}
  finally{setBusy(false)}
 }
 async function hide(){
  if(!authorized||busy||!record||record.status!=="published"||!window.confirm("¿Retirar el video destacado de la portada?"))return;
  const db=supabase();if(!db)return;
  setBusy(true);setNotice("Retirando video…");
  try{
   const {data,error}=await db.from("editorial_videos").update({status:"draft"}).eq("id",record.id).select("id,youtube_id,title,description,status,published_at").single();
   if(error||!data)throw error||Error("No se pudo retirar el video.");
   setRecord(data as SavedStream);
   setNotice("El video dejó de estar destacado. La portada mostrará el contenido alternativo.");
  }catch(error){setNotice("No se pudo retirar el video: "+(error instanceof Error?error.message:"Error desconocido"))}
  finally{setBusy(false)}
 }
 return <main className="container main stream-admin-page">
  <Link className="more-link" href="/admin">← Volver a la sala de redacción</Link>
  <h1>Video destacado de Pesse Stream</h1>
  <p>Copiá el enlace del vivo que quedó grabado en YouTube.</p>
  {loading?<p role="status">Cargando configuración…</p>:authorized?<div className="stream-admin-grid">
   <form className="stream-admin-form" onSubmit={e=>{e.preventDefault();void publish()}}>
    <label htmlFor="stream-video-url">Enlace del video de YouTube</label>
    <input id="stream-video-url" type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" aria-invalid={Boolean(url.trim()&&!id)}/>
    <small>Admite enlaces de YouTube, YouTube Live y youtu.be. Pegá el enlace del vivo finalizado.</small>
    {url.trim()&&!id&&<p className="stream-admin-error" role="alert">Ingresá un enlace válido a un video de YouTube.</p>}
    <label htmlFor="stream-video-title">Título que se mostrará en Pesse</label>
    <input id="stream-video-title" type="text" maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Pesse Stream · Programa del lunes"/>
    <label htmlFor="stream-video-description">Descripción (opcional)</label>
    <textarea id="stream-video-description" rows={4} maxLength={1000} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Temas destacados de esta emisión…"/>
    <div className="stream-admin-actions">
     <button type="submit" className="primary-button" disabled={!id||busy}>{busy?"Guardando…":"Guardar y destacar video"}</button>
     {record?.status==="published"&&<button type="button" className="secondary-button" disabled={busy} onClick={()=>void hide()}>Retirar destacado</button>}
    </div>
    {notice&&<p className="stream-admin-notice" role="status" aria-live="polite">{notice}</p>}
    <p className="stream-admin-help">Solo los administradores pueden modificar este video. El cambio no afecta las noticias ni publica contenido nuevo en YouTube.</p>
   </form>
   <aside className="stream-admin-preview">
    <h2>Vista previa</h2>
    {id?<><div className="stream-admin-frame"><iframe src={"https://www.youtube-nocookie.com/embed/"+id+"?rel=0"} title="Vista previa del video destacado" loading="lazy" allow="encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><p>{title.trim()||"Pesse Stream · Última emisión"}</p></>:<p>Ingresá un enlace para ver el reproductor.</p>}
    <Link href="/" target="_blank" rel="noopener noreferrer">Abrir portada ↗</Link>
   </aside>
  </div>:<p role="alert">{notice||"No tenés permisos para gestionar Pesse Stream."}</p>}
 </main>;
}
