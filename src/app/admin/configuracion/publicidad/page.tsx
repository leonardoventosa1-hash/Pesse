"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";
import {mediaBucket,mediaUrl,validMediaPath,type Banner} from "@/lib/brand-ads";

const validFile=(file:File)=>["image/jpeg","image/png","image/webp"].includes(file.type)&&file.size<=5*1024*1024&&file.size>0;
const ext=(file:File)=>file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
const localDate=(value:string|null)=>value?new Date(value).toLocaleString("es-AR"):"Sin fecha";
export default function Advertising(){
 const router=useRouter();
 const [allowed,setAllowed]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [rows,setRows]=useState<Banner[]>([]),[message,setMessage]=useState(""),[error,setError]=useState("");
 const [advertiser,setAdvertiser]=useState(""),[description,setDescription]=useState(""),[destination,setDestination]=useState("");
 const [placement,setPlacement]=useState<Banner["placement"]>("home_mid");
 const [starts,setStarts]=useState(""),[ends,setEnds]=useState(""),[file,setFile]=useState<File|null>(null);
 async function load(){
  const db=supabase();if(!db)throw Error("No hay conexión con Supabase.");
  const {data,error:readError}=await db.from("sponsor_banners").select("id,advertiser_name,alt_text,image_path,target_url,placement,status,starts_at,ends_at,created_at").order("created_at",{ascending:false}).limit(100);
  if(readError)throw readError;
  setRows((data??[]) as Banner[]);
 }
 useEffect(()=>{let active=true;(async()=>{try{
  const db=supabase();if(!db)throw Error("No hay conexión con Supabase.");
  const {data:{user}}=await db.auth.getUser();
  if(!active)return;
  if(!user){router.replace("/admin/login");return}
  if(await getRole()!=="admin"){router.replace("/admin");return}
  setAllowed(true);await load();
 }catch(cause){if(active)setError(cause instanceof Error?cause.message:"No se pudieron leer los anuncios.")}
 finally{if(active)setLoading(false)}})();return()=>{active=false}},[router]);
 async function create(e:React.FormEvent){
  e.preventDefault();if(busy)return;setError("");setMessage("");
  if(!file||!validFile(file)){setError("Seleccioná una imagen JPG, PNG o WebP de hasta 5 MB.");return}
  if(advertiser.trim().length<2||description.trim().length<5){setError("Completá el anunciante y un texto alternativo descriptivo.");return}
  let url:URL;try{url=new URL(destination)}catch{setError("Ingresá un enlace válido.");return}
  if(url.protocol!=="https:"||url.username||url.password){setError("Los destinos publicitarios deben usar HTTPS y no incluir credenciales.");return}
  if(!starts||!Number.isFinite(new Date(starts).getTime())){setError("Elegí una fecha de inicio.");return}
  if(ends&&new Date(ends).getTime()<=new Date(starts).getTime()){setError("El fin debe ser posterior al inicio.");return}
  const db=supabase();if(!db)return;
  setBusy(true);
  try{
   const path="sponsors/"+crypto.randomUUID()+"."+ext(file);
   const {error:uploadError}=await db.storage.from(mediaBucket).upload(path,file,{contentType:file.type,upsert:false});
   if(uploadError)throw uploadError;
   const {error:insertError}=await db.from("sponsor_banners").insert({
    advertiser_name:advertiser.trim(),alt_text:description.trim(),image_path:path,target_url:url.toString(),
    placement,status:"draft",starts_at:new Date(starts).toISOString(),ends_at:ends?new Date(ends).toISOString():null
   });
   if(insertError)throw Error(insertError.message+" (La imagen se subió, pero el aviso no se guardó).");
   setFile(null);setAdvertiser("");setDescription("");setDestination("");setStarts("");setEnds("");
   const input=document.getElementById("banner-upload") as HTMLInputElement|null;if(input)input.value="";
   await load();setMessage("Anuncio guardado como borrador. No se mostrará hasta programarlo.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo guardar el anuncio.")}
  finally{setBusy(false)}
 }
 async function changeStatus(row:Banner,status:Banner["status"]){
  if(busy)return;
  if(status==="scheduled"&&!row.starts_at){setError("El anuncio requiere fecha de inicio antes de programarlo.");return}
  if(!window.confirm("¿Cambiar «"+row.advertiser_name+"» a "+status+"?"))return;
  const db=supabase();if(!db)return;
  setBusy(true);setError("");setMessage("");
  try{
   const {data,error:changeError}=await db.from("sponsor_banners").update({status,updated_at:new Date().toISOString()}).eq("id",row.id).select("id").maybeSingle();
   if(changeError||!data)throw Error(changeError?.message??"No se pudo actualizar el anuncio.");
   await load();setMessage(status==="scheduled"?"Campaña programada; se mostrará durante su período activo.":"Estado actualizado.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo actualizar.")}
  finally{setBusy(false)}
 }
 return <main className="container main editorial-dashboard">
  <Link className="more-link" href="/admin/configuracion">← Configuración general</Link>
  <div className="eyebrow" style={{marginTop:28}}>MONETIZACIÓN / ADMINISTRACIÓN</div>
  <h1>Espacios publicitarios</h1>
  <p className="dashboard-subtitle">Administrá banners patrocinados con fecha de inicio, fin y ubicación. Los nuevos anuncios se crean como borradores, sin aparecer automáticamente en la web.</p>
  {error&&<p role="alert" className="writing-upload-notice">{error}</p>}
  {message&&<p role="status" className="writing-upload-notice">{message}</p>}
  {loading?<p role="status">Comprobando permisos y campañas...</p>:allowed&&<>
   <section className="admin-shell" style={{maxWidth:820,marginTop:24}}>
    <h2>Nueva campaña</h2>
    <form className="editor-form" onSubmit={create}>
     <label>Marca o anunciante<input required maxLength={110} value={advertiser} onChange={e=>setAdvertiser(e.target.value)}/></label>
     <label>Texto alternativo de la imagen<input required minLength={5} maxLength={180} value={description} onChange={e=>setDescription(e.target.value)}/></label>
     <label>Destino del anuncio (HTTPS)<input type="url" required maxLength={1500} value={destination} onChange={e=>setDestination(e.target.value)} placeholder="https://..."/></label>
     <label>Imagen JPG, PNG o WebP (máximo 5 MB)<input id="banner-upload" type="file" required accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)}/></label>
     <label>Ubicación<select value={placement} onChange={e=>setPlacement(e.target.value as Banner["placement"])}><option value="home_mid">Portada · después de noticias</option><option value="home_bottom">Portada · pie de contenido</option></select></label>
     <label>Inicio de campaña<input type="datetime-local" required value={starts} onChange={e=>setStarts(e.target.value)}/></label>
     <label>Fin de campaña (opcional)<input type="datetime-local" value={ends} onChange={e=>setEnds(e.target.value)}/></label>
     <button className="primary-button" type="submit" disabled={busy}>{busy?"Guardando...":"Guardar borrador"}</button>
    </form>
   </section>
   <section style={{marginTop:28}}><h2>Campañas creadas</h2>
    {rows.length===0?<p className="muted">Todavía no hay campañas. La portada no mostrará espacios publicitarios vacíos.</p>:
    <div className="editor-list">{rows.map(row=><article className="editor-row" key={row.id} style={{flexWrap:"wrap",gap:16}}>
     <div style={{maxWidth:540}}>
      <strong>{row.advertiser_name}</strong>
      <p className="muted">Estado: {row.status} · {row.placement==="home_mid"?"Portada central":"Portada inferior"}</p>
      <p className="muted">Inicio: {localDate(row.starts_at)} · Fin: {localDate(row.ends_at)}</p>
      {validMediaPath(row.image_path,"sponsors")&&mediaUrl(row.image_path,"sponsors")&&<img src={mediaUrl(row.image_path,"sponsors")!} alt={row.alt_text} loading="lazy" style={{maxWidth:260,width:"100%",height:"auto",borderRadius:8}}/>}
     </div>
     <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {row.status!=="scheduled"&&<button className="secondary-button" type="button" disabled={busy} onClick={()=>void changeStatus(row,"scheduled")}>Programar</button>}
      {row.status==="scheduled"&&<button className="secondary-button" type="button" disabled={busy} onClick={()=>void changeStatus(row,"paused")}>Pausar</button>}
      {row.status!=="archived"&&<button className="secondary-button" type="button" disabled={busy} onClick={()=>void changeStatus(row,"archived")}>Archivar</button>}
     </div>
    </article>)}</div>}
   </section>
  </>}
 </main>;
}