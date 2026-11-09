export const dynamic = "force-dynamic";
import Link from "next/link";
import type {Metadata} from "next";
import {supabase} from "@/lib/supabase";

export async function generateMetadata({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}):Promise<Metadata>{
 const {q,page}=await searchParams;
 const hasQuery=typeof q==="string"&&q.trim().length>0;
 const hasPage=typeof page==="string"&&page!=="1"&&page!=="";
 return {title:"Buscar noticias | Pesse",description:"Buscá noticias y coberturas de Pesse por título y contenido.",robots:hasQuery||hasPage?{index:false,follow:true}:undefined,alternates:{canonical:"/buscar"}};
}

type SearchHit={id:string;slug:string;title:string;excerpt:string|null;cover_url:string|null;published_at:string|null};
export default async function Buscar({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
 const {q="",page="1"}=await searchParams;
 const query=typeof q==="string"?q.trim().slice(0,120):"";
 const requestedPage=typeof page==="string"&&/^\d{1,5}$/.test(page)?Number(page):1;
 const perPage=12;
 const currentPage=Number.isSafeInteger(requestedPage)&&requestedPage>0?Math.min(requestedPage,10000):1;
 const db=supabase();
 let result:{items?:SearchHit[];total?:number}|null=null;
 let failed=false;
 if(query.length>=2){
  if(!db){failed=true}else{
   try{
    const response=await db.rpc("search_pesse_articles",{search_term:query,page_number:currentPage,page_size:perPage});
    failed=Boolean(response.error);
    if(!failed){
     const data=response.data as {items?:unknown;total?:unknown}|null;
     if(!data||!Array.isArray(data.items)||typeof data.total!=="number"||!Number.isSafeInteger(data.total)||data.total<0||
      data.items.length>perPage||new Set(data.items.map((item:unknown)=>item&&typeof item==="object"?(item as Record<string,unknown>).id:null)).size!==data.items.length||(currentPage===1&&data.total<data.items.length)||
      (data.total>0&&currentPage<=Math.ceil(data.total/perPage)&&data.items.length===0)||!data.items.every((item:unknown)=>{
       if(!item||typeof item!=="object")return false;
       const hit=item as Record<string,unknown>;
       return typeof hit.id==="string"&&hit.id.length>0&&typeof hit.slug==="string"&&hit.slug.length>0&&
        typeof hit.title==="string"&&hit.title.length>0&&
        (hit.excerpt===null||typeof hit.excerpt==="string")&&
        (hit.cover_url===null||typeof hit.cover_url==="string")&&
        (hit.published_at===null||typeof hit.published_at==="string");
      })){failed=true}
     else result=data as {items:SearchHit[];total:number};
    }
   }catch{failed=true}
  }
 }
 const articles=result?.items??[];
 const reportedTotal=Number(result?.total??0);
 const total=Number.isSafeInteger(reportedTotal)&&reportedTotal>=0?reportedTotal:0;
 const totalPages=Math.max(1,Math.ceil(total/perPage));
 const outOfRange=total>0&&currentPage>totalPages;
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
   <>{!failed&&<p role="status" className="news-list-intro">{total} {total===1?"resultado":"resultados"} para <strong>“{query}”</strong></p>}
    {failed?<div role="alert" className="muted"><p>No pudimos completar la búsqueda en este momento. Tus términos de búsqueda se conservaron.</p><Link className="secondary-button" href={pageUrl(currentPage)}>Reintentar búsqueda</Link></div>:outOfRange?<p className="muted">Esta página no existe. <Link href={pageUrl(1)}>Volver a la primera página de resultados</Link>.</p>:articles.length===0?<p className="muted">No encontramos noticias que coincidan. Probá con otra palabra.</p>:
     <div className="news-grid">{articles.map(a=><Link className="news-card" href={`/noticias/${encodeURIComponent(a.slug)}`} key={a.id}>
      {a.cover_url&&<img src={a.cover_url} alt=""/>}
      <div className="news-card-content"><span className="eyebrow">ACTUALIDAD</span><h2>{a.title}</h2><p>{a.excerpt}</p></div>
     </Link>)}</div>}
     {!failed&&!outOfRange&&total>perPage&&<nav aria-label="Páginas de resultados" className="news-search-pagination" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:30}}>
       {currentPage>1?<Link className="secondary-button" href={pageUrl(currentPage-1)}>← Anterior</Link>:null}
       <span>Página {currentPage} de {totalPages}</span>
       {currentPage<totalPages?<Link className="secondary-button" href={pageUrl(currentPage+1)}>Siguiente →</Link>:null}
     </nav>}</>}
 </main>;
}
