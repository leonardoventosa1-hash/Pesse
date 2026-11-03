"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getRole} from "@/lib/roles";
import {supabase} from "@/lib/supabase";
import {defaultSiteSettings,siteSettingsFields,socialHosts,validSocialUrl,type SiteSettings} from "@/lib/site-settings";
import {mediaBucket,mediaUrl} from "@/lib/brand-ads";

const textFields:{key:keyof SiteSettings;label:string;max:number;multiline?:boolean}[]=[
 {key:"site_name",label:"Nombre del medio",max:70},
 {key:"tagline",label:"Frase institucional (pie de página)",max:150},
 {key:"description",label:"Descripción para buscadores",max:300,multiline:true},
 {key:"hero_title",label:"Título principal de la portada",max:120},
 {key:"hero_emphasis",label:"Texto destacado del título",max:120},
 {key:"hero_description",label:"Presentación de portada",max:350,multiline:true}
];
export default function GeneralSettings(){
 const router=useRouter();
 const [settings,setSettings]=useState<SiteSettings>(defaultSiteSettings);
 const [original,setOriginal]=useState<SiteSettings|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [uploading,setUploading]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const changed=original!==null&&siteSettingsFields.some(k=>settings[k]!==original[k]);
 useEffect(()=>{let active=true;(async()=>{
  try{
   const db=supabase();if(!db)throw Error("No se pudo conectar con Supabase.");
   const {data:{user},error:authError}=await db.auth.getUser();if(authError)throw authError;
   if(!user){router.replace("/admin/login");return}
   const role=await getRole();if(!active)return;
   if(role!=="admin"){router.replace("/admin");return}
   const {data,error:readError}=await db.from("site_settings").select("site_name,tagline,description,hero_title,hero_emphasis,hero_description,instagram_url,facebook_url,youtube_url,tiktok_url,logo_path").eq("id",1).single();
   if(readError)throw Error("Falta instalar la migración de configuración general en Supabase: "+readError.message);
   if(!active)return;
   const parsed=data as SiteSettings;setSettings(parsed);setOriginal(parsed);
  }catch(cause){if(active)setError(cause instanceof Error?cause.message:"No se pudo cargar la configuración.")}
  finally{if(active)setLoading(false)}
 })();return()=>{active=false}},[router]);
 function update(key:keyof SiteSettings,value:string){setSettings(s=>({...s,[key]:value}));setMessage("");}
 async function uploadLogo(file:File|null){
  if(!file)return;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5*1024*1024||file.size===0){setError("Elegí un logo PNG, JPG o WebP de hasta 5 MB.");return}
  const db=supabase();if(!db){setError("Supabase no está conectado.");return}
  setUploading(true);setError("");setMessage("");
  try{
   const extension=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const path="brand/"+crypto.randomUUID()+"."+extension;
   const {error:uploadError}=await db.storage.from(mediaBucket).upload(path,file,{contentType:file.type,upsert:false});
   if(uploadError)throw uploadError;
   setSettings(prev=>({...prev,logo_path:path}));
   setMessage("Logo subido. Para aplicarlo al sitio, presioná Guardar configuración.");
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo subir el logo.")}
  finally{setUploading(false)}
 }

 async function save(event:React.FormEvent){
  event.preventDefault();if(saving||!original)return;setError("");setMessage("");
  for(const item of textFields){
   const v=settings[item.key].trim();
   if(v.length>(item.max)||((item.key==="site_name"||item.key==="hero_title"||item.key==="hero_emphasis")&&v.length<2)||((item.key==="description"||item.key==="hero_description")&&v.length<10)){setError("Revisá el campo «"+item.label+"».");return}
  }
  for(const item of socialHosts)if(!validSocialUrl(settings[item.field],item.host)){setError("La URL de "+item.label+" debe ser HTTPS y corresponder a "+item.host+".");return}
  const next=Object.fromEntries(siteSettingsFields.map(k=>[k,settings[k].trim()])) as SiteSettings;
  setSaving(true);
  try{
   const db=supabase();if(!db)throw Error("No se pudo conectar con Supabase");
   const {data,error:writeError}=await db.from("site_settings").update({...next,updated_at:new Date().toISOString()}).eq("id",1).select(siteSettingsFields.join(",")).single();
   if(writeError)throw writeError;
   const saved=data as unknown as SiteSettings;setSettings(saved);setOriginal(saved);
   setMessage("Configuración guardada. Los cambios se reflejarán al actualizar el portal.");
   router.refresh();
  }catch(cause){setError(cause instanceof Error?cause.message:"No se pudieron guardar los cambios.")}
  finally{setSaving(false)}
 }
 return <main className="container main editorial-dashboard">
  <Link href="/admin" className="more-link">← Volver a la sala de redacción</Link>
  <div className="eyebrow" style={{marginTop:28}}>ADMINISTRACIÓN / CONFIGURACIÓN</div>
  <h1>Configuración general</h1>
  <p className="dashboard-subtitle">Administrá los textos institucionales y las redes oficiales desde un solo lugar. Solo los administradores pueden guardar cambios.</p>
  {error&&<p role="alert" className="writing-upload-notice">{error}</p>}
  {message&&<p role="status" className="writing-upload-notice">{message}</p>}
  {loading?<p role="status">Cargando configuración...</p>:original&&<form className="editor-form" style={{maxWidth:820,marginTop:28}} onSubmit={save}>
   <section className="admin-shell" style={{marginBottom:24}}>
    <h2>Identidad y portada</h2>
    <div style={{margin:"18px 0",padding:16,border:"1px solid #d8dfda",borderRadius:12}}>
      <h3>Logotipo oficial</h3>
      <p className="muted">El logotipo original permanece intacto. Podés cargar una versión nueva o volver al original.</p>
      <div style={{marginBottom:12}}>{settings.logo_path&&mediaUrl(settings.logo_path,"brand")
      ?<img src={mediaUrl(settings.logo_path,"brand")!} alt="Vista previa del nuevo logo" style={{maxWidth:230,maxHeight:90,objectFit:"contain"}}/>
      :<img src="/pesse-logo-verde.svg" alt="Logotipo original de Pesse" style={{maxWidth:230,maxHeight:90,objectFit:"contain"}}/>}</div>
      <label>Subir logotipo (PNG, JPG o WebP, máximo 5 MB)
       <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading||saving} onChange={event=>void uploadLogo(event.target.files?.[0]??null)}/>
      </label>
      {uploading&&<p role="status">Subiendo logotipo...</p>}
      {settings.logo_path&&<button type="button" className="secondary-button" disabled={saving||uploading} onClick={()=>update("logo_path","")}>Restaurar logotipo original</button>}
    </div>
    <p className="muted">Estos campos aparecen en la portada, los metadatos del sitio y el pie de página.</p>
    {textFields.map(item=><label key={item.key}>{item.label}
     {item.multiline?<textarea rows={3} maxLength={item.max} value={settings[item.key]} onChange={e=>update(item.key,e.target.value)}/>:<input maxLength={item.max} value={settings[item.key]} onChange={e=>update(item.key,e.target.value)}/>}
     <small className="muted">{settings[item.key].length}/{item.max} caracteres</small>
    </label>)}
   </section>
   <section className="admin-shell" style={{marginBottom:24}}>
    <h2>Redes sociales oficiales</h2>
    <p className="muted">Solo se aceptan enlaces HTTPS de la plataforma correspondiente. Pesse no incluye X.</p>
    {socialHosts.map(item=><label key={item.field}>{item.label}<input type="url" required maxLength={500} value={settings[item.field]} onChange={e=>update(item.field,e.target.value)}/></label>)}
   </section>
   <section className="admin-shell" style={{marginBottom:24}}>
    <h2>Otras herramientas</h2>
    <p><Link href="/admin/integrantes">Gestionar integrantes y permisos ↗</Link></p><p><Link href="/admin/configuracion/secciones">Administrar secciones y orden del menú ↗</Link></p>
    <p><Link href="/admin/configuracion/publicidad">Gestionar espacios publicitarios ↗</Link></p>
    <p className="muted">Los colores y la organización avanzada de la portada requieren módulos independientes y pruebas visuales. Los banners se gestionan desde Publicidad. No se ofrecen controles que todavía no funcionen.</p>
   </section>
   <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:12}}>
    <button className="primary-button" type="submit" disabled={saving||uploading||!changed}>{saving?"Guardando...":"Guardar configuración"}</button>
    <button className="secondary-button" type="button" disabled={saving||!changed} onClick={()=>{if(original){setSettings(original);setError("");setMessage("Cambios descartados.")}}}>Descartar cambios</button>
    {changed&&<span className="muted" role="status">Tenés cambios sin guardar</span>}
   </div>
  </form>}
 </main>;
}