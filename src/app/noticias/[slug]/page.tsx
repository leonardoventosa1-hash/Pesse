export const dynamic = "force-dynamic";
import {notFound} from "next/navigation";
import Link from "next/link";
import {articleBySlug} from "@/lib/articles";
import ArticleBody from "@/components/ArticleBody";
import type {Metadata} from "next";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const article=await articleBySlug(slug);
 return article?{title:article.title,description:article.excerpt,openGraph:{title:article.title,description:article.excerpt}}:{title:"Noticia no encontrada"};
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const article=await articleBySlug(slug);if(!article)notFound();
 return <main className="container main article-page"><Link href="/noticias" className="more-link">← Todas las noticias</Link><div className="eyebrow" style={{marginTop:35}}>PESSE · ACTUALIDAD</div><h1>{article.title}</h1><p className="lead">{article.excerpt}</p><p className="muted">{article.published_at?new Date(article.published_at).toLocaleDateString("es-AR"):""}</p>{article.cover_url&&<img className="article-cover" src={article.cover_url} alt={article.title}/>}<ArticleBody body={article.body}/></main>
}
