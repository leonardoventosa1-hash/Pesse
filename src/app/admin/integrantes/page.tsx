"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";

type Role="admin"|"redactor";
type Member={id:string;email:string;role:Role;confirmedAt:string|null;invitedAt:string|null;lastSignInAt:string|null;disabled:boolean};
type ApiResponse={users?:Member[];message?:string;error?:string;truncated?:boolean;invitationsConfigured?:boolean};

export default function Members(){
 const router=useRouter();
 const [allowed,setAllowed]=useState(false);
 const [members,setMembers]=useState<Member[]>([]);
 const [email,setEmail]=useState("");
 const [role,setRole]=useState<Role>("redactor");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [notice,setNotice]=useState("");
 const [truncated,setTruncated]=useState(false);
 const [invitationsConfigured,setInvitationsConfigured]=useState(false);
 async function api(method:"GET"|"POST",body?:object):Promise<ApiResponse>{
  const db=supabase();if(!db)throw Error("Supabase no está configurado");
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError||!session?.access_token)throw Error("Iniciá sesión nuevamente");
  const result=await db.functions.invoke("manage-pesse-members",{
   method,headers:{"Authorization":"Bearer "+session.access_token},
   ...(body?{body}:{}),
  });
  if(result.error){
   let message=result.error.message;
   const response=(result.error as {context?:Response}).context;
   if(response&&typeof response.json==="function"){
    try{
     const details:unknown=await response.json();
     if(details&&typeof details==="object"&&"error" in details&&typeof details.error==="string")message=details.error;
    }catch{/* Conservar el mensaje original si la respuesta no es JSON */}
   }
   throw Error(message);
  }
  return result.data as ApiResponse;
 }
 async function refresh(){
  setLoading(true);
  try{
   const result=await api("GET");
   setMembers(result.users??[]);
   setTruncated(Boolean(result.truncated));
   setInvitationsConfigured(Boolean(result.invitationsConfigured));
   setNotice("");
  }catch(error){setNotice(error instanceof Error?error.message:"No se pudo cargar el equipo")}
  finally{setLoading(false)}
 }
 useEffect(()=>{let active=true;(async()=>{
  try{
   const db=supabase();if(!db)throw Error("Supabase no está configurado");
   const {data:{user}}=await db.auth.getUser();
   if(!active)return;
   if(!user){router.replace("/admin/login");return}
   if(await getRole()!=="admin"){router.replace("/admin");return}
   setAllowed(true);
  }catch(error){if(active)setNotice(error instanceof Error?error.message:"No se pudo comprobar el acceso")}
  finally{if(active)setLoading(false)}
 })();return()=>{active=false}},[router]);
 useEffect(()=>{if(allowed)void refresh()},[allowed]);
 async function invite(event:React.FormEvent){
  event.preventDefault();if(busy)return;
  setBusy(true);setNotice("");
  try{
   const result=await api("POST",{action:"invite",email:email.trim(),role});
   setEmail("");await refresh();setNotice(result.message??"Invitación enviada");
  }catch(error){setNotice(error instanceof Error?error.message:"No se pudo enviar la invitación")}
  finally{setBusy(false)}
 }
 async function modify(member:Member,action:"change-role"|"enable"|"disable",newRole?:Role){
  if(busy)return;
  const label=action==="change-role"?"cambiar el rol de":action==="disable"?"suspender el acceso de":"reactivar el acceso de";
  if(!window.confirm("¿Confirmás "+label+" "+member.email+"?"))return;
  setBusy(true);setNotice("");
  try{
   const result=await api("POST",{action,userId:member.id,...(newRole?{role:newRole}:{})});
   await refresh();setNotice(result.message??"Cambio realizado");
  }catch(error){setNotice(error instanceof Error?error.message:"No se pudo actualizar el integrante")}
  finally{setBusy(false)}
 }
 return <main className="container main editorial-dashboard">
  <Link href="/admin" className="more-link">← Volver al panel editorial</Link>
  <div className="eyebrow" style={{marginTop:30}}>ADMINISTRACIÓN</div>
  <h1>Integrantes de Pesse</h1>
  <p className="dashboard-subtitle">Invitá personas por correo y administrá los permisos del equipo. Solo los administradores pueden usar esta sección.</p>
  {notice&&<p role="status" className="writing-upload-notice">{notice}</p>}
  {allowed&&<>
   <section className="admin-shell" style={{margin:"28px 0",maxWidth:660}}>
    <h2>Invitar integrante</h2>
    <form className="editor-form" onSubmit={invite}>
     <label>Correo electrónico<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="integrante@ejemplo.com"/></label>
     <label>Permisos<select value={role} onChange={e=>setRole(e.target.value as Role)}><option value="redactor">Redactor</option><option value="admin">Administrador</option></select></label>
     <p className="muted">La persona recibirá un correo para activar su cuenta. Los redactores no podrán gestionar integrantes.</p>
     {!invitationsConfigured&&<p role="status">Las invitaciones están temporalmente deshabilitadas. Falta configurar la dirección de activación en Supabase y autorizar su URL de retorno.</p>}
     <button className="primary-button" disabled={busy||!email.trim()||!invitationsConfigured} type="submit">{busy?"Procesando...":invitationsConfigured?"Enviar invitación":"Invitaciones pendientes de configuración"}</button>
    </form>
   </section>
   <section aria-labelledby="team-heading"><div className="section-heading"><h2 id="team-heading">Equipo editorial</h2><button type="button" className="secondary-button" onClick={()=>void refresh()} disabled={loading||busy}>Actualizar</button></div>
    {truncated&&<p role="alert">Se alcanzó el límite de consulta de 1.000 usuarios de Supabase. Puede haber integrantes fuera de la lista; no realices cambios masivos sin revisar Auth.</p>}
    {loading?<p role="status">Cargando integrantes...</p>:members.length===0?<p>Todavía no hay integrantes disponibles o no se pudo recuperar la lista.</p>:<div className="editor-list">{members.map(member=><div key={member.id} className="editor-row" style={{flexWrap:"wrap",gap:16}}>
     <div><strong>{member.email}</strong><p className="muted">{member.role==="admin"?"Administrador":"Redactor"} · {member.disabled?"Acceso suspendido":member.confirmedAt?"Cuenta confirmada":"Invitación pendiente"}</p></div>
     <div className="dashboard-article-actions" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button type="button" className="secondary-button" disabled={busy||member.disabled} title={member.disabled?"Primero restablecé el acceso para cambiar el rol":undefined} onClick={()=>void modify(member,"change-role",member.role==="admin"?"redactor":"admin")}>{member.role==="admin"?"Cambiar a redactor":"Cambiar a administrador"}</button>
      <button type="button" className="secondary-button" disabled={busy} onClick={()=>void modify(member,member.disabled?"enable":"disable")}>{member.disabled?"Restablecer acceso":"Suspender acceso"}</button>
     </div>
    </div>)}</div>}
   </section>
  </>}
 </main>;
}
