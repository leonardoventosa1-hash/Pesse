import "./globals.css";
import SiteNavigation from "@/components/SiteNavigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {getSiteSettings,socialLinks} from "@/lib/site-settings";
import {getNavigationCategories} from "@/lib/categories";
import {mediaUrl} from "@/lib/brand-ads";
const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL||"https://pesse-gilt.vercel.app").replace(/\/$/,"");
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{
 const settings=await getSiteSettings();
 const links=socialLinks(settings);
 const title=settings.site_name+" | Periodismo y actualidad";
 return {
  metadataBase:new URL(siteUrl),
  robots:process.env.VERCEL_ENV==="preview"?{index:false,follow:false}:undefined,
  verification:process.env.GOOGLE_SITE_VERIFICATION?{google:process.env.GOOGLE_SITE_VERIFICATION}:undefined,
  title,description:settings.description,
  icons:{icon:"/pesse-icon.svg"},
  alternates:{canonical:"/",types:{"application/rss+xml":"/rss.xml"}},
  openGraph:{title,description:settings.description},
  other:{"og:see_also":links.map(link=>link.url)}
 };
}
export default async function Layout({children}:{children:React.ReactNode}){
 const [settings,categories]=await Promise.all([getSiteSettings(),getNavigationCategories()]);const links=socialLinks(settings);const logoUrl=mediaUrl(settings.logo_path,"brand");
 return <html lang="es"><body data-brand-variant={settings.brand_variant}><a className="skip-to-content" href="#contenido-principal">Saltar al contenido principal</a><header className="header"><SiteNavigation categories={categories} logoUrl={logoUrl}/></header><div id="contenido-principal" tabIndex={-1}>{children}</div><footer className="footer"><div className="container footer-inner">{logoUrl?<img src={logoUrl} alt="PESSE" width={140} height={34} style={{maxWidth:140,maxHeight:34,objectFit:"contain"}}/>:<Image src="/pesse-logo-verde.svg" alt="PESSE" width={140} height={34}/>}<span>{settings.tagline}</span><nav className="footer-social" aria-label="Redes sociales de Pesse"><span className="footer-social-heading">Seguinos en redes</span>{links.map(({label,url})=><a className="footer-social-link" key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={"Pesse en "+label+" (abre en otra pestaña)"}><img className="footer-social-symbol" src={"/social/"+label.toLowerCase()+".svg"} alt="" aria-hidden="true" width={20} height={20}/><span>{label}</span></a>)}<a href="/rss.xml" aria-label="RSS: últimas noticias de Pesse">RSS ↗</a></nav></div><nav className="container footer-institutional" aria-label="Información institucional"><Link href="/quienes-somos">Quiénes somos</Link><Link href="/contacto">Contacto</Link><Link href="/privacidad">Privacidad</Link></nav></footer></body></html>;
}