export const dynamic = "force-dynamic";
import {notFound} from "next/navigation";
import Link from "next/link";
import {articleBySlug,publicArticles} from "@/lib/articles";
import {supabase} from "@/lib/supabase";
import {localityBySlug} from "@/lib/localities";
import ArticleReader from "@/components/ArticleReader";
import type {Metadata} from "next";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const article=await articleBySlug(slug);
 if(!article)return {title:"Noticia no encontrada",robots:{index:false,follow:false}};
 const url=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"")+"/noticias/"+encodeURIComponent(article.slug);
 return {
  title:article.title,
  description:article.excerpt,
  alternates:{canonical:url},
  openGraph:{type:"article",url,siteName:"Pesse",locale:"es_AR",title:article.title,description:article.excerpt,publishedTime:article.published_at??undefined,modifiedTime:article.editorial_updated_at??undefined,images:article.cover_url?[{url:article.cover_url,alt:article.title}]:[]},
  twitter:{card:article.cover_url?"summary_large_image":"summary",title:article.title,description:article.excerpt,images:article.cover_url?[article.cover_url]:[]}
 };
}
function estimatedReadingMinutes(body:string):number {
 const plain=body.replace(/<[^>]*>/g," ").replace(/[#*_~\x60>[\]()!]/g," ");
 const words=plain.trim().split(/\s+/).filter(Boolean).length;
 return Math.max(1,Math.ceil(words/220));
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const article=await articleBySlug(slug);if(!article)notFound();
 const db=supabase();
 const [categoryResult,related]=await Promise.all([
  article.category_id&&db?db.from("categories").select("name,slug").eq("id",article.category_id).maybeSingle():Promise.resolve({data:null}),
  publicArticles(24)
 ]);
 const category=categoryResult.data;
 const locality=article.locality_slug?localityBySlug(article.locality_slug):undefined;
 const more=related.filter(a=>a.id!==article.id&&(article.category_id?a.category_id===article.category_id:true)).slice(0,3);
 return <main className="container main article-page editorial-article">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
    "@context":"https://schema.org",
    "@type":"NewsArticle",
    headline:article.title,
    description:article.excerpt,
    datePublished:article.published_at,
    ...(article.editorial_updated_at?{dateModified:article.editorial_updated_at}:{}),
    ...(article.author_name?{author:{"@type":"Person",name:article.author_name}}:{}),
    image:article.cover_url?[article.cover_url]:undefined,
    mainEntityOfPage:(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"")+"/noticias/"+encodeURIComponent(article.slug),
    publisher:{"@type":"Organization",name:"Pesse"}
  }).replace(/</g,"\\u003c")}}/>
  <Link href="/noticias" className="more-link">← Todas las noticias</Link>
  <div id="inicio-noticia" className="article-heading"><div className="eyebrow">{category?<Link href={`/categoria/${category.slug}`}>{category.name}</Link>:"PESSE · ACTUALIDAD"}</div>
  <h1>{article.title}</h1>{locality&&<Link className="article-locality-link" href={"/localidades/"+locality.slug}>📍 {locality.name} · {locality.area}</Link>}<p className="lead">{article.excerpt}</p>
  <div className="article-meta-line"><span className="article-source">{article.author_name?`Por ${article.author_name}`:"Publicado en Pesse"}</span><time className="article-date" dateTime={article.published_at??undefined}>{article.published_at?new Date(article.published_at).toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"}):""}</time><span aria-label={`Tiempo estimado de lectura: ${estimatedReadingMinutes(article.body)} minutos`}>· {estimatedReadingMinutes(article.body)} min de lectura</span></div>{article.editorial_updated_at&&<p className="article-updated"><time dateTime={article.editorial_updated_at}>Actualizada el {new Date(article.editorial_updated_at).toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"})}</time></p>}</div>
  {article.cover_url&&<figure className="article-main-image"><img className="article-cover" src={article.cover_url} alt={article.title} width={1200} height={675} loading="eager" fetchPriority="high" decoding="async"/>{(article.cover_caption||article.cover_credit)&&<figcaption className="article-cover-caption">{article.cover_caption&&<span>{article.cover_caption}</span>}{article.cover_credit&&<span className="article-cover-credit">{article.cover_credit}</span>}</figcaption>}</figure>}
  <div className="article-layout"><div><ArticleReader body={article.body} title={article.title}/></div><aside className="article-sidebar" aria-label="Otras noticias para leer"><div className="eyebrow">SEGUÍ INFORMADO</div><h2>Más en Pesse</h2>{more.length>0?<div className="article-sidebar-list">{more.map((a,i)=><Link key={a.id} href={`/noticias/${a.slug}`} className="article-sidebar-item"><span className="article-sidebar-index">{String(i+1).padStart(2,"0")}</span><span>{a.title}</span></Link>)}</div>:<p>Historias y actualidad para seguir informado.</p>}<Link className="more-link" href="/noticias">Todas las noticias ↗</Link></aside></div>
  {more.length>0&&<section className="related-news"><div className="section-heading editorial-heading"><div><div className="eyebrow">TAMBIÉN TE PUEDE INTERESAR</div><h2>Noticias relacionadas</h2></div></div><div className="category-news-grid">{more.map(a=><Link className="category-news-card" key={a.id} href={`/noticias/${a.slug}`}>{a.cover_url&&<img src={a.cover_url} alt="" width={640} height={360} loading="lazy" decoding="async"/>}<div className="category-news-content"><h4>{a.title}</h4><p>{a.excerpt}</p></div></Link>)}</div></section>}
 </main>
}
