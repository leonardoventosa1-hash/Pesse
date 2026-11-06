"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";

type Request={
 id:string;article_id:string;author_id:string;status:"pending"|"changes_requested"|"approved";note:string;
 requested_at:string;reviewed_at:string|null;
 article:{id:string;title:string;status:string;slug:string;deleted_at:string|null}|null;
};
export default function EditorialQueue(){
 const router=useRouter();
 const [role,setRole]=useState<"admin"|"redactor"|null>(null);
 const [requests,setRequests]=useState<Request[]>([]);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 const [notes,setNotes]=useState<Record<string,string>>({});
 const [busyId,setBusyId]=useState<string|null>(null);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{let active=true;(async()=>{
  try{
   const db=supabase();if(!db)throw Error("No se configuró Supabase.");
   const {data:{user},error}=await db.auth.getUser();if(error)throw error;
   if(!user){router.replace("/admin/login");return}
   const r=await getRole();if(!r)throw Error("No tenés permisos editoriales.");
   const response=await db.from("editorial_review_requests").select("id,article_id,author_id,status,note,requested_at,reviewed_at,article:articles(id,title,status,slug,deleted_at)").order("requested_at",{ascending:false}).limit(100);
   if(response.error)throw response.error;
   if(active){setRole(r);setRequests((response.data??[]) as unknown as Request[]);setMessage("")}
  }catch(e){if(active)setMessage(e instanceof Error?e.message:"No se pudo abrir la bandeja.")}
  finally{if(active)setLoading(false)}
 })();return()=>{active=false}},[router,refresh]);
 async function review(request:Request,decision:"approved"|"changes_requested"){
  if(role!=="admin"||busyId||request.status!=="pending"||request.article?.status!=="draft"||request.article.deleted_at)return;
  const note=(notes[request.id]??"").trim();
  if(decision==="changes_requested"&&!note){setMessage("Escribí primero qué debe corregir el redactor.");return}
  const db=supabase();if(!db)return;
  setBusyId(request.id);setMessage("Guardando revisión...");
  try{
   const {data:{user},error:authError}=await db.auth.getUser();
   if(authError||!user)throw authError||new Error("La sesión expiró.");
   const {data,error}=await db.from("editorial_review_requests").update({
    status:decision,note,reviewer_id:user.id,reviewed_at:new Date().toISOString()
   }).eq("id",request.id).eq("status","pending").select("id").maybeSingle();
   if(error||!data)throw error||new Error("La solicitud ya cambió de estado.");
   setRequests(items=>items.map(item=>item.id===request.id?{...item,status:decision,note,reviewed_at:new Date().toISOString()}:item));
   setMessage(decision==="approved"?"Revisión aprobada. La noticia NO se publicó.":"Correcciones solicitadas y registradas.");
  }catch(e){setMessage(e instanceof Error?e.message:"No se pudo actualizar la revisión.")}
  finally{setBusyId(null)}
 }
 const pending=requests.filter(request=>request.status==="pending");
 const history=requests.filter(request=>request.status!=="pending");
 return <main className="container main editorial-queue">
  <Link href="/admin" className="more-link">← Volver a la sala de redacción</Link>
  <div className="eyebrow">PESSE · EQUIPO EDITORIAL</div>
  <h1>Noticias pendientes de revisión</h1>
  <p>Las solicitudes son privadas y requieren iniciar sesión. La aprobación editorial no publica automáticamente una noticia.</p>
  <button type="button" className="secondary-button" disabled={loading} onClick={()=>{setLoading(true);setRefresh(n=>n+1)}}>Actualizar bandeja</button>
  {message&&<p role="status" className="editorial-queue-notice">{message}</p>}
  {loading?<p role="status">Cargando solicitudes…</p>:<>
   <h2>Pendientes ({pending.length})</h2>
   {pending.length===0&&<p>No hay solicitudes pendientes a las que tengas acceso.</p>}
   <div className="editorial-queue-list">{pending.map(request=><article key={request.id} className="editorial-queue-card">
    <div><strong>{request.article?.title??"Noticia no disponible"}</strong><p>Enviada el {new Date(request.requested_at).toLocaleString("es-AR")} · {request.article?.status==="draft"?"Borrador":"La noticia ya no es un borrador"}</p></div>
    <div className="editorial-queue-card-actions">
     {request.article&&<Link className="secondary-button" href={"/admin/editar/"+request.article_id}>Abrir noticia privada</Link>}
     {role==="admin"&&request.article?.status==="draft"&&!request.article.deleted_at&&<>
      <label>Observaciones para el redactor<textarea rows={3} maxLength={2000} value={notes[request.id]??""} onChange={e=>setNotes(current=>({...current,[request.id]:e.target.value}))} placeholder="Indicá datos a verificar o correcciones necesarias..."/></label>
      <button type="button" className="secondary-button" disabled={busyId!==null} onClick={()=>void review(request,"changes_requested")}>Solicitar correcciones</button>
      <button type="button" className="primary-button" disabled={busyId!==null} onClick={()=>void review(request,"approved")}>Aprobar revisión</button>
     </>}
    </div>
   </article>)}</div>
   <h2>Revisiones anteriores ({history.length})</h2>
   <div className="editorial-queue-list">{history.map(request=><article key={request.id} className="editorial-queue-card">
    <strong>{request.article?.title??"Noticia no disponible"}</strong>
    <span>{request.status==="approved"?"Aprobada":"Correcciones solicitadas"} · {request.reviewed_at?new Date(request.reviewed_at).toLocaleString("es-AR"):""}</span>
    {request.note&&<p>{request.note}</p>}
    {request.article&&<Link href={"/admin/editar/"+request.article_id}>Ver noticia privada</Link>}
   </article>)}</div>
  </>}
 </main>;
}
