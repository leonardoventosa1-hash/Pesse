export const dynamic = "force-dynamic";
import {notFound} from "next/navigation";
import Link from "next/link";
import {articleBySlug,publicArticles} from "@/lib/articles";
import {supabase} from "@/lib/supabase";
import ArticleBody from "@/components/ArticleBody";
import ShareArticle from "@/components/ShareArticle";
import type {Metadata} from "next";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const article=await articleBySlug(slug);
 return article?{title:article.title,description:article.excerpt,openGraph:{type:"article",title:article.title,description:article.excerpt,images:article.cover_url?[article.cover_url]:[]}}:{title:"Noticia no encontrada"};
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const article=await articleBySlug(slug);if(!article)notFound();
 const db=supabase();
 const [categoryResult,related]=await Promise.all([
  article.category_id&&db?db.from("categories").select("name,slug").eq("id",article.category_id).maybeSingle():Promise.resolve({data:null}),
  publicArticles(24)
 ]);
 const category=categoryResult.data;
 const more=related.filter(a=>a.id!==article.id&&(article.category_id?a.category_id===article.category_id:true)).slice(0,3);
 return <main className="container main article-page editorial-article">
  <Link href="/noticias" className="more-link">← Todas las noticias</Link>
  <div className="article-heading"><div className="eyebrow">{category?<Link href={`/categoria/${category.slug}`}>{category.name}</Link>:"PESSE · ACTUALIDAD"}</div>
  <h1>{article.title}</h1><p className="lead">{article.excerpt}</p>
  <time className="article-date" dateTime={article.published_at??undefined}>{article.published_at?new Date(article.published_at).toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"}):""}</time></div>
  {article.cover_url&&<figure className="article-main-image"><img className="article-cover" src={article.cover_url} alt={article.title}/></figure>}
  <div className="article-layout"><div><ArticleBody body={article.body}/><ShareArticle title={article.title}/></div><aside className="article-sidebar"><div className="eyebrow">SEGUÍ LEYENDO</div><h2>Más en Pesse</h2><p>Historias y actualidad para seguir informado.</p><Link className="more-link" href="/noticias">Todas las noticias ↗</Link></aside></div>
  {more.length>0&&<section className="related-news"><div className="section-heading editorial-heading"><div><div className="eyebrow">TAMBIÉN TE PUEDE INTERESAR</div><h2>Noticias relacionadas</h2></div></div><div className="category-news-grid">{more.map(a=><Link className="category-news-card" key={a.id} href={`/noticias/${a.slug}`}>{a.cover_url&&<img src={a.cover_url} alt="" loading="lazy"/>}<div className="category-news-content"><h4>{a.title}</h4><p>{a.excerpt}</p></div></Link>)}</div></section>}
 </main>
}
