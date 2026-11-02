import "./globals.css";
import SiteNavigation from "@/components/SiteNavigation";
import Image from "next/image";
import type { Metadata } from "next";
const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"");
const socialPlatforms=[
 {label:"Instagram",env:process.env.NEXT_PUBLIC_PESSE_INSTAGRAM,host:"instagram.com"},
 {label:"Facebook",env:process.env.NEXT_PUBLIC_PESSE_FACEBOOK,host:"facebook.com"},
 {label:"YouTube",env:process.env.NEXT_PUBLIC_PESSE_YOUTUBE,host:"youtube.com"},
 {label:"TikTok",env:process.env.NEXT_PUBLIC_PESSE_TIKTOK,host:"tiktok.com"}
];
const socialLinks=socialPlatforms.flatMap(({label,env,host})=>{
 if(!env)return [];
 try{const url=new URL(env);const hostname=url.hostname.toLowerCase();return url.protocol==="https:"&&(hostname===host||hostname==="www."+host)?[{label,url:url.toString()}]:[]}catch{return []}
});
export const metadata: Metadata = {metadataBase:new URL(siteUrl),verification:process.env.GOOGLE_SITE_VERIFICATION?{google:process.env.GOOGLE_SITE_VERIFICATION}:undefined,title:"Pesse | Periodismo y actualidad",description:"Noticias, entrevistas y actualidad en Pesse",icons:{icon:"/pesse-icon.svg"},alternates:{canonical:"/",types:{"application/rss+xml":"/rss.xml"}},openGraph:{title:"Pesse | Periodismo y actualidad",description:"Noticias, entrevistas y actualidad en Pesse"}};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="es"><body><a className="skip-to-content" href="#contenido-principal">Saltar al contenido principal</a><header className="header"><SiteNavigation/></header><div id="contenido-principal" tabIndex={-1}>{children}</div><footer className="footer"><div className="container footer-inner"><Image src="/pesse-logo-verde.svg" alt="PESSE" width={140} height={34}/> <span>Información con otra mirada.</span><nav className="footer-social" aria-label="Redes sociales de Pesse">{socialLinks.map(({label,url})=><a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={"Pesse en "+label}>{label} ↗</a>)}<a href="/rss.xml" aria-label="RSS: últimas noticias de Pesse">RSS ↗</a></nav></div></footer></body></html>}