export const dynamic = "force-dynamic";
import Link from "next/link";
import {paginatedPublicArticles} from "@/lib/articles";
import type {Metadata} from "next";

export async function generateMetadata({searchParams}:{searchParams:Promise<{page?:string}>}):Promise<Metadata>{
 const {page}=await searchParams;
 const number=typeof page==="string"&&/^\d{1,4}$/.test(page)?Number(page):1;
 return {title:number>1?`Noticias — página ${number} | Pesse`:"Noticias | Pesse",
  description:"Información, entrevistas y coberturas de Pesse.",
  robots:number>1?{index:false,follow:true}:undefined,
  alternates:{canonical:number>1?`/noticias?page=${number}`:"/noticias"}};
}

export default async function Noticias({searchParams}:{searchParams:Promise<{page?:string}>}){
 const {page="1"}=await searchParams;
 const requestedPage=typeof page==="string"&&/^\d{1,4}$/.test(page)?Number(page):1;
 const currentPage=Number.isSafeInteger(requestedPage)&&requestedPage>0?Math.min(requestedPage,1000):1;
 const perPage=12;
 const {items:articles,total,error}=await paginatedPublicArticles(currentPage,perPage);
 const totalPages=Math.max(1,Math.ceil(total/perPage));
 const outOfRange=!error&&currentPage>totalPages;
 const href=(n:number)=>n===1?"/noticias":"/noticias?page="+n;
 return <main className="container main news-archive">
  <div className="eyebrow">REDACCIÓN PESSE</div>
  <h1>Últimas noticias</h1>
  <p className="news-list-intro">Información, entrevistas y coberturas. Todas las noticias, en un solo lugar.</p>
  {error?<div role="alert" className="archive-feedback"><p>No pudimos cargar las noticias en este momento.</p><Link className="secondary-button" href={href(currentPage)}>Intentar nuevamente</Link></div>:
   outOfRange?<div className="archive-feedback"><p>Esta página del archivo no existe.</p><Link href="/noticias" className="more-link">Volver a las últimas noticias ↗</Link></div>:
   articles.length===0?<p className="muted">Todavía no hay noticias publicadas.</p>:
   <>
    <div className="news-grid">{articles.map(a=><Link className="news-card" href={`/noticias/${a.slug}`} key={a.id}>
     {a.cover_url?<img src={a.cover_url} alt="" width={640} height={360} loading="lazy" decoding="async"/>:<div className="archive-card-placeholder" aria-hidden="true">P.</div>}
     <div className="news-card-content"><span className="eyebrow">PESSE · ACTUALIDAD</span>
      <h2>{a.title}</h2>
      <time className="story-date" dateTime={a.published_at??undefined}>{a.published_at?new Date(a.published_at).toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"}):""}</time>
      <p>{a.excerpt}</p>
     </div></Link>)}</div>
    {totalPages>1&&<nav aria-label="Páginas de noticias" className="archive-pagination">
     {currentPage>1?<Link className="secondary-button" href={href(currentPage-1)}>← Anterior</Link>:<span/>}
     <span>Página {currentPage} de {totalPages}</span>
     {currentPage<totalPages?<Link className="secondary-button" href={href(currentPage+1)}>Siguiente →</Link>:<span/>}
    </nav>}
   </>}
 </main>;
}
