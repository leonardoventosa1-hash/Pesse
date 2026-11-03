"use client";
import {useEffect,useRef,useState} from "react";
import ArticleBody from "@/components/ArticleBody";
import ShareArticle from "@/components/ShareArticle";

export default function ArticleReader({body,title}:{body:string;title:string}){
 const [size,setSize]=useState<0|1|2>(1);
 const [progress,setProgress]=useState(0);
 const region=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const measure=()=>{
   const element=region.current;
   if(!element)return;
   const start=element.getBoundingClientRect().top+window.scrollY;
   const finish=start+element.offsetHeight;
   const visibleBottom=window.scrollY+window.innerHeight;
   const distance=Math.max(1,finish-start);
   setProgress(Math.max(0,Math.min(100,Math.round((visibleBottom-start)/distance*100))));
  };
  measure();
  window.addEventListener("scroll",measure,{passive:true});
  window.addEventListener("resize",measure);
  return()=>{window.removeEventListener("scroll",measure);window.removeEventListener("resize",measure)};
 },[]);
 return <div className="reader-section" ref={region}>
  <div className="reader-controls" aria-label="Preferencias de lectura">
   <span>Personalizá tu lectura</span>
   <button type="button" disabled={size===0} onClick={()=>setSize(s=>(Math.max(0,s-1) as 0|1|2))} aria-label="Reducir tamaño del texto">A−</button>
   <button type="button" disabled={size===2} onClick={()=>setSize(s=>(Math.min(2,s+1) as 0|1|2))} aria-label="Aumentar tamaño del texto">A+</button>
   <span className="reader-progress-label" role="status" aria-label="Progreso de lectura">{progress}% leído</span>
  </div>
  <div className="reader-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progreso de lectura">
   <div className="reader-progress-fill" style={{width:progress+"%"}}/>
  </div>
  <div className={"reader-size-"+size}><ArticleBody body={body}/></div>
  <ShareArticle title={title}/>
  <a href="#contenido-principal" className="reader-back-top">↑ Volver al inicio de la noticia</a>
 </div>;
}
