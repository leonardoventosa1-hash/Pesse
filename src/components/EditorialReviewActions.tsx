"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "@/lib/supabase";

type Review={id:string;status:"pending"|"changes_requested"|"approved";note:string;requested_at:string;reviewed_at:string|null};
export default function EditorialReviewActions({articleId,status,unsavedChanges}:{articleId?:string;status:"draft"|"published";unsavedChanges:boolean}){
 const [reviews,setReviews]=useState<Review[]>([]);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{if(!articleId)return;let active=true;(async()=>{const db=supabase();if(!db)return;const {data,error}=await db.from("editorial_review_requests").select("id,status,note,requested_at,reviewed_at").eq("article_id",articleId).order("requested_at",{ascending:false}).limit(10);if(active){if(error)setMessage("No se pudo consultar el estado de revisión: "+error.message);else setReviews((data??[]) as Review[])}})();return()=>{active=false}},[articleId]);
 if(!articleId)return null;
 const latest=reviews[0];
 const pending=reviews.some(item=>item.status==="pending");
 async function submit(){
  if(!articleId||status!=="draft"||unsavedChanges||busy||pending)return;
  const db=supabase();if(!db)return;
  setBusy(true);setMessage("Enviando borrador a revisión…");
  try{
   const {data:{user},error:authError}=await db.auth.getUser();
   if(authError||!user)throw authError||new Error("Necesitás iniciar sesión.");
   const {data,error}=await db.from("editorial_review_requests").insert({article_id:articleId,author_id:user.id,status:"pending"}).select("id,status,note,requested_at,reviewed_at").single();
   if(error)throw error;
   setReviews(prev=>[data as Review,...prev]);
   setMessage("Solicitud enviada. Un administrador podrá verla en la bandeja de revisión.");
  }catch(error){setMessage("No se pudo enviar la solicitud: "+(error instanceof Error?error.message:"Error desconocido"))}
  finally{setBusy(false)}
 }
 function copyLink(){
  const url=window.location.origin+"/admin/editar/"+encodeURIComponent(articleId!);
  void navigator.clipboard.writeText(url).then(()=>setMessage("Enlace privado copiado. Requiere iniciar sesión y contar con permisos editoriales."),()=>setMessage("No se pudo copiar automáticamente el enlace."));
 }
 return <section className="editorial-review-actions" aria-label="Circuito de revisión">
  <div><h2>Revisión entre integrantes</h2><p>Solicitá una lectura antes de publicar. Solo los usuarios autorizados pueden acceder al borrador.</p></div>
  <p className="editorial-review-state">{latest?latest.status==="pending"?"Pendiente de revisión":latest.status==="approved"?"Revisión aprobada — la publicación sigue siendo manual":"Correcciones solicitadas":"Todavía no se solicitó revisión para esta noticia."}</p>
  {latest?.note&&<blockquote className="editorial-review-note"><strong>Observaciones:</strong> {latest.note}</blockquote>}
  <div className="editorial-review-buttons">
   <button type="button" className="secondary-button" disabled={busy||pending||unsavedChanges||status!=="draft"} onClick={()=>void submit()}>{busy?"Enviando…":latest?.status==="changes_requested"?"Reenviar a revisión":"Enviar a revisión"}</button>
   <button type="button" className="secondary-button" onClick={copyLink}>Copiar enlace privado</button>
   <Link className="secondary-button" href="/admin/revision">Bandeja de revisión</Link>
  </div>
  {unsavedChanges&&<small>Guardá primero los cambios para que la persona revisora vea la versión más reciente.</small>}
  {status!=="draft"&&<small>Solo pueden enviarse a revisión noticias que aún sean borradores.</small>}
  {pending&&<small>Ya hay una solicitud pendiente para esta noticia.</small>}
  {message&&<p role="status" aria-live="polite">{message}</p>}
 </section>;
}
