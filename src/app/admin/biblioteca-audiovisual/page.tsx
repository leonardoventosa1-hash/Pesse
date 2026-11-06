"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";
import {youtubeIdFromUrl,youtubeThumbnailUrl,youtubeWatchUrl,type EditorialVideo} from "@/lib/editorial-videos";

type Category="entrevista"|"cobertura"|"videos";
type Status="draft"|"published"|"archived";
type EditForm={url:string;title:string;description:string;category:Category;status:Status};
const categories:Record<Category,string>={entrevista:"Entrevistas",cobertura:"Coberturas",videos:"Clips y otros videos"};
const statusLabel:Record<Status,string>={draft:"Borrador",published:"Publicado",archived:"Archivado"};
const blank:EditForm={url:"",title:"",description:"",category:"entrevista",status:"draft"};
const projection="id,youtube_id,title,description,category,status,display_order,published_at,created_at";

export default function BibliotecaAudiovisual(){
 const router=useRouter();
 const [authorized,setAuthorized]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [videos,setVideos]=useState<EditorialVideo[]>([]);
 const [editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<EditForm>(blank);
 const [filter,setFilter]=useState<"all"|Category>("all");
 const [statusFilter,setStatusFilter]=useState<"all"|Status>("all");
 const [query,setQuery]=useState("");
 const [notice,setNotice]=useState("");
 const [reload,setReload]=useState(0);
 const id=youtubeIdFromUrl(form.url);
 useEffect(()=>{let active=true;(async()=>{
  try{
   const db=supabase();if(!db)throw Error("Supabase no está configurado.");
   const {data:{user},error:authError}=await db.auth.getUser();
   if(authError)throw authError;
   if(!user){router.replace("/admin/login");return}
   if(await getRole()!=="admin"){router.replace("/admin");return}
   const result=await db.from("editorial_videos").select(projection)
    .neq("category","stream").order("created_at",{ascending:false}).limit(200);
   if(result.error)throw result.error;
   if(active){setVideos((result.data??[]) as EditorialVideo[]);setAuthorized(true);setNotice("")}
  }catch(e){if(active)setNotice("No se pudo cargar la biblioteca: "+(e instanceof Error?e.message:"Error desconocido"))}
  finally{if(active)setLoading(false)}
 })();return()=>{active=false}},[router,reload]);
 const visible=useMemo(()=>videos.filter(v=>
  (filter==="all"||v.category===filter)&&
  (statusFilter==="all"||v.status===statusFilter)&&
  (v.title+" "+v.description+" "+v.youtube_id).toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es").trim())
 ),[videos,filter,statusFilter,query]);
 function edit(video:EditorialVideo){
  setEditing(video.id);
  setForm({url:youtubeWatchUrl(video.youtube_id),title:video.title,description:video.description,
   category:video.category==="stream"?"videos":video.category,status:video.status});
  setNotice("");
  document.getElementById("video-library-editor")?.scrollIntoView({behavior:"smooth",block:"start"});
 }
 function clear(){setEditing(null);setForm(blank);setNotice("")}
 async function save(){
  if(!authorized||saving)return;
  if(!id){setNotice("Pegá un enlace válido de YouTube.");return}
  const title=form.title.trim(),description=form.description.trim();
  if(title.length<5||title.length>180){setNotice("El título debe tener entre 5 y 180 caracteres.");return}
  if(description.length>1000){setNotice("La descripción no puede superar los 1000 caracteres.");return}
  const current=videos.find(v=>v.id===editing);
  if(form.status==="published"&&current?.status!=="published"&&!window.confirm("¿Publicar este video en el catálogo visible para los lectores de Pesse?"))return;
  const db=supabase();if(!db)return;
  setSaving(true);setNotice("Guardando video…");
  try{
   const now=new Date().toISOString();
   const payload={youtube_id:id,title,description,category:form.category,status:form.status,
    published_at:form.status==="published"?(current?.status==="published"?current.published_at||now:now):current?.published_at??null};
   const response=editing?
    await db.from("editorial_videos").update(payload).eq("id",editing).neq("category","stream").select(projection).single():
    await db.from("editorial_videos").insert({...payload,display_order:100}).select(projection).single();
   if(response.error||!response.data)throw response.error||Error("No se devolvió el video guardado.");
   const saved=response.data as EditorialVideo;
   setVideos(prev=>[saved,...prev.filter(v=>v.id!==saved.id)]);
   setEditing(saved.id);
   setForm({...form,url:youtubeWatchUrl(saved.youtube_id),title:saved.title,description:saved.description,status:saved.status});
   setNotice(saved.status==="published"?"Video publicado en la sección de Pesse Stream.":"Cambios guardados. El video no es público.");
  }catch(e){setNotice("No se pudo guardar: "+(e instanceof Error?e.message:"Error desconocido"))}
  finally{setSaving(false)}
 }
 async function changeStatus(video:EditorialVideo,next:"draft"|"published"|"archived"){
  if(!authorized||saving||video.status===next)return;
  const prompt=next==="published"?"¿Publicar «"+video.title+"» para los lectores?":
   next==="archived"?"¿Archivar «"+video.title+"» y retirarlo del catálogo público?":
   "¿Guardar «"+video.title+"» como borrador y retirarlo del catálogo público?";
  if(!window.confirm(prompt))return;
  const db=supabase();if(!db)return;
  setSaving(true);setNotice("Actualizando estado…");
  const {data,error}=await db.from("editorial_videos")
   .update({status:next,published_at:next==="published"?new Date().toISOString():video.published_at})
   .eq("id",video.id).neq("category","stream").eq("status",video.status).select(projection).maybeSingle();
  if(error||!data){setNotice("No se pudo actualizar el estado: "+(error?.message??"Otro integrante pudo modificar el video. Actualizá la biblioteca."));setSaving(false);return}
  setVideos(prev=>prev.map(v=>v.id===video.id?data as EditorialVideo:v));
  if(editing===video.id)setForm(prev=>({...prev,status:next}));
  setNotice(next==="published"?"Video publicado.":next==="archived"?"Video archivado.":"Video guardado como borrador.");
  setSaving(false);
 }
 return <main className="container main video-library-admin">
  <Link className="more-link" href="/admin">← Volver a la sala de redacción</Link>
  <div className="eyebrow">PESSE · CONTENIDOS AUDIOVISUALES</div>
  <h1>Biblioteca audiovisual</h1>
  <p>Organizá entrevistas, coberturas y clips con enlaces a YouTube. Los borradores y los archivos no aparecen en la web pública.</p>
  <div className="video-library-nav"><Link className="secondary-button" href="/admin/stream">Administrar video destacado de Pesse Stream</Link><Link className="secondary-button" href="/videos" target="_blank" rel="noopener noreferrer">Ver sección pública ↗</Link></div>
  {loading?<p role="status">Cargando biblioteca…</p>:!authorized?<p role="alert">{notice||"No tenés permisos para gestionar videos."}</p>:<>
   <section id="video-library-editor" className="video-library-editor" aria-label="Formulario de video">
    <div className="video-library-section-heading"><h2>{editing?"Editar video":"Agregar video"}</h2>{editing&&<button type="button" className="secondary-button" onClick={clear}>Crear otro video</button>}</div>
    <form onSubmit={e=>{e.preventDefault();void save()}}>
     <div className="video-library-fields">
      <label>Enlace de YouTube<input required type="url" value={form.url} onChange={e=>setForm(v=>({...v,url:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." aria-invalid={Boolean(form.url&&!id)}/></label>
      <label>Título<input required minLength={5} maxLength={180} value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} placeholder="Título del video"/></label>
      <label>Tipo de video<select value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value as Category}))}>
       {Object.entries(categories).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select></label>
      <label>Visibilidad<select value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value as Status}))}>
       <option value="draft">Borrador (privado)</option><option value="published">Publicado (visible)</option><option value="archived">Archivado (privado)</option>
      </select></label>
     </div>
     <label>Descripción (opcional)<textarea rows={3} maxLength={1000} value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} placeholder="Resumen del programa o fragmento"/></label>
     {id&&<div className="video-library-link-preview"><img src={youtubeThumbnailUrl(id)} alt="Miniatura del video seleccionado" width={144} height={81}/><a href={youtubeWatchUrl(id)} target="_blank" rel="noopener noreferrer">Comprobar el video en YouTube ↗</a></div>}
     <button type="submit" className="primary-button" disabled={saving||!id||form.title.trim().length<5}>{saving?"Guardando…":editing?"Guardar cambios":"Agregar video"}</button>
    </form>
   </section>
   <section className="video-library-catalog" aria-label="Videos guardados">
    <div className="video-library-section-heading"><h2>Videos guardados ({videos.length})</h2><button type="button" className="secondary-button" disabled={saving} onClick={()=>{setLoading(true);setReload(n=>n+1)}}>Actualizar</button></div>
    <div className="video-library-filters">
     <input aria-label="Buscar videos" type="search" placeholder="Buscar por título o descripción" value={query} onChange={e=>setQuery(e.target.value)}/>
     <select aria-label="Filtrar por tipo" value={filter} onChange={e=>setFilter(e.target.value as Category|"all")}><option value="all">Todos los tipos</option>{Object.entries(categories).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
     <select aria-label="Filtrar por estado" value={statusFilter} onChange={e=>setStatusFilter(e.target.value as Status|"all")}><option value="all">Todos los estados</option>{Object.entries(statusLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
    </div>
    {visible.length===0?<p>No hay videos con esos filtros.</p>:<div className="video-library-list">{visible.map(video=><article className="video-library-entry" key={video.id}>
     <img src={youtubeThumbnailUrl(video.youtube_id)} alt="" width={130} height={73} loading="lazy"/>
     <div className="video-library-entry-content"><strong>{video.title}</strong><span>{categories[video.category as Category]} · {statusLabel[video.status]} · {video.created_at?new Date(video.created_at).toLocaleDateString("es-AR"):""}</span>
      {video.description&&<p>{video.description}</p>}</div>
     <div className="video-library-entry-actions">
      <button type="button" className="secondary-button" disabled={saving} onClick={()=>edit(video)}>Editar</button>
      {video.status!=="published"&&<button type="button" className="secondary-button" disabled={saving} onClick={()=>void changeStatus(video,"published")}>Publicar</button>}
      {video.status==="published"&&<button type="button" className="secondary-button" disabled={saving} onClick={()=>void changeStatus(video,"draft")}>Retirar</button>}
      {video.status!=="archived"&&<button type="button" className="secondary-button" disabled={saving} onClick={()=>void changeStatus(video,"archived")}>Archivar</button>}
      <a href={youtubeWatchUrl(video.youtube_id)} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
     </div>
    </article>)}</div>}
   </section>
   {notice&&<p className="video-library-notice" role="status" aria-live="polite">{notice}</p>}
  </>}
 </main>;
}
