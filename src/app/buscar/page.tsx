export const dynamic = "force-dynamic";
import Link from "next/link";
import type {Metadata} from "next";
import {publicArticles} from "@/lib/articles";

export const metadata:Metadata={title:"Buscar noticias | Pesse",description:"Buscá noticias y coberturas de Pesse por título y contenido."};

export default async function Buscar({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
 const {q="",page="1"}=await searchParams;
 const query=q.trim().slice(0,120);
 const normalized=query.toLocaleLowerCase("es");
 const articles=query.length>=2?(await publicArticles(300)).filter(a=>
  [a.title,a.excerpt,a.body].some(value=>(value??"").toLocaleLowerCase("es").includes(normalized))
 ):[];
 const perPage=12;
 const requestedPage=Number(page);
 const currentPage=Number.isSafeInteger(requestedPage)&&requestedPage>0?Math.min(requestedPage,100):1;
 const totalPages=Math.max(1,Math.ceil(articles.length/perPage));
 const selectedPage=Math.min(currentPage,totalPages);
 const visibleArticles=articles.slice((selectedPage-1)*perPage,selectedPage*perPage);
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
   <><p role="status" className="news-list-intro">{articles.length} {articles.length===1?"resultado":"resultados"} para <strong>“{query}”</strong></p>
    {articles.length===0?<p className="muted">No encontramos noticias que coincidan. Probá con otra palabra.</p>:
     <div className="news-grid">{visibleArticles.map(a=><Link className="news-card" href={`/noticias/${a.slug}`} key={a.id}>
      {a.cover_url&&<img src={a.cover_url} alt=""/>}
      <div className="news-card-content"><span className="eyebrow">ACTUALIDAD</span><h2>{a.title}</h2><p>{a.excerpt}</p></div>
     </Link>)}</div>}
     {articles.length>perPage&&<nav aria-label="Páginas de resultados" className="news-search-pagination" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:30}}>
       {selectedPage>1?<Link className="secondary-button" href={pageUrl(selectedPage-1)}>← Anterior</Link>:null}
       <span>Página {selectedPage} de {totalPages}</span>
       {selectedPage<totalPages?<Link className="secondary-button" href={pageUrl(selectedPage+1)}>Siguiente →</Link>:null}
     </nav>}</>}
 </main>;
}
