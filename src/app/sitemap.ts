import type {MetadataRoute} from "next";
import {publicArticles} from "@/lib/articles";
import {getNavigationCategories} from "@/lib/categories";
import {LOCALITIES,PARTIDOS} from "@/lib/localities";
export const dynamic="force-dynamic";
const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"");
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const [articles,categories]=await Promise.all([publicArticles(1000),getNavigationCategories()]);
 const paths=[
  "","/noticias","/videos","/partidos","/localidades",
  ...PARTIDOS.map(p=>"/partidos/"+p.slug),
  ...categories.map(c=>"/categoria/"+c.slug),
  ...LOCALITIES.map(l=>"/localidades/"+l.slug)
 ];
 // El buscador no es una página de destino editorial indexable; el sitemap
 // solo ofrece rutas públicas y canónicas. Excluir /admin/ y borradores.
 const uniquePaths=[...new Set(paths)];
 return [
  ...uniquePaths.map(path=>({url:site+path,changeFrequency:"daily" as const,priority:!path?1:path==="/partidos"?0.85:path.startsWith("/partidos/")?0.75:0.7})),
  ...articles.map(a=>({url:site+"/noticias/"+encodeURIComponent(a.slug),lastModified:new Date(a.published_at??a.created_at),changeFrequency:"weekly" as const,priority:0.8}))
 ];
}
