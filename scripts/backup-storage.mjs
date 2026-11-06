#!/usr/bin/env node
/**
 * Copia local de los objetos de Supabase Storage.
 * Esta utilidad NO borra ni modifica archivos del proyecto.
 * Se ejecuta desde PowerShell con variables de entorno configuradas.
 */
import {createClient} from "@supabase/supabase-js";
import {createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";

const [outputDir,manifestPath]=process.argv.slice(2);
const endpoint=process.env.PESSE_SUPABASE_URL;
const serviceKey=process.env.PESSE_SERVICE_ROLE_KEY;
if(!outputDir||!manifestPath||!endpoint||!serviceKey){
 console.error("Faltan rutas de destino o credenciales locales de respaldo.");
 process.exit(1);
}
const db=createClient(endpoint,serviceKey,{
 auth:{persistSession:false,autoRefreshToken:false},
 global:{headers:{"X-Client-Info":"pesse-backup-local"}}
});
const manifest={created_at:new Date().toISOString(),buckets:[],files:[]};
let objects=0;
let totalBytes=0;

function safeComponent(name){
 if(!name||name==="."||name===".."||name.includes("/")||name.includes("\\")||name.includes("\0"))throw Error("Ruta de Storage insegura");
 return name;
}
async function copyFolder(bucket,prefix=""){
 const seen=new Set();
 let offset=0;
 const limit=100;
 while(true){
  const {data,error}=await db.storage.from(bucket).list(prefix,{limit,offset,sortBy:{column:"name",order:"asc"}});
  if(error)throw Error("No se pudo enumerar Storage: "+error.message);
  const page=data??[];
  for(const item of page){
   const name=safeComponent(item.name);
   const key=prefix?prefix+"/"+name:name;
   if(seen.has(key))throw Error("Archivo duplicado en Storage");
   seen.add(key);
   // Carpetas virtuales tienen id=null, a diferencia de archivos.
   if(!item.id){
    await copyFolder(bucket,key);
    continue;
   }
   const {data:blob,error:downloadError}=await db.storage.from(bucket).download(key);
   if(downloadError||!blob)throw Error("No se pudo descargar un archivo: "+(downloadError?.message??"sin datos"));
   const contents=Buffer.from(await blob.arrayBuffer());
   const destination=path.join(outputDir,safeComponent(bucket),...key.split("/").map(safeComponent));
   await mkdir(path.dirname(destination),{recursive:true});
   await writeFile(destination,contents,{flag:"wx"});
   const digest=createHash("sha256").update(contents).digest("hex");
   manifest.files.push({bucket,path:key,bytes:contents.length,sha256:digest});
   objects++;
   totalBytes+=contents.length;
  }
  if(page.length<limit)break;
  offset+=page.length;
 }
}
const {data:buckets,error:bucketError}=await db.storage.listBuckets();
if(bucketError)throw Error("No se pudo enumerar los buckets: "+bucketError.message);
for(const bucket of buckets??[]){
 safeComponent(bucket.name);
 manifest.buckets.push({name:bucket.name,public:bucket.public});
 await copyFolder(bucket.name);
}
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+"\n",{flag:"wx"});
console.log("Storage respaldado: "+objects+" archivos, "+totalBytes+" bytes, "+manifest.buckets.length+" buckets.");
