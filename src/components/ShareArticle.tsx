"use client";
import {useState} from "react";
export default function ShareArticle({title}:{title:string}){
 const [notice,setNotice]=useState("");
 function share(kind:"whatsapp"|"facebook"|"telegram"|"copy"){
  const url=window.location.href;
  if(kind==="whatsapp"){
   window.open("https://wa.me/?text="+encodeURIComponent(title+" "+url),"_blank","noopener,noreferrer");
   return;
  }
  if(kind==="facebook"){
   window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url),"_blank","noopener,noreferrer");
   return;
  }
  if(kind==="telegram"){
   window.open("https://t.me/share/url?url="+encodeURIComponent(url)+"&text="+encodeURIComponent(title),"_blank","noopener,noreferrer");
   return;
  }
  if(navigator.clipboard?.writeText){
   void navigator.clipboard.writeText(url).then(()=>setNotice("Enlace copiado")).catch(()=>setNotice("No se pudo copiar el enlace."));
  }else{setNotice("No se pudo copiar el enlace.")}
 }
 return <div className="article-share">
  <strong>Compartir esta noticia</strong>
  <div className="article-share-actions">
   <button type="button" onClick={()=>share("whatsapp")}>WhatsApp ↗</button>
   <button type="button" onClick={()=>share("facebook")}>Facebook ↗</button>
   <button type="button" onClick={()=>share("telegram")}>Telegram ↗</button>
   <button type="button" onClick={()=>share("copy")}>Copiar enlace</button>
  </div>
  {notice&&<span role="status" aria-live="polite">{notice}</span>}
 </div>;
}
