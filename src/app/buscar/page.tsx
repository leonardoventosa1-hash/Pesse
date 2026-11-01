export const dynamic = "force-dynamic";
import Link from "next/link";
import type {Metadata} from "next";
import {supabase} from "@/lib/supabase";

export const metadata:Metadata={title:"Buscar noticias | Pesse",description:"Buscá noticias y coberturas de Pesse por título y contenido."};

type SearchHit={id:string;slug:string;title:string;excerpt:string|null;cover_url:string|null;published_at:string|null};
export default async function Buscar({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
 const {q="",page="1"}=await searchParams;
 const query=typeof q==="string"?q.trim().slice(0,120):"";
 const requestedPage=Number(page);
 const perPage=12;
 const currentPage=Number.isSafeInteger(requestedPage)&&requestedPage>0?Math.min(requestedPage,10000):1;
 const db=supabase();
 const response=query.length>=2&&db?await db.rpc("search_pesse_articles",{search_term:query,page_number:currentPage,page_size:perPage}):null;
 const failed=Boolean(response?.error);
 const result=response?.data as {items?:SearchHit[];total?:number}|null;
 const articles=result?.items??[];
 const total=Number(result?.total??0);
 const totalPages=Math.max(1,Math.ceil(total/perPage));
 const pageUrl=(n:number)=>"/buscar?q="+encodeURIComponent(query)+"&page="+n;
 return <main className="container main">
  <div className="eyebrow">ARCHIVO PESSE</div><h1>Buscar noticias</h1>
  <p className="news-list-intro">Encontrá entrevistas, coberturas y noticias publicadas.</p>
  <form action="/buscar" method="get" role="search" className="news-search-form">
   <label htmlFor="news-query">¿Qué noticia estás buscando?</label>
   <div className="news-search-controls">
    <input id="news-query" type="search" name="q" minLength={2} maxLength={120} required defaultValue={query} placeholder="Escribí una palabra o un tema..." autoComplete="off"/>
    <button type="submit" className="primary-button">Buscar</button>
   </div>
  </form>
  {query.length===0?<p className="muted">Ingresá al menos dos caracteres para empezar.</p>:
   query.length<2?<p role="status" className="muted">Escribí al menos dos caracteres.</p>:
   <><p role="status" className="news-list-intro">{total} {total===1?"resultado":"resultados"} para <strong>“{query}”</strong></p>
    {failed?<p role="alert" className="muted">No pudimos completar la búsqueda en este momento. Intentá nuevamente.</p>:articles.length===0?<p className="muted">No encontramos noticias que coincidan. Probá con otra palabra.</p>:
     <div className="news-grid">{articles.map(a=><Link className="news-card" href={`/noticias/${a.slug}`} key={a.id}>
      {a.cover_url&&<img src={a.cover_url} alt=""/>}
      <div className="news-card-content"><span className="eyebrow">ACTUALIDAD</span><h2>{a.title}</h2><p>{a.excerpt}</p></div>
     </Link>)}</div>}
     {!failed&&total>perPage&&<nav aria-label="Páginas de resultados" className="news-search-pagination" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:30}}>
       {currentPage>1?<Link className="secondary-button" href={pageUrl(currentPage-1)}>← Anterior</Link>:null}
       <span>Página {currentPage} de {totalPages}</span>
       {currentPage<totalPages?<Link className="secondary-button" href={pageUrl(currentPage+1)}>Siguiente →</Link>:null}
     </nav>}</>}
 </main>;
}
