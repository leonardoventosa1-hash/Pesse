import type {MetadataRoute} from "next";
import {publicArticles} from "@/lib/articles";
export const dynamic="force-dynamic";
const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"");
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const articles=await publicArticles(1000);
 const paths=["","/noticias","/buscar","/videos",...["politica","sociedad","deportes","cultura","musica","turismo","entretenimiento"].map(c=>"/categoria/"+c)];
 return [
  ...paths.map(path=>({url:site+path,changeFrequency:"daily" as const,priority:path?0.7:1})),
  ...articles.map(a=>({url:site+"/noticias/"+encodeURIComponent(a.slug),lastModified:new Date(a.published_at??a.created_at),changeFrequency:"weekly" as const,priority:0.8}))
 ];
}
