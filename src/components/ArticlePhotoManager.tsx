"use client";
type Props={
 body:string;
 onChange:(next:string)=>void;
 disabled?:boolean;
 onReplace:(file:File,blockIndex:number,originalBlock:string)=>void;
};
const IMAGE=/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/;
const blocksOf=(body:string)=>body.split(/\n\s*\n/);
export default function ArticlePhotoManager({body,onChange,disabled=false,onReplace}:Props){
 const blocks=blocksOf(body);
 const photos=blocks.flatMap((block,index)=>{
  const match=block.trim().match(IMAGE);
  return match?[{index,alt:match[1],url:match[2],originalBlock:block}]:[];
 });
 if(!photos.length)return null;
 function changeBlock(index:number,transform:(blocks:string[])=>void){
  const next=blocksOf(body);if(index<0||index>=next.length||!IMAGE.test(next[index].trim()))return;
  transform(next);onChange(next.join("\n\n"));
 }
 function move(index:number,direction:-1|1){
  changeBlock(index,parts=>{
   const adjacent=index+direction;
   if(adjacent<0||adjacent>=parts.length)return;
   [parts[index],parts[adjacent]]=[parts[adjacent],parts[index]];
  });
 }
 function changeCaption(index:number,originalAlt:string,url:string){
  const response=window.prompt("Descripción de la fotografía",originalAlt);
  if(response===null)return;
  const caption=response.replace(/[\[\]\\]/g,"").slice(0,160);
  changeBlock(index,parts=>{parts[index]="!["+caption+"]("+url+")"});
 }
 function remove(index:number){
  if(!window.confirm("¿Quitar esta fotografía del artículo? Podés recuperarla antes de guardar si conservás una copia del texto."))return;
  changeBlock(index,parts=>{parts.splice(index,1)});
 }
 return <section className="article-photo-manager" aria-label="Administrar fotografías del artículo">
  <h3>Organizar fotografías del artículo</h3>
  <p>Mové, reemplazá, describí o quitá cada imagen sin editar el código. Los cambios quedan pendientes hasta que guardes la noticia.</p>
  <div className="article-photo-manager-list">
   {photos.map((photo,i)=><article key={photo.index} className="article-photo-manager-item">
    <img src={photo.url} alt={photo.alt||"Fotografía del artículo"} loading="lazy"/>
    <div className="article-photo-manager-controls">
     <strong>Foto {i+1} de {photos.length}</strong>
     <span title={photo.alt}>{photo.alt||"Sin descripción"}</span>
     <div className="article-photo-manager-buttons">
      <button type="button" disabled={disabled||photo.index===0} onClick={()=>move(photo.index,-1)}>Subir un bloque</button>
      <button type="button" disabled={disabled||photo.index===blocks.length-1} onClick={()=>move(photo.index,1)}>Bajar un bloque</button>
      <button type="button" disabled={disabled} onClick={()=>changeCaption(photo.index,photo.alt,photo.url)}>Descripción</button>
      <label className={"article-photo-manager-replace"+(disabled?" is-disabled":"")}>Reemplazar foto
       <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e=>{const file=e.target.files?.[0];if(file)onReplace(file,photo.index,photo.originalBlock);e.target.value=""}}/>
      </label>
      <button type="button" className="article-photo-manager-remove" disabled={disabled} onClick={()=>remove(photo.index)}>Quitar</button>
     </div>
    </div>
   </article>)}
  </div>
 </section>
}
