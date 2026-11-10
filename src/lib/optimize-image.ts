// Client-side processing: only the optimized file is sent to Storage.
const MAX_BYTES=5*1024*1024;
const MAX_EDGE=1920;
const TARGET_BYTES=350*1024;
const TYPES=["image/jpeg","image/png","image/webp"];
type Decoded={source:CanvasImageSource;width:number;height:number;release:()=>void};
export type OptimizedImage={file:File;originalBytes:number;width:number;height:number};

async function decode(file:File):Promise<Decoded>{
 if(typeof createImageBitmap==="function"){
  try{
   // Browser decoding applies EXIF orientation before resizing.
   const bitmap=await createImageBitmap(file);
   return {source:bitmap,width:bitmap.width,height:bitmap.height,release:()=>bitmap.close()};
  }catch{/* Try the standard image decoder if ImageBitmap is unavailable for this file. */}
 }
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("No se pudo leer la imagen. Probá con otro archivo JPG, PNG o WebP."));image.src=url});
  return {source:image,width:image.naturalWidth,height:image.naturalHeight,release:()=>URL.revokeObjectURL(url)};
 }catch(error){URL.revokeObjectURL(url);throw error}
}
function encode(canvas:HTMLCanvasElement,type:string,quality:number):Promise<Blob>{
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("No se pudo preparar la imagen. Volvé a intentarlo.")),type,quality));
}
export async function optimizeImage(file:File):Promise<OptimizedImage>{
 if(!TYPES.includes(file.type)||file.size===0||file.size>MAX_BYTES)throw new Error("Solo JPG, PNG o WebP hasta 5 MB.");
 const image=await decode(file);
 const canvas=document.createElement("canvas");
 try{
  if(image.width<1||image.height<1||image.width*image.height>48_000_000)throw new Error("La imagen tiene dimensiones demasiado grandes. Exportala con menor resolución e intentá otra vez.");
  const scale=Math.min(1,MAX_EDGE/Math.max(image.width,image.height));
  let width=Math.max(1,Math.round(image.width*scale));
  let height=Math.max(1,Math.round(image.height*scale));
  const context=canvas.getContext("2d");
  if(!context)throw new Error("Tu navegador no pudo preparar la imagen. Probá con un navegador actualizado.");
  const draw=()=>{canvas.width=width;canvas.height=height;context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";context.drawImage(image.source,0,0,width,height)};
  draw();
  let best=await encode(canvas,"image/webp",0.82);
  // Unsupported WebP encoders return PNG. Keep that format to preserve transparency.
  if(best.type==="image/webp"&&best.size>TARGET_BYTES){
   for(const quality of [0.74,0.66]){
    const next=await encode(canvas,"image/webp",quality);
    if(next.size<best.size)best=next;
    if(best.size<=TARGET_BYTES)break;
   }
  }
  // At most one additional resize; never enlarge small images or crop their edges.
  if(best.size>TARGET_BYTES&&Math.max(width,height)>1280){
   const ratio=1280/Math.max(width,height);
   const previous={width,height,blob:best};
   width=Math.max(1,Math.round(width*ratio));height=Math.max(1,Math.round(height*ratio));draw();
   const next=await encode(canvas,best.type,0.74);
   if(next.size<best.size)best=next;
   else {width=previous.width;height=previous.height;best=previous.blob}
  }
  // A file already smaller than its re-encoded version needs no recompression.
  if(scale===1&&width===image.width&&height===image.height&&file.size<=best.size)return {file,originalBytes:file.size,width,height};
  if(best.size>MAX_BYTES)throw new Error("No se pudo reducir la imagen a menos de 5 MB. Exportala con menor resolución.");
  const ext=best.type==="image/webp"?"webp":best.type==="image/jpeg"?"jpg":"png";
  const name=(file.name.replace(/\.[^.]+$/,"")||"fotografia")+"."+ext;
  return {file:new File([best],name,{type:best.type,lastModified:Date.now()}),originalBytes:file.size,width,height};
 }finally{image.release();canvas.width=0;canvas.height=0}
}
export function imageOptimizationSummary(image:OptimizedImage):string{
 const kb=(bytes:number)=>Math.max(1,Math.round(bytes/1024));
 const saved=Math.max(0,Math.round((1-image.file.size/image.originalBytes)*100));
 return `Imagen preparada: ${image.width} × ${image.height} px · ${kb(image.file.size)} KB${saved>0?` (antes ${kb(image.originalBytes)} KB; ${saved}% menos)`:""}.`;
}
