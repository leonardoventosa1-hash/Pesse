export const dynamic = "force-dynamic";
import Link from "next/link";
import {supabase,type Article} from "@/lib/supabase";
import {notFound} from "next/navigation";
const descriptions:Record<string,string>={
 politica:"Decisiones, instituciones y protagonistas de la actualidad política.",
 sociedad:"Historias, comunidades y temas que atraviesan nuestra vida cotidiana.",
 deportes:"Resultados, competencias y protagonistas del deporte.",
 cultura:"Arte, patrimonio y expresiones culturales.",
 musica:"Artistas, recitales, lanzamientos y la música que nos acompaña.",
 turismo:"Destinos, viajes, escapadas y lugares para descubrir.",
 entretenimiento:"Cine, televisión, espectáculos y tendencias."
};
export default async function Categoria({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const db=supabase();
 const {data:category}=db?await db.from("categories").select("id,name").eq("slug",slug).maybeSingle():{data:null};
 if(!category){if(db)notFound();return <main className="container main"><h1>Sección en preparación</h1><p>Falta conectar la base de datos.</p></main>}
 const {data}=await db!.from("articles").select("id,slug,title,excerpt,cover_url,status,published_at,created_at").eq("category_id",category.id).eq("status","published").is("deleted_at",null).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false}).limit(50);
 const articles=(data??[]) as Article[];
 const lead=articles[0];
 return <main className="container main category-landing">
  <div className="category-landing-intro"><Link className="more-link" href="/">← Inicio</Link><div className="eyebrow">PESSE / SECCIONES</div><h1>{category.name}</h1><p>{descriptions[slug]??"Toda la información de esta sección en Pesse."}</p></div>
  {lead?<><Link className="category-top-story" href={`/noticias/${lead.slug}`}>{lead.cover_url?<img src={lead.cover_url} alt=""/>:<div className="category-news-placeholder">P.</div>}<div className="category-top-story-text"><span className="eyebrow">ÚLTIMA NOTICIA · {category.name}</span><h2>{lead.title}</h2>{lead.excerpt&&<p>{lead.excerpt}</p>}<span className="more-link">Leer artículo ↗</span></div></Link>
  {articles.length>1&&<section className="category-story-list"><div className="section-heading editorial-heading"><div><div className="eyebrow">SEGUÍ INFORMÁNDOTE</div><h2>Más de {category.name}</h2></div></div><div className="category-news-grid">{articles.slice(1).map(a=><Link className="category-news-card" href={`/noticias/${a.slug}`} key={a.id}>{a.cover_url?<img src={a.cover_url} alt="" loading="lazy"/>:<div className="category-news-placeholder">P.</div>}<div className="category-news-content"><span className="eyebrow">{category.name}</span><h4>{a.title}</h4><time className="story-date" dateTime={a.published_at??undefined}>{a.published_at?new Date(a.published_at).toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"}):""}</time><p>{a.excerpt}</p></div></Link>)}</div></section>}</>:<div className="category-empty"><h2>Pronto, nuevas historias de {category.name}</h2><p>Todavía no hay artículos publicados en esta sección. Mientras tanto, explorá las últimas noticias de Pesse.</p><Link className="primary-button" href="/noticias">Ver últimas noticias ↗</Link></div>}
 </main>;
}
