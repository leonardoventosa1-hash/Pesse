import Link from "next/link";
import type {Article,Category} from "@/lib/supabase";
export default function CategoryNewsSections({articles,categories}:{articles:Article[];categories:Category[]}){
 const groups=categories.map(category=>({category,items:articles.filter(article=>article.category_id===category.id).slice(0,3)})).filter(group=>group.items.length>0);
 if(!groups.length)return null;
 return <section className="category-news" aria-label="Noticias por sección">
  <div className="section-heading editorial-heading"><div><div className="eyebrow">LAS NOTICIAS POR TEMA</div><h2>Secciones</h2></div></div>
  {groups.map(({category,items})=><section className="category-news-group" key={category.id}>
   <div className="category-news-heading"><h3>{category.name}</h3><Link href={`/categoria/${category.slug}`} className="more-link">Ver sección ↗</Link></div>
   <div className="category-news-grid">{items.map(article=><Link key={article.id} className="category-news-card" href={`/noticias/${article.slug}`}>
   {article.cover_url?<img src={article.cover_url} alt="" loading="lazy"/>:<div className="category-news-placeholder">P.</div>}
   <div className="category-news-content"><span className="eyebrow">{category.name}</span><h4>{article.title}</h4>{article.excerpt&&<p>{article.excerpt}</p>}</div>
   </Link>)}</div>
  </section>)}
 </section>;
}