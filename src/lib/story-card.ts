export const STORY_WIDTH=1080;
export const STORY_HEIGHT=1920;
export function wrapStoryTitle(context:CanvasRenderingContext2D,text:string,maxWidth:number):string[]{
 const lines:string[]=[];let line="";
 for(const word of text.trim().split(/\s+/)){
  const candidate=line?line+" "+word:word;
  if(context.measureText(candidate).width<=maxWidth){line=candidate;continue}
  if(line){lines.push(line);line=""}
  // Long words and URLs must also stay inside the safe area.
  for(const character of word){if(line&&context.measureText(line+character).width>maxWidth){lines.push(line);line=""}line+=character}
 }
 if(line)lines.push(line);return lines;
}
export function drawStoryCard(canvas:HTMLCanvasElement,{title,photo,logo,focus=50}:{title:string;photo:HTMLImageElement|null;logo:HTMLImageElement;focus?:number}){
 canvas.width=STORY_WIDTH;canvas.height=STORY_HEIGHT;
 const ctx=canvas.getContext("2d");if(!ctx)throw Error("No se pudo generar la imagen en este navegador.");
 ctx.fillStyle="#143c2f";ctx.fillRect(0,0,1080,1920);
 ctx.fillStyle="#f4f3e9";ctx.fillRect(72,190,936,150);
 ctx.drawImage(logo,104,225,310,80);
 ctx.fillStyle="#1a503e";ctx.font="bold 23px Arial";ctx.fillText("HISTORIAS Y ACTUALIDAD",482,263);
 const photoY=380,photoH=620;
 if(photo){
  const ratio=Math.max(936/photo.naturalWidth,photoH/photo.naturalHeight);
  const width=photo.naturalWidth*ratio,height=photo.naturalHeight*ratio;
  ctx.save();ctx.beginPath();ctx.rect(72,photoY,936,photoH);ctx.clip();
  ctx.drawImage(photo,72+(936-width)/2,photoY+(photoH-height)*Math.max(0,Math.min(1,focus/100)),width,height);ctx.restore();
 }else{
  ctx.fillStyle="#225d48";ctx.fillRect(72,photoY,936,photoH);
  ctx.fillStyle="#f4f3e9";ctx.font="bold 68px Arial";ctx.fillText("LA INFORMACIÓN",118,620);ctx.fillText("NUNCA SE TERMINA.",118,710);
  ctx.fillStyle="#e6a15d";ctx.fillRect(118,760,180,10);
 }
 ctx.fillStyle="#e6a15d";ctx.font="bold 24px Arial";ctx.fillText("PESSE · OESTE BONAERENSE",72,1060);
 let fontSize=76;let lines:string[]=[];
 for(;fontSize>=40;fontSize-=2){ctx.font=`bold ${fontSize}px Arial`;lines=wrapStoryTitle(ctx,title,936);if(lines.length*fontSize*1.18<=455)break}
 if(lines.length*fontSize*1.18>455)throw Error("El título es demasiado largo para esta placa. Acortalo para descargarla.");
 ctx.fillStyle="#fff";ctx.font=`bold ${fontSize}px Arial`;
 lines.forEach((line,index)=>ctx.fillText(line,72,1145+index*fontSize*1.18));
 ctx.fillStyle="#e6a15d";ctx.fillRect(72,1615,936,5);
 ctx.fillStyle="#fff";ctx.font="bold 36px Arial";ctx.fillText("Leé la nota completa",72,1690);
 ctx.font="26px Arial";ctx.fillStyle="#d9e6dc";ctx.fillText("@pesse.info",72,1740);
}
