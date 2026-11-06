"use client";
import {useState} from "react";
import {WEST_MAP_VIEWBOX,WEST_PARTY_SHAPES} from "@/lib/west-map-shapes";

export default function WestPartiesMap(){
 const [active,setActive]=useState<string|null>(null);
 const [position,setPosition]=useState<{x:number;y:number}|null>(null);
 const current=WEST_PARTY_SHAPES.find(partido=>partido.slug===active);
 function track(event:React.MouseEvent<SVGAElement>){
  const svg=event.currentTarget.ownerSVGElement;
  if(!svg)return;
  const box=svg.getBoundingClientRect();
  setPosition({x:Math.max(78,Math.min(event.clientX-box.left,box.width-95)),y:Math.max(22,event.clientY-box.top-47)});
 }
 return <div className="home-west-map" aria-label="Mapa interactivo de partidos de zona oeste">
  <div className="home-west-map-heading"><span>MAPA DE COBERTURA</span><span>BUENOS AIRES · OESTE</span></div>
  <div className="home-west-map-graphic">
   <svg className="home-west-map-svg" viewBox={WEST_MAP_VIEWBOX} role="group" aria-label="Elegí un partido para leer noticias locales">
    {WEST_PARTY_SHAPES.map(partido=><a
     key={partido.slug}
     href={"/partidos/"+partido.slug}
     className={"home-west-map-region"+(active===partido.slug?" is-active":"")+(active&&active!==partido.slug?" is-dimmed":"")}
     aria-label={"Noticias de "+partido.name}
     onMouseEnter={()=>setActive(partido.slug)}
     onMouseMove={track}
     onMouseLeave={()=>{setActive(null);setPosition(null)}}
     onFocus={()=>{setActive(partido.slug);setPosition(null)}}
     onBlur={()=>{setActive(null);setPosition(null)}}
    ><title>{partido.name} · Ver noticias</title><path d={partido.path}/></a>)}
   </svg>
   {current&&<div className={"home-west-map-tooltip"+(position?" follows-cursor":"")} style={position?{left:position.x,top:position.y}:undefined} role="status">
    <small>PARTIDO DE</small><strong>{current.name}</strong><span>Ver noticias ↗</span>
   </div>}
  </div>
  <div className="home-west-map-footer"><span><span className="home-west-map-legend" aria-hidden="true"/> {current?"Seleccionado: "+current.name:"Pasá el cursor o tocá un partido"}</span><span>05 PARTIDOS</span></div>
  <p className="home-west-map-source">Límites cartográficos simplificados para navegación · Base geográfica IGN/CONAE.</p>
 </div>;
}
