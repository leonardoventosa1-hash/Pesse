"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";
import {defaultHomepageSections,homepageSectionLabels,type HomepageSection} from "@/lib/homepage-sections";

export default function HomepageConfiguration(){
 const router=useRouter();
 const [rows,setRows]=useState<HomepageSection[]>(defaultHomepageSections);
 const [initial,setInitial]=useState<HomepageSection[]|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const ordered=[...rows].sort((a,b)=>a.display_order-b.display_order);
 const changed=!!initial&&JSON.stringify(rows)!==JSON.stringify(initial);
 useEffect(()=>{let active=true;(async()=>{try{
  const db=supabase();if(!db)throw Error("No se pudo conectar con Supabase.");
  const {data:{user}}=await db.auth.getUser();
  if(!active)return;
  if(!user){router.replace("/admin/login");return}
  if(await getRole()!=="admin"){router.replace("/admin");return}
  const {data,error:readError}=await db.from("homepage_sections").select("section_key,display_order,is_visible").order("display_order",{ascending:true});
  if(readError||!data||data.length!==3)throw Error("Falta instalar la migración de bloques de portada.");
  if(!active)return;
  setRows(data as HomepageSection[]);setInitial(data as HomepageSection[]);
 }catch(e){if(active)setError(e instanceof Error?e.message:"No se pudo cargar.")}
 finally{if(active)setLoading(false)}
 })();return()=>{active=false}},[router]);
 function toggle(key:HomepageSection["section_key"]){setRows(prev=>prev.map(s=>s.section_key===key?{...s,is_visible:!s.is_visible}:s))}
 function move(key:HomepageSection["section_key"],dir:-1|1){
  const list=[...rows].sort((a,b)=>a.display_order-b.display_order);
  const i=list.findIndex(x=>x.section_key===key);const j=i+dir;
  if(j<0||j>=list.length)return;
  [list[i],list[j]]=[list[j],list[i]];
  setRows(list.map((s,index)=>({...s,display_order:(index+1)*10})));
 }
 async function save(){
  if(!changed||saving)return;
  const db=supabase();if(!db)return;
  setSaving(true);setError("");setNotice("");
  try{
   for(const section of rows){
    const {data,error:writeError}=await db.from("homepage_sections").update({display_order:section.display_order,is_visible:section.is_visible,updated_at:new Date().toISOString()}).eq("section_key",section.section_key).select("section_key").maybeSingle();
    if(writeError||!data)throw Error(writeError?.message??"No se pudo guardar una sección. Actualizá antes de intentar nuevamente.");
   }
   const {data,error:readError}=await db.from("homepage_sections").select("section_key,display_order,is_visible").order("display_order",{ascending:true});
   if(readError||!data)throw Error("Los cambios se enviaron, pero no se pudieron verificar.");
   setRows(data as HomepageSection[]);setInitial(data as HomepageSection[]);
   setNotice("Portada guardada. Actualizá la página pública para ver los cambios.");
   router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"No se pudo guardar.");setInitial(null)}
  finally{setSaving(false)}
 }
 return <main className="container main editorial-dashboard">
  <Link href="/admin/configuracion" className="more-link">← Configuración general</Link>
  <div className="eyebrow" style={{marginTop:28}}>ADMINISTRACIÓN / PORTADA</div>
  <h1>Organización de la portada</h1>
  <p className="dashboard-subtitle">Organizá tres bloques editoriales con flechas para subirlos o bajarlos. Las noticias destacadas se mantienen siempre al principio, y los espacios publicitarios conservan sus posiciones.</p>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {loading?<p role="status">Cargando portada...</p>:initial&&<div style={{maxWidth:800,marginTop:24}}>
   <div className="editor-list">{ordered.map((s,i)=><div key={s.section_key} className="editor-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap"}}>
    <div><strong>{i+1}. {homepageSectionLabels[s.section_key]}</strong><p className="muted">{s.is_visible?"Visible en portada":"Oculto de la portada"}</p></div>
    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
     <label style={{display:"flex",alignItems:"center",gap:6}}><input type="checkbox" checked={s.is_visible} onChange={()=>toggle(s.section_key)}/>Visible</label>
     <button type="button" className="secondary-button" disabled={saving||i===0} onClick={()=>move(s.section_key,-1)} aria-label={"Subir "+homepageSectionLabels[s.section_key]}>↑</button>
     <button type="button" className="secondary-button" disabled={saving||i===ordered.length-1} onClick={()=>move(s.section_key,1)} aria-label={"Bajar "+homepageSectionLabels[s.section_key]}>↓</button>
    </div>
   </div>)}</div>
   <p className="muted">Ocultar un bloque no elimina noticias, categorías ni videos. Podés volver a mostrarlo cuando quieras.</p>
   <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:18}}>
    <button className="primary-button" disabled={saving||!changed} type="button" onClick={()=>void save()}>{saving?"Guardando...":"Guardar portada"}</button>
    <button className="secondary-button" disabled={saving||!changed} type="button" onClick={()=>{if(initial){setRows(initial);setNotice("Cambios descartados.")}}}>Descartar cambios</button>
   </div>
  </div>}
 </main>;
}
