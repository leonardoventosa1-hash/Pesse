import Link from "next/link";
import type {ReactNode} from "react";
const pages=[{href:"/quienes-somos",label:"Quiénes somos"},{href:"/contacto",label:"Contacto"},{href:"/privacidad",label:"Privacidad"}];
export default function InstitutionalPage({title,intro,current,children}:{title:string;intro:string;current:string;children:ReactNode}){
 return <main className="container main institutional-page"><div className="eyebrow">PESSE · INSTITUCIONAL</div><h1>{title}</h1><p className="institutional-intro">{intro}</p><nav className="institutional-nav" aria-label="Información institucional">{pages.map(page=><Link key={page.href} href={page.href} aria-current={current===page.href?"page":undefined}>{page.label}</Link>)}</nav><div className="institutional-content">{children}</div></main>;
}
