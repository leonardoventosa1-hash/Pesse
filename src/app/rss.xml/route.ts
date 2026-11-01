import {publicArticles} from "@/lib/articles";
export const dynamic="force-dynamic";
const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"");
function xml(value:string):string{return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}
export async function GET(){
 const articles=await publicArticles(50);
 const items=articles.map(a=>{
  const url=site+"/noticias/"+encodeURIComponent(a.slug);
  const date=a.published_at??a.created_at;
  return "<item><title>"+xml(a.title)+"</title><link>"+xml(url)+"</link><guid isPermaLink=\"true\">"+xml(url)+"</guid><description>"+xml(a.excerpt??"")+"</description><pubDate>"+new Date(date).toUTCString()+"</pubDate></item>";
 }).join("");
 const feed='<?xml version="1.0" encoding="UTF-8"?>'+'<rss version="2.0"><channel><title>Pesse | Últimas noticias</title><link>'+xml(site)+'</link><description>Actualidad, periodismo y noticias de Pesse.</description><language>es-ar</language>'+items+'</channel></rss>';
 return new Response(feed,{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, max-age=60, s-maxage=300"}});
}
