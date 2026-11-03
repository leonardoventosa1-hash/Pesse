import Link from "next/link";
import CategoryNewsSections from "@/components/CategoryNewsSections";
import type {Article} from "@/lib/supabase";
import type {NavigationCategory} from "@/lib/categories";
import type {HomepageSection} from "@/lib/homepage-sections";

const defaultDescriptions:Record<string,string>={
 politica:"Decisiones y protagonistas de la agenda pública.",
 sociedad:"Las historias que impactan en nuestra comunidad.",
 deportes:"Competencias, equipos y protagonistas.",
 cultura:"Arte, patrimonio y expresiones culturales.",
 musica:"Artistas, lanzamientos, recitales y festivales.",
 turismo:"Destinos, escapadas y experiencias para descubrir.",
 entretenimiento:"Espectáculos, televisión, cine y tendencias."
};
export default function HomepageBlocks({articles,categories,sections}:{
 articles:Article[];categories:NavigationCategory[];sections:HomepageSection[]
}){
 return <>{sections.filter(s=>s.is_visible).map(s=>{
  if(s.section_key==="news_by_category")
   return <CategoryNewsSections key={s.section_key} articles={articles} categories={categories}/>;
  if(s.section_key==="category_directory")
   return <section key={s.section_key} className="category-section"><div className="section-heading"><div><div className="eyebrow">ELEGÍ TU TEMA</div><h2>Explorá las secciones</h2></div></div><div className="category-grid">{categories.map((cat,i)=><Link href={`/categoria/${cat.slug}`} className="category-card" key={cat.slug}><span className="category-number">{String(i+1).padStart(2,"0")}</span><h3>{cat.name}</h3><p>{cat.description||defaultDescriptions[cat.slug]||"Noticias y novedades de esta sección."}</p><span className="category-arrow">↗</span></Link>)}</div></section>;
  if(s.section_key==="video_promo")
   return <section key={s.section_key} className="newsletter-banner"><div><div className="eyebrow">PESSE EN TODAS PARTES</div><h2>Más historias. Más formatos.</h2><p>Noticias, entrevistas y coberturas audiovisuales en nuestras plataformas.</p></div><Link className="light-button" href="/videos">Conocé nuestros videos ↗</Link></section>;
  return null;
 })}</>;
}
