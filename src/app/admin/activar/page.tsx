"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {getRole} from "@/lib/roles";

export default function ActivateInvitation(){
 const router=useRouter();
 const [ready,setReady]=useState(false);
 const [checking,setChecking]=useState(true);
 const [password,setPassword]=useState("");
 const [repeat,setRepeat]=useState("");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  let active=true;
  // Read any authentication error before the SDK consumes the URL fragment.
  const fragment=new URLSearchParams(window.location.hash.slice(1));
  const params=new URLSearchParams(window.location.search);
  const linkError=fragment.get("error")??params.get("error");
  if(linkError){
   setNotice("El enlace de invitación venció o no es válido. Solicitá una nueva invitación al administrador.");
   setChecking(false);
   return;
  }
  const db=supabase();
  if(!db){setNotice("No se pudo conectar con el sistema de acceso.");setChecking(false);return}
  void (async()=>{
   try{
    // Supabase handles regular invitation fragments and PKCE codes when the
    // browser client initializes. Custom email templates may use token_hash.
    const tokenHash=params.get("token_hash");
    const tokenType=params.get("type");
    if(tokenHash&&tokenType==="invite"){
     const {error}=await db.auth.verifyOtp({token_hash:tokenHash,type:"invite"});
     if(error)throw Error("El enlace de invitación no se pudo validar. Pedí uno nuevo.");
     // A verified token is one-time use; remove it from browser history.
     window.history.replaceState(window.history.state,"",window.location.pathname);
    }else if(tokenHash){
     throw Error("El enlace recibido no es una invitación válida de Pesse.");
    }
    const {data:{session},error}=await db.auth.getSession();
    if(error)throw Error("No se pudo verificar tu sesión. Intentá abrir nuevamente el enlace.");
    if(!active)return;
    if(!session){
     setNotice("Abrí el enlace de invitación recibido por correo. Si venció, pedí una nueva invitación.");
     return;
    }
    const role=await getRole();
    if(!active)return;
    if(role!=="redactor"&&role!=="admin"){
     setNotice("La cuenta está autenticada, pero todavía no tiene acceso editorial. Pedí al administrador que revise tu invitación.");
     return;
    }
    setReady(true);
    setNotice("");
   }catch(error){
    if(active)setNotice(error instanceof Error?error.message:"No se pudo validar la invitación.");
   }finally{if(active)setChecking(false)}
  })();
  return()=>{active=false};
 },[]);
 async function submit(event:React.FormEvent){
  event.preventDefault();
  if(busy)return;
  if(password.length<12){setNotice("La contraseña debe tener al menos 12 caracteres.");return}
  if(password!==repeat){setNotice("Las contraseñas no coinciden.");return}
  const db=supabase();if(!db){setNotice("No se pudo conectar con Supabase.");return}
  setBusy(true);setNotice("");
  try{
   const {error}=await db.auth.updateUser({password});
   if(error)throw error;
   setPassword("");setRepeat("");
   router.replace("/admin");router.refresh();
  }catch(error){
   setNotice(error instanceof Error?error.message:"No se pudo guardar la contraseña.");
  }finally{setBusy(false)}
 }
 return <main className="container main"><div className="admin-shell">
  <div className="eyebrow">EQUIPO PESSE</div><h1>Activar cuenta editorial</h1>
  <p>Si recibiste una invitación de Pesse, abrí su enlace desde el correo y configurá una contraseña personal para usar el panel.</p>
  {checking?<p role="status">Verificando tu invitación...</p>:ready?<form className="editor-form" onSubmit={submit}>
   <label>Nueva contraseña<input type="password" required minLength={12} autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)}/></label>
   <label>Repetir contraseña<input type="password" required minLength={12} autoComplete="new-password" value={repeat} onChange={event=>setRepeat(event.target.value)}/></label>
   <p className="muted">Usá al menos 12 caracteres y no compartas tu contraseña con nadie del equipo.</p>
   <button type="submit" className="primary-button" disabled={busy}>{busy?"Activando...":"Activar mi cuenta"}</button>
  </form>:<p>Para activar tu cuenta necesitás una invitación válida y un rol editorial asignado.</p>}
  {notice&&<p role="alert">{notice}</p>}
  <Link className="more-link" href="/admin/login">Ir al inicio de sesión</Link>
 </div></main>;
}
