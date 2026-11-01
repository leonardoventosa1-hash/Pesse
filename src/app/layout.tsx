import "./globals.css";
import SiteNavigation from "@/components/SiteNavigation";
import Image from "next/image";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"Pesse | Periodismo y actualidad",description:"Noticias, entrevistas y actualidad en Pesse",icons:{icon:"/pesse-icon.svg"},alternates:{types:{"application/rss+xml":"/rss.xml"}},openGraph:{title:"Pesse | Periodismo y actualidad",description:"Noticias, entrevistas y actualidad en Pesse"}};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="es"><body><header className="header"><SiteNavigation/></header>{children}<footer className="footer"><div className="container footer-inner"><Image src="/pesse-logo-verde.svg" alt="PESSE" width={140} height={34}/> <span>Información con otra mirada.</span><a href="/rss.xml" aria-label="RSS: últimas noticias de Pesse">RSS ↗</a></div></footer></body></html>}