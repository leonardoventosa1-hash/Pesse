"use client";
import {useState} from "react";
import {supabase} from "@/lib/supabase";
type Media={path:string;url:string;name:string};
export default function MediaGallery({onCover,onInsert}:{onCover:(url:string)=>void;onInsert:(url:string,description:string)=>void}){
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(""),[images,setImages]=useState<Media[]>([]),[descriptions,setDescriptions]=useState<Record<string,string>>({});
 async function load(){setOpen(true);setLoading(true);setError("");try{
 const db=supabase();if(!db)throw Error("Falta configurar Supabase.");
 const {data:{user}}=await db.auth.getUser();if(!user)throw Error("Iniciá sesión nuevamente.");
 const {data,error}=await db.storage.from("news-images").list(user.id,{limit:100,sortBy:{column:"created_at",order:"desc"}});
 if(error)throw error;
 const results=(data??[]).filter(f=>!f.name.startsWith(".")&&/\.(jpe?g|png|webp)$/i.test(f.name)).map(f=>{const path=user.id+"/"+f.name;return {path,name:f.name,url:db.storage.from("news-images").getPublicUrl(path).data.publicUrl}});
 setImages(results);
 }catch(e){setError(e instanceof Error?e.message:"No se pudieron cargar las imágenes.")}finally{setLoading(false)}}
 return <section className="media-library">
 <button type="button" className="editor-preview-toggle" onClick={()=>open?setOpen(false):void load()} aria-expanded={open}>{open?"Cerrar biblioteca":"Elegir una fotografía ya subida"}</button>
 {open&&<div className="media-library-panel"><div className="media-library-header"><strong>Mis imágenes</strong><button type="button" onClick={()=>void load()} disabled={loading}>Actualizar</button></div>
 {loading?<p role="status">Cargando imágenes...</p>:error?<p role="alert">{error}</p>:images.length===0?<p>Todavía no tenés fotografías subidas desde esta cuenta.</p>:<div className="media-library-grid">{images.map(image=><div className="media-library-item" key={image.path}><img src={image.url} alt="Fotografía guardada" loading="lazy"/><div className="media-library-actions"><label htmlFor={"media-alt-"+image.name}>Descripción de la fotografía (texto alternativo)</label><input id={"media-alt-"+image.name} type="text" maxLength={160} value={descriptions[image.path]??""} placeholder="Describí lo que muestra la imagen" onChange={event=>setDescriptions(current=>({...current,[image.path]:event.target.value}))}/><button type="button" onClick={()=>onCover(image.url)}>Usar de portada</button><button type="button" disabled={!(descriptions[image.path]??"").trim()} onClick={()=>onInsert(image.url,(descriptions[image.path]??"").trim())}>Insertar en texto</button></div></div>)}</div>}
 <p className="writing-media-help">Se muestran las últimas 100 imágenes de tu usuario. Esta biblioteca no elimina archivos. Para insertar una fotografía en el texto, escribí antes una descripción que ayude a comprenderla.</p></div>}
 </section>
}
