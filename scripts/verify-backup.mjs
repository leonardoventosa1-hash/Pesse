#!/usr/bin/env node
/**
 * Verifica sin red la integridad de los objetos extraídos de un respaldo.
 * Uso: node scripts/verify-backup.mjs <directorio-extraido>
 */
import {readFile,stat} from "node:fs/promises";
import {createHash} from "node:crypto";
import path from "node:path";

const root=process.argv[2];
if(!root)throw Error("Indicá el directorio del respaldo extraído.");
const manifest=JSON.parse(await readFile(path.join(root,"storage-manifest.json"),"utf8"));
if(!Array.isArray(manifest.files)||!Array.isArray(manifest.buckets))throw Error("Inventario inválido.");
const keys=new Set();
let total=0;
for(const item of manifest.files){
 if(typeof item.bucket!=="string"||typeof item.path!=="string"
   ||typeof item.sha256!=="string"||!Number.isSafeInteger(item.bytes)||item.bytes<0)
  throw Error("Entrada del inventario inválida.");
 const fragments=[item.bucket,...item.path.split("/")];
 if(fragments.some(v=>!v||v==="."||v===".."||v.includes("\\")||v.includes("\0")))
  throw Error("Ruta insegura dentro del respaldo.");
 const key=fragments.join("/");
 if(keys.has(key))throw Error("Objeto duplicado en inventario.");
 keys.add(key);
 const filename=path.resolve(root,"storage",...fragments);
 const info=await stat(filename);
 if(!info.isFile()||info.size!==item.bytes)throw Error("Tamaño incorrecto en "+key);
 const bytes=await readFile(filename);
 const digest=createHash("sha256").update(bytes).digest("hex");
 if(digest!==item.sha256)throw Error("Huella SHA-256 incorrecta en "+key);
 total+=item.bytes;
}
for(const name of ["roles.sql","schema.sql","data.sql"]){
 const file=await stat(path.join(root,name));
 if(!file.isFile())throw Error("Falta el archivo SQL: "+name);
}
console.log("Copia íntegra: "+keys.size+" archivos de Storage y "+total+" bytes comprobados. SQL presente.");
console.log("Integridad no equivale a una restauración exitosa. Probarla en un entorno aislado.");
