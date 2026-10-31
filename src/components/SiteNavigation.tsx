"use client";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
const items=[["Inicio","/"],["Noticias","/noticias"],["Política","/categoria/politica"],["Sociedad","/categoria/sociedad"],["Deportes","/categoria/deportes"],["Cultura","/categoria/cultura"]];
export default function SiteNavigation(){
 const [open,setOpen]=useState(false);const pathname=usePathname();
 return <nav className="container nav" aria-label="Navegación principal">
 <Link className="brand" href="/" aria-label="Pesse, ir al inicio" onClick={()=>setOpen(false)}><Image src="/pesse-logo-verde.svg" alt="PESSE" width={192} height={47} priority/></Link>
 <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}><span aria-hidden="true">{open?"✕":"☰"}</span> <span>{open?"Cerrar":"Menú"}</span></button>
 <div id="main-navigation" className={"links"+(open?" links-open":"")}>{items.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href?"page":undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</div>
 </nav>
}
