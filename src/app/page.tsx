export const dynamic = "force-dynamic";

import Link from "next/link";
import {homepageArticles,publicArticles} from "@/lib/articles";
import {getNavigationCategories} from "@/lib/categories";
import HomepageBlocks from "@/components/HomepageBlocks";
import {getHomepageSections} from "@/lib/homepage-sections";
import {getSiteSettings} from "@/lib/site-settings";
import SponsorPlacement from "@/components/SponsorPlacement";
import type {Article} from "@/lib/supabase";
import WestPartiesMap from "@/components/WestPartiesMap";

const formatDate=(date:string|null)=>date?new Date(date).toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"}):"";
function StoryDate({article}:{article:Article}){
 return article.published_at?<time className="story-date" dateTime={article.published_at}>{formatDate(article.published_at)}</time>:null;
}
export default async function Home(){
 const [featured,allArticles,categories,homepageSections,settings]=await Promise.all([
  homepageArticles(9),publicArticles(48),getNavigationCategories(),getHomepageSections(),getSiteSettings()
 ]);
 const lead=featured[0];
 const secondary=featured.slice(1,5);
 const briefs=featured.slice(5,9);
 const categoryNames=new Map(categories.map(c=>[c.id,c.name]));
 const sectionLabel=(article:Article)=>categoryNames.get(article.category_id??"")??"Actualidad";
 const categoryShortcuts=categories.slice(0,5);
 // No duplicar historias ya presentes en los destacados de apertura.
 const showcasedIds=new Set(featured.map(article=>article.id));
 const recentArticles=allArticles.filter(article=>!showcasedIds.has(article.id)).slice(0,6);

 return <>
  <section className="topline home-topline"><div className="container topline-inner"><span>ZONA OESTE · PROVINCIA DE BUENOS AIRES · ARGENTINA</span></div></section>
  <section className="home-intro">
   <div className="container home-intro-inner">
    <div className="home-intro-copy">
     <div className="home-intro-kicker"><span className="home-kicker-mark" aria-hidden="true"/> INFORMACIÓN · CONTEXTO · ACTUALIDAD</div>
     <h1>{settings.hero_title} <em>{settings.hero_emphasis}</em></h1>
     <p>{settings.hero_description}</p>
    </div>
    <div className="home-intro-aside">
     <span className="home-intro-aside-label">LA INFORMACIÓN NUNCA SE TERMINA</span>
     <p>Historias, voces y noticias para entender lo que pasa.</p>
     <Link href="/noticias">Ir a las últimas noticias <span aria-hidden="true">↗</span></Link>
    </div>
   </div>
  </section>
  <main className="container main pesse-home">
   {categoryShortcuts.length>0&&<nav aria-label="Accesos rápidos a secciones" className="home-shortcuts">
    <span>Explorá</span><Link href="#home-cover-title" className="home-shortcuts-feature">Destacadas</Link><Link href={recentArticles.length?"#home-latest-title":"/noticias"} className="home-shortcuts-feature">Últimas noticias</Link><Link href="#home-locales-title" className="home-shortcuts-feature">Zona oeste</Link>{categoryShortcuts.map(c=><Link key={c.id} href={`/categoria/${c.slug}`}>{c.name} <span aria-hidden="true">↗</span></Link>)}
    <Link href="/buscar" className="home-shortcuts-search">Buscar noticias <span aria-hidden="true">⌕</span></Link>
   </nav>}
   <section className="home-cover" aria-labelledby="home-cover-title">
    <div className="home-section-head">
     <div><div className="eyebrow">LA AGENDA DE PESSE</div><h2 id="home-cover-title">En primer plano<span className="home-heading-dot">.</span></h2></div>
     <Link href="/noticias" className="home-section-more">Ver todas las noticias <span aria-hidden="true">↗</span></Link>
    </div>
    {lead?<div className="home-cover-grid">
     <Link className="home-cover-lead" href={`/noticias/${lead.slug}`}>
      <div className="home-cover-media">
       {lead.cover_url?<img src={lead.cover_url} alt="" width={1200} height={760} fetchPriority="high" loading="eager" decoding="async"/>:<div className="home-cover-placeholder" aria-hidden="true">P.</div>}
       <span className="home-cover-lead-tag">NOTICIA DESTACADA</span>
      </div>
      <div className="home-cover-lead-text">
       <div className="home-story-kicker">{sectionLabel(lead)} <span aria-hidden="true">·</span> <StoryDate article={lead}/></div>
       <h3>{lead.title}</h3>
       {lead.excerpt&&<p>{lead.excerpt}</p>}
       <span className="home-story-link">Leer noticia <span aria-hidden="true">↗</span></span>
      </div>
     </Link>
     <div className="home-cover-side">
      {secondary.map((article,i)=><Link href={`/noticias/${article.slug}`} key={article.id} className="home-cover-side-story">
       <div className="home-cover-side-text">
        <div className="home-story-kicker">{String(i+1).padStart(2,"0")} <span aria-hidden="true">/</span> {sectionLabel(article)}</div>
        <h3>{article.title}</h3>
        <StoryDate article={article}/>
       </div>
       <div className="home-cover-side-media">{article.cover_url?<img src={article.cover_url} alt="" width={280} height={210} loading="lazy" decoding="async"/>:<span aria-hidden="true">P.</span>}</div>
      </Link>)}
      {secondary.length===0&&<div className="home-cover-side-empty"><span className="eyebrow">SEGUÍ EXPLORANDO</span><h3>Siempre hay algo más para descubrir.</h3><Link href="/noticias">Todas las noticias ↗</Link></div>}
     </div>
    </div>:<div className="home-cover-empty">
     <span className="home-cover-placeholder" aria-hidden="true">P.</span>
     <div><span className="eyebrow">REDACCIÓN PESSE</span><h3>Las historias empiezan acá.</h3><p>Las noticias aparecerán en esta portada cuando el equipo editorial publique sus primeras coberturas.</p><Link href="/noticias" className="home-section-more">Visitar el archivo de noticias ↗</Link></div>
    </div>}
   </section>
   {briefs.length>0&&<section className="home-briefs" aria-label="Más noticias recientes">
    <div className="home-briefs-heading"><span className="home-briefs-mark" aria-hidden="true"/> MÁS NOTICIAS</div>
    <div className="home-briefs-grid">{briefs.map(article=><Link href={`/noticias/${article.slug}`} key={article.id} className="home-brief">
     <span className="home-story-kicker">{sectionLabel(article)} <span aria-hidden="true">·</span> <StoryDate article={article}/></span>
     <h3>{article.title}</h3><span className="home-brief-arrow" aria-hidden="true">↗</span>
    </Link>)}</div>
   </section>}
   {recentArticles.length>0&&<section className="home-latest" aria-labelledby="home-latest-title">
    <div className="home-section-head home-latest-head">
     <div><div className="eyebrow">SEGUÍ INFORMÁNDOTE</div><h2 id="home-latest-title">Últimas noticias<span className="home-heading-dot">.</span></h2></div>
     <Link href="/noticias" className="home-section-more">Ir al archivo completo <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="home-latest-grid">
     {recentArticles.map((article,i)=><Link className="home-latest-item" href={`/noticias/${article.slug}`} key={article.id}>
      <div className="home-latest-item-content">
       <span className="home-latest-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span>
       <div className="home-latest-item-copy">
        <div className="home-story-kicker">{sectionLabel(article)} <span aria-hidden="true">·</span> <StoryDate article={article}/></div>
        <h3>{article.title}</h3>
        {article.excerpt&&<p>{article.excerpt}</p>}
       </div>
      </div>
      <div className="home-latest-item-media" aria-hidden="true">{article.cover_url?<img src={article.cover_url} alt="" width={160} height={120} loading="lazy" decoding="async"/>:<span>P.</span>}</div>
      <span className="home-latest-arrow" aria-hidden="true">↗</span>
     </Link>)}
    </div>
    <div className="home-latest-footer"><Link href="/noticias">Todas las noticias de Pesse <span aria-hidden="true">↗</span></Link></div>
   </section>}
   <section className="home-locales" aria-labelledby="home-locales-title">
    <div className="home-locales-lead">
     <span className="home-locales-overline"><span aria-hidden="true" className="home-locales-signal"/> PESSE / COBERTURA REGIONAL</span>
     <h2 id="home-locales-title">Lo que pasa <em>cerca.</em></h2>
     <p>La actualidad de La Matanza y zona oeste también merece estar en primer plano. Explorá las noticias de cada partido del oeste bonaerense.</p>
     <Link href="/partidos" className="home-locales-link">Explorar partidos <span aria-hidden="true">↗</span></Link>
    </div>
    <WestPartiesMap/>
   </section>
   <SponsorPlacement placement="home_mid"/>
   <HomepageBlocks articles={allArticles} categories={categories} sections={homepageSections}/>
   <SponsorPlacement placement="home_bottom"/>
  </main>
 </>;
}
