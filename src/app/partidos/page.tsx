import Link from "next/link";
import type {Metadata} from "next";
import {PARTIDOS} from "@/lib/localities";
export const metadata:Metadata={
 title:"Partidos de zona oeste | Pesse",
 description:"Noticias locales de La Matanza, Morón, Ituzaingó, Merlo y Moreno, en el oeste bonaerense.",
 alternates:{canonical:"/partidos"}
};
export default function Partidos(){
 return <main className="container main locality-landing">
  <div className="eyebrow">PESSE / COBERTURA REGIONAL</div>
  <h1>Partidos de zona oeste</h1>
  <p className="locality-intro">Las noticias de La Matanza y el oeste bonaerense, organizadas por partido. Elegí uno para conocer las últimas novedades de la zona.</p>
  <div className="locality-grid">
   {PARTIDOS.map(partido=><Link className="locality-card" key={partido.slug} href={"/partidos/"+partido.slug}>
    <span>PARTIDO BONAERENSE</span><strong>{partido.name}</strong><span className="locality-card-arrow" aria-hidden="true">↗</span>
   </Link>)}
  </div>
  <p className="locality-disclaimer">Las noticias se agrupan según la localidad asignada por la redacción. Las coberturas sin publicaciones todavía mostrarán su página en preparación.</p>
 </main>;
}
