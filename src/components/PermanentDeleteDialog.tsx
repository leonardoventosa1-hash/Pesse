"use client";
import {useEffect,useRef,useState} from "react";
import {supabase} from "@/lib/supabase";
export default function PermanentDeleteDialog({article,onClose,onDeleted}:{article:{id:string;title:string;deleted_at:string};onClose:()=>void;onDeleted:(id:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const running=useRef(false);
 const [confirmation,setConfirmation]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close()},[]);
 async function remove(event:React.FormEvent){
  event.preventDefault();if(running.current||confirmation!==article.title)return;
  running.current=true;setBusy(true);setError("");
  try{
   const db=supabase();if(!db)throw Error("No se pudo conectar con Pesse.");
   const {data,error}=await db.rpc("permanently_delete_article",{target_id:article.id,expected_deleted_at:article.deleted_at,confirmation_title:confirmation});
   if(error)throw error;
   if(data!==article.id)throw Error("No se confirmó la eliminación. Actualizá el listado antes de reintentar.");
   onDeleted(article.id);
  }catch(error){setError("No se pudo eliminar la nota. Puede haber sido restaurada o modificada; actualizá el listado. "+(error instanceof Error?error.message:"Revisá tus permisos e intentá nuevamente."))}
  finally{running.current=false;setBusy(false)}
 }
 return <dialog ref={dialog} className="permanent-delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={event=>{event.preventDefault();if(!running.current)onClose()}}>
  <form onSubmit={event=>void remove(event)}>
   <h2 id="delete-title">Eliminar definitivamente</h2>
   <p id="delete-description">Se eliminarán esta nota y sus solicitudes de revisión. No podrás restaurarla desde la papelera. Las imágenes se conservarán en la biblioteca.</p>
   <p><strong>{article.title}</strong></p>
   <label htmlFor="delete-confirmation">Para confirmar, escribí el título completo de la nota:</label>
   <input id="delete-confirmation" autoFocus autoComplete="off" value={confirmation} onChange={event=>setConfirmation(event.target.value)} disabled={busy}/>
   {error&&<p role="alert">{error}</p>}
   <div className="permanent-delete-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancelar</button><button type="submit" className="secondary-button permanent-delete-button" disabled={busy||confirmation!==article.title}>{busy?"Eliminando…":"Eliminar definitivamente"}</button></div>
  </form>
 </dialog>;
}
