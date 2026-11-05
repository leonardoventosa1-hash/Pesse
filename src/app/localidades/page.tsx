export const dynamic="force-dynamic";
import Link from "next/link";
import type {Metadata} from "next";
import {LOCALITIES} from "@/lib/localities";
export const metadata:Metadata={
 title:"Locales | Noticias de La Matanza y zona oeste | Pesse",
 description:"Noticias de La Matanza y zona oeste bonaerense, organizadas por localidad.",
 alternates:{canonical:"/localidades"}
};
export default function Localidades(){
 return <main className="container main locality-landing">
  <div className="eyebrow">PESSE / EL OESTE BONAERENSE</div>
  <h1>Locales</h1>
  <p className="locality-intro">La actualidad de La Matanza y zona oeste, ciudad por ciudad. Elegí una localidad para conocer las noticias de tu zona.</p>
  {(["La Matanza","Zona oeste"] as const).map(area=><section className="locality-group" key={area} aria-label={area}>
   <div className="section-heading"><div><div className="eyebrow">COBERTURA REGIONAL</div><h2>{area}</h2></div></div>
   <div className="locality-grid">{LOCALITIES.filter(l=>l.area===area).map(l=><Link className="locality-card" key={l.slug} href={"/localidades/"+l.slug}><span>{l.area}</span><strong>{l.name}</strong><span className="locality-card-arrow" aria-hidden="true">↗</span></Link>)}</div>
  </section>)}
  <p className="locality-disclaimer">Cada noticia se asigna a una localidad desde nuestra redacción. Las páginas sin publicaciones todavía muestran su cobertura en preparación.</p>
 </main>;
}
