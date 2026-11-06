"use client";
import {useState} from "react";

type Props={body:string;onChange:(value:string)=>void;disabled?:boolean;onReorder?:()=>void};
type BlockKind="Fotografía"|"Subtítulo"|"Encabezado"|"Cita"|"Lista numerada"|"Lista con viñetas"|"Párrafo";

function describe(block:string):{kind:BlockKind;label:string;image?:string}{
 const value=block.trim();
 const image=value.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
 if(image)return {kind:"Fotografía",label:image[1]||"Imagen sin descripción",image:image[2]};
 if(value.startsWith("### "))return {kind:"Encabezado",label:value.slice(4)};
 if(value.startsWith("## "))return {kind:"Subtítulo",label:value.slice(3)};
 if(value.split("\n").every(line=>line.startsWith("> ")))return {kind:"Cita",label:value.replace(/^> /gm,"")};
 if(value.split("\n").every(line=>/^\d+\. /.test(line)))return {kind:"Lista numerada",label:value.replace(/^\d+\. /gm,"")};
 if(value.split("\n").every(line=>/^[-*] /.test(line)))return {kind:"Lista con viñetas",label:value.replace(/^[-*] /gm,"")};
 return {kind:"Párrafo",label:value};
}
export default function ArticleBlockOrganizer({body,onChange,disabled=false,onReorder}:Props){
 const [open,setOpen]=useState(false);
 const parts=body.split(/\n\s*\n/).filter(part=>part.trim().length>0);
 if(parts.length<2)return null;
 function move(index:number,step:-1|1){
  if(disabled)return;
  const target=index+step;
  if(target<0||target>=parts.length)return;
  const updated=[...parts];
  [updated[index],updated[target]]=[updated[target],updated[index]];
  onChange(updated.join("\n\n")+"\n\n");
  onReorder?.();
 }
 return <section className="writing-block-organizer" aria-label="Organizar bloques de la noticia">
  <button type="button" className="writing-block-organizer-toggle" aria-expanded={open} onClick={()=>setOpen(prev=>!prev)}>
   <span><strong>Ordenar bloques del artículo</strong><small>{parts.length} bloques de texto e imágenes</small></span>
   <span aria-hidden="true">{open?"−":"+"}</span>
  </button>
  {open&&<div className="writing-block-organizer-panel">
   <p>Reordená párrafos, subtítulos, citas, listas y fotografías sin cortar y pegar. Los bloques conservan su contenido y sus formatos. Para guardar el nuevo orden, guardá la noticia.</p>
   <ol className="writing-block-organizer-list">
    {parts.map((part,index)=>{
     const info=describe(part);
     return <li className="writing-block-organizer-item" key={index}>
      <span className="writing-block-organizer-number" aria-label={"Bloque "+(index+1)}>{index+1}</span>
      {info.image?<img className="writing-block-organizer-thumbnail" src={info.image} alt={info.label} loading="lazy"/>:null}
      <div className="writing-block-organizer-description">
       <strong>{info.kind}</strong>
       <span title={info.label}>{info.label}</span>
      </div>
      <div className="writing-block-organizer-actions">
       <button type="button" disabled={disabled||index===0} aria-label={"Mover bloque "+(index+1)+" hacia arriba"} onClick={()=>move(index,-1)}>↑ Subir</button>
       <button type="button" disabled={disabled||index===parts.length-1} aria-label={"Mover bloque "+(index+1)+" hacia abajo"} onClick={()=>move(index,1)}>↓ Bajar</button>
      </div>
     </li>
    })}
   </ol>
  </div>}
 </section>
}
