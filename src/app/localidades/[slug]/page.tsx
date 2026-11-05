export const dynamic="force-dynamic";
import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {supabase,type Article} from "@/lib/supabase";
import {localityBySlug} from "@/lib/localities";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const locality=localityBySlug(slug);
 if(!locality)return {title:"Localidad no encontrada",robots:{index:false,follow:false}};
 return {title:"Noticias de "+locality.name+" | Pesse",description:"Actualidad y noticias de "+locality.name+", "+locality.area+". Cobertura regional de Pesse.",alternates:{canonical:"/localidades/"+slug}};
}
export default async function Localidad({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{page?:string}>}){
 const {slug}=await params;const locality=localityBySlug(slug);if(!locality)notFound();
 const {page}=await searchParams;const raw=typeof page==="string"&&/^\d{1,4}$/.test(page)?Number(page):1;
 const currentPage=Math.min(1000,Math.max(1,raw));const pageSize=12;const db=supabase();
 let articles:Article[]=[];let total=0;let error=false;
 if(!db)error=true;
 else{
  const result=await db.from("articles").select("id,slug,title,excerpt,cover_url,published_at,created_at",{count:"exact"}).eq("locality_slug",locality.slug).eq("status","published").is("deleted_at",null).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false}).order("id",{ascending:false}).range((currentPage-1)*pageSize,currentPage*pageSize-1);
  if(result.error)error=true;else{articles=(result.data??[]) as Article[];total=result.count??0}
 }
 const totalPages=Math.max(1,Math.ceil(total/pageSize));
 const href=(n:number)=>"/localidades/"+slug+(n>1?"?page="+n:"");
 return <main className="container main locality-edition">
  <Link className="more-link" href="/localidades">← Todas las localidades</Link>
  <div className="locality-edition-header"><div className="eyebrow">PESSE / {locality.area.toUpperCase()}</div><h1>{locality.name}</h1><p>Noticias y actualidad de {locality.name}. Información regional para conocer lo que pasa cerca.</p></div>
  {error?<div role="alert" className="archive-feedback"><p>No pudimos cargar las noticias de esta localidad.</p><Link className="more-link" href={href(currentPage)}>Intentar nuevamente ↗</Link></div>:
   currentPage>totalPages?<div className="archive-feedback"><p>Esta página no existe.</p><Link className="more-link" href={href(1)}>Volver a {locality.name} ↗</Link></div>:
   articles.length===0?<div className="locality-empty"><h2>Estamos preparando la cobertura de {locality.name}</h2><p>Todavía no hay noticias publicadas con esta localidad. Mientras tanto, podés leer la actualidad de Pesse.</p><Link href="/noticias" className="primary-button">Ver últimas noticias ↗</Link></div>:
   <><div className="news-grid">{articles.map(a=><Link key={a.id} className="news-card" href={"/noticias/"+a.slug}>{a.cover_url?<img src={a.cover_url} alt="" loading="lazy" decoding="async"/>:<div className="archive-card-placeholder" aria-hidden="true">P.</div>}<div className="news-card-content"><span className="eyebrow">{locality.name.toUpperCase()}</span><h2>{a.title}</h2><time className="story-date" dateTime={a.published_at??undefined}>{a.published_at?new Date(a.published_at).toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"}):""}</time><p>{a.excerpt}</p></div></Link>)}</div>
    {totalPages>1&&<nav className="archive-pagination" aria-label={"Páginas de noticias de "+locality.name}>{currentPage>1?<Link className="secondary-button" href={href(currentPage-1)}>← Anterior</Link>:<span/>}<span>Página {currentPage} de {totalPages}</span>{currentPage<totalPages?<Link className="secondary-button" href={href(currentPage+1)}>Siguiente →</Link>:<span/>}</nav>}</>}
 </main>;
}
