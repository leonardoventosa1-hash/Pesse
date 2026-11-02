import type {MetadataRoute} from "next";
const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"");
export default function robots():MetadataRoute.Robots{
 if(process.env.VERCEL_ENV==="preview")return {rules:[{userAgent:"*",disallow:"/"}]};
 return {rules:[{userAgent:"*",allow:"/",disallow:"/admin/"}],sitemap:site+"/sitemap.xml"};
}
