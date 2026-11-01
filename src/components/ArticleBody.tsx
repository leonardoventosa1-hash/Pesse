"use client";
import {useState,type ReactNode} from "react";
function inline(text:string):ReactNode[]{
 const parts=text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
 return parts.map((part,i)=>{
  if(part.startsWith("**")&&part.endsWith("**"))return <strong key={i}>{part.slice(2,-2)}</strong>;
  const match=part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
  if(match){try{const u=new URL(match[2]);if(["https:","http:"].includes(u.protocol))return <a key={i} href={u.href} target="_blank" rel="noopener noreferrer">{match[1]}</a>}catch{}}
  return <span key={i}>{part}</span>;
 });
}
export default function ArticleBody({body}:{body:string}){
 const [size,setSize]=useState(1);
 return <section className="reader-section"><div className="reader-controls" aria-label="Ajustar tamaño del texto"><span>Texto de la noticia</span><button type="button" aria-label="Reducir tamaño del texto" disabled={size===0} onClick={()=>setSize(v=>Math.max(0,v-1))}>A−</button><button type="button" aria-label="Aumentar tamaño del texto" disabled={size===2} onClick={()=>setSize(v=>Math.min(2,v+1))}>A+</button></div><div className={`article-body reader-size-${size}`}>{body.split(/\n{2,}/).map((block,i)=>{
  const value=block.trim();if(!value)return null;
  if(value.startsWith("## "))return <h2 key={i}>{inline(value.slice(3))}</h2>;
  if(value.startsWith("### "))return <h3 key={i}>{inline(value.slice(4))}</h3>;
  const image=value.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
  if(image)return <figure key={i}><img src={image[2]} alt={image[1]} loading="lazy"/>{image[1]&&<figcaption>{image[1]}</figcaption>}</figure>;
  if(value.startsWith("> "))return <blockquote key={i}>{inline(value.slice(2))}</blockquote>;
  return <p key={i}>{value.split("\n").map((line,j)=><span key={j}>{j>0&&<><br/></>}{inline(line)}</span>)}</p>;
 })}</div></section>
}