"use client";
import {type ReactNode} from "react";
function inline(text:string):ReactNode[]{
 const parts=text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
 return parts.map((part,i)=>{
  if(part.startsWith("**")&&part.endsWith("**"))return <strong key={i}>{part.slice(2,-2)}</strong>;
  if(part.startsWith("__")&&part.endsWith("__"))return <u key={i}>{part.slice(2,-2)}</u>;
  if(part.startsWith("*")&&part.endsWith("*"))return <em key={i}>{part.slice(1,-1)}</em>;
  const match=part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
  if(match){try{const u=new URL(match[2]);if(["https:","http:"].includes(u.protocol))return <a key={i} href={u.href} target="_blank" rel="noopener noreferrer">{match[1]}</a>}catch{}}
  return <span key={i}>{part}</span>;
 });
}
export function ArticleInline({text}:{text:string}){return <>{inline(text)}</>}
export default function ArticleBody({body}:{body:string}){
 return <div className="article-body">{body.split(/\n{2,}/).map((block,i)=>{
  const value=block.trim();if(!value)return null;
  if(value.startsWith("## "))return <h2 key={i}>{inline(value.slice(3))}</h2>;
  if(value.startsWith("### "))return <h3 key={i}>{inline(value.slice(4))}</h3>;
  const image=value.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
  if(image)return <figure key={i}><img src={image[2]} alt={image[1]} loading="lazy"/>{image[1]&&<figcaption>{image[1]}</figcaption>}</figure>;
  const lines=value.split("\n").filter(line=>line.trim());
  if(lines.length&&lines.every(line=>/^[-*] /.test(line)))return <ul key={i}>{lines.map((line,j)=><li key={j}>{inline(line.replace(/^[-*] /,""))}</li>)}</ul>;
  if(lines.length&&lines.every(line=>/^\d+\. /.test(line)))return <ol key={i}>{lines.map((line,j)=><li key={j}>{inline(line.replace(/^\d+\. /,""))}</li>)}</ol>;
  if(value.startsWith("> "))return <blockquote key={i}>{inline(value.slice(2))}</blockquote>;
  return <p key={i}>{value.split("\n").map((line,j)=><span key={j}>{j>0&&<><br/></>}{inline(line)}</span>)}</p>;
 })}</div>
}