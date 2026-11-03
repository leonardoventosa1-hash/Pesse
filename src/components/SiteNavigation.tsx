"use client";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import type {NavigationCategory} from "@/lib/categories";
export default function SiteNavigation({categories}:{categories:NavigationCategory[]}){
 const [open,setOpen]=useState(false);const pathname=usePathname();
 return <>
 <nav className="container nav" aria-label="Navegación principal">
 <Link className="brand" href="/" aria-label="Pesse, ir al inicio" onClick={()=>setOpen(false)}><Image src="/pesse-logo-verde.svg" alt="PESSE" width={192} height={47} priority/></Link>
 <button className="mobile-menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}><span aria-hidden="true">{open?"✕":"☰"}</span><span>{open?"Cerrar":"Menú"}</span></button>
 <div id="main-navigation" className={"links"+(open?" links-open":"")}>
 <Link href="/" aria-current={pathname==="/"?"page":undefined} onClick={()=>setOpen(false)}>Inicio</Link>
 <Link href="/noticias" aria-current={pathname==="/noticias"?"page":undefined} onClick={()=>setOpen(false)}>Últimas noticias</Link>
 <Link href="/buscar" aria-current={pathname==="/buscar"?"page":undefined} onClick={()=>setOpen(false)}>Buscar</Link>
 {categories.map(({name:label,slug})=><Link className="mobile-category-link" key={slug} href={`/categoria/${slug}`} aria-current={pathname===`/categoria/${slug}`?"page":undefined} onClick={()=>setOpen(false)}>{label}</Link>)}
 </div></nav>
 <nav className="category-nav" aria-label="Secciones de Pesse"><div className="container category-nav-scroll">{categories.map(({name:label,slug})=><Link key={slug} href={`/categoria/${slug}`} aria-current={pathname===`/categoria/${slug}`?"page":undefined}>{label}</Link>)}</div></nav>
 </>;
}