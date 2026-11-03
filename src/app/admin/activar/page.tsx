"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";

export default function ActivateInvitation(){
 const router=useRouter();
 const [ready,setReady]=useState(false);
 const [checking,setChecking]=useState(true);
 const [password,setPassword]=useState("");
 const [repeat,setRepeat]=useState("");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 useEffect(()=>{let live=true;const db=supabase();if(!db){setNotice("Supabase no está configurado");setChecking(false);return}
  const check=async()=>{const {data:{session}}=await db.auth.getSession();if(live){setReady(Boolean(session));setChecking(false);setNotice(session?"":"Abrí el enlace de invitación recibido por correo. Si venció, pedí una nueva invitación.")}};
  void check();
  const {data:{subscription}}=db.auth.onAuthStateChange(()=>{void check()});
  return()=>{live=false;subscription.unsubscribe()};
 },[]);
 async function submit(event:React.FormEvent){event.preventDefault();if(password.length<12){setNotice("La contraseña debe tener al menos 12 caracteres.");return}
  if(password!==repeat){setNotice("Las contraseñas no coinciden.");return}
  const db=supabase();if(!db)return;setBusy(true);setNotice("");
  try{const {error}=await db.auth.updateUser({password});if(error)throw error;router.replace("/admin");router.refresh()}
  catch(error){setNotice(error instanceof Error?error.message:"No se pudo guardar la contraseña")}
  finally{setBusy(false)}
 }
 return <main className="container main"><div className="admin-shell">
  <div className="eyebrow">EQUIPO PESSE</div><h1>Activar cuenta editorial</h1>
  <p>Si recibiste una invitación de Pesse, configurá una contraseña personal antes de entrar al panel.</p>
  {checking?<p role="status">Verificando tu invitación...</p>:ready?<form className="editor-form" onSubmit={submit}>
   <label>Nueva contraseña<input type="password" required minLength={12} autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)}/></label>
   <label>Repetir contraseña<input type="password" required minLength={12} autoComplete="new-password" value={repeat} onChange={event=>setRepeat(event.target.value)}/></label>
   <button type="submit" className="primary-button" disabled={busy}>{busy?"Activando...":"Activar mi cuenta"}</button>
  </form>:<p>Para activar tu cuenta necesitás abrir un enlace de invitación válido.</p>}
  {notice&&<p role="alert">{notice}</p>}
  <Link className="more-link" href="/admin/login">Ir al inicio de sesión</Link>
 </div></main>;
}