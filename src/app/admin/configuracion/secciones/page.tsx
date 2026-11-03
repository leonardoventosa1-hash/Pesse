"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";

type Section={id:string;slug:string;name:string;description:string;display_order:number;is_visible:boolean};
export default function CategoriesAdmin(){
 const router=useRouter();
 const [items,setItems]=useState<Section[]>([]);
 const [loading,setLoading]=useState(true);
 const [authorized,setAuthorized]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [newName,setNewName]=useState("");
 const [newSlug,setNewSlug]=useState("");
 const [newDescription,setNewDescription]=useState("");
 const [newPosition,setNewPosition]=useState(100);
 async function refresh(){
  const db=supabase();if(!db)throw Error("Supabase no está disponible");
  const {data,error:readError}=await db.from("categories").select("id,slug,name,description,is_visible,display_order").order("display_order",{ascending:true}).order("name",{ascending:true});
  if(readError)throw readError;
  setItems((data??[]) as Section[]);
 }
 useEffect(()=>{let active=true;(async()=>{try{
  const db=supabase();if(!db)throw Error("Supabase no está configurado");
  const {data:{user}}=await db.auth.getUser();
  if(!active)return;
  if(!user){router.replace("/admin/login");return}
  if(await getRole()!=="admin"){router.replace("/admin");return}
  setAuthorized(true);await refresh();
 }catch(cause){if(active)setError(cause instanceof Error?cause.message:"No se pudieron cargar las secciones")}
 finally{if(active)setLoading(false)}})();return()=>{active=false}},[router]);
 function edit(id:string,patch:Partial<Section>){setItems(old=>old.map(s=>s.id===id?{...s,...patch}:s))}
 async function save(section:Section){
  setBusy(true);setError("");setMessage("");
  try{
   if(section.name.trim().length<2||section.name.length>80||section.description.length>300||section.display_order<0||section.display_order>10000)throw Error("Revisá el nombre, la descripción y el orden.");
   const db=supabase();if(!db)throw Error("Sin conexión");
   const {data,error:writeError}=await db.from("categories").update({
    name:section.name.trim(),description:section.description.trim(),is_visible:section.is_visible,display_order:section.display_order
   }).eq("id",section.id).select("id").maybeSingle();
   if(writeError||!data)throw Error(writeError?.message??"No se pudo guardar: verificá tus permisos.");
   await refresh();setMessage("Sección actualizada. El menú mostrará los cambios al actualizar.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo guardar")}
  finally{setBusy(false)}
 }
 async function create(event:React.FormEvent){
  event.preventDefault();setBusy(true);setMessage("");setError("");
  try{
   const slug=newSlug.trim().toLowerCase();
   if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error("El identificador debe usar letras minúsculas, números y guiones.");
   if(newName.trim().length<2||newName.length>80||newDescription.length>300||newPosition<0||newPosition>10000)throw Error("Revisá los datos de la nueva sección.");
   const db=supabase();if(!db)throw Error("Sin conexión");
   const {error:writeError}=await db.from("categories").insert({name:newName.trim(),slug,description:newDescription.trim(),display_order:newPosition,is_visible:true});
   if(writeError)throw writeError;
   setNewName("");setNewSlug("");setNewDescription("");setNewPosition(100);await refresh();setMessage("Sección creada correctamente.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo crear la sección")}
  finally{setBusy(false)}
 }
 return <main className="container main editorial-dashboard">
  <Link className="more-link" href="/admin/configuracion">← Volver a Configuración general</Link>
  <div className="eyebrow" style={{marginTop:28}}>CONFIGURACIÓN / SECCIONES</div><h1>Secciones editoriales</h1>
  <p className="dashboard-subtitle">Ordená, mostrá u ocultá secciones del menú sin eliminar sus noticias. El identificador de cada sección se conserva para mantener los enlaces.</p>
  {error&&<p role="alert" className="writing-upload-notice">{error}</p>}
  {message&&<p role="status" className="writing-upload-notice">{message}</p>}
  {loading?<p role="status">Cargando secciones...</p>:authorized&&<>
   <section style={{display:"grid",gap:16,marginTop:28}}>
    {items.map(item=><div key={item.id} className="admin-shell">
     <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
      <div><h2>{item.name}</h2><p className="muted">/categoria/{item.slug} · Identificador protegido</p></div>
      <label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={item.is_visible} onChange={e=>edit(item.id,{is_visible:e.target.checked})}/>Visible en el menú</label>
     </div>
     <div className="editor-form">
      <label>Nombre<input maxLength={80} value={item.name} onChange={e=>edit(item.id,{name:e.target.value})}/></label>
      <label>Descripción<textarea maxLength={300} rows={2} value={item.description} onChange={e=>edit(item.id,{description:e.target.value})}/></label>
      <label>Orden en el menú<input type="number" min={0} max={10000} value={item.display_order} onChange={e=>edit(item.id,{display_order:Number(e.target.value)})}/></label>
      <button type="button" className="secondary-button" disabled={busy} onClick={()=>void save(item)}>Guardar sección</button>
     </div>
    </div>)}
   </section>
   <section className="admin-shell" style={{marginTop:28}}><h2>Agregar sección</h2>
    <form className="editor-form" onSubmit={create}>
     <label>Nombre<input required maxLength={80} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Por ejemplo: Economía"/></label>
     <label>Identificador URL (no editable después)<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={newSlug} onChange={e=>setNewSlug(e.target.value)} placeholder="economia"/></label>
     <label>Descripción<textarea rows={2} maxLength={300} value={newDescription} onChange={e=>setNewDescription(e.target.value)}/></label>
     <label>Orden en el menú<input type="number" min={0} max={10000} value={newPosition} onChange={e=>setNewPosition(Number(e.target.value))}/></label>
     <button type="submit" className="primary-button" disabled={busy}>{busy?"Guardando...":"Crear sección"}</button>
    </form>
   </section>
  </>}
 </main>
}
