"use client";

import {useEffect} from "react";
import Link from "next/link";

export default function ErrorPage({error,reset}:{error:Error & {digest?:string};reset:()=>void}) {
  useEffect(()=>{
    // Error details are intentionally not rendered to visitors.
    console.error("Pesse page error",error);
  },[error]);

  return <main className="container main" role="alert">
    <div className="eyebrow">PESSE · SERVICIO TEMPORALMENTE NO DISPONIBLE</div>
    <h1>No pudimos cargar esta página</h1>
    <p className="muted">Es posible que se haya producido un problema momentáneo. Podés volver a intentar o regresar al inicio.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"center"}}>
      <button type="button" className="primary-button" onClick={()=>reset()} style={{border:0,cursor:"pointer",fontFamily:"inherit"}}>Volver a intentar ↻</button>
      <Link href="/" className="more-link">Ir al inicio ↗</Link>
    </div>
  </main>;
}
