import {supabase} from "@/lib/supabase";

export type SiteSettings = {
 site_name:string; tagline:string; description:string;
 hero_title:string; hero_emphasis:string; hero_description:string;
 instagram_url:string; facebook_url:string; youtube_url:string; tiktok_url:string;
 logo_path:string;
};
export const defaultSiteSettings:SiteSettings={
 site_name:"Pesse",
 tagline:"Información con otra mirada.",
 description:"Noticias, entrevistas y actualidad en Pesse",
 hero_title:"Las noticias,",
 hero_emphasis:"con otra mirada.",
 hero_description:"Lo que pasa, las historias detrás de los hechos y las voces que importan. Informate con Pesse.",
 instagram_url:"https://www.instagram.com/pesse.info/",
 facebook_url:"https://www.facebook.com/share/1Bu3f2ArLs/",
 youtube_url:"https://www.youtube.com/@pesseinfo",
 tiktok_url:"https://www.tiktok.com/@pesse.info",
 logo_path:""
};
export const siteSettingsFields=Object.keys(defaultSiteSettings) as (keyof SiteSettings)[];
export const socialHosts:{field:keyof SiteSettings;label:string;host:string}[]=[
 {field:"instagram_url",label:"Instagram",host:"instagram.com"},
 {field:"facebook_url",label:"Facebook",host:"facebook.com"},
 {field:"youtube_url",label:"YouTube",host:"youtube.com"},
 {field:"tiktok_url",label:"TikTok",host:"tiktok.com"}
];
export function validSocialUrl(value:string,host:string):boolean{
 try{const u=new URL(value);return u.protocol==="https:"&&(u.hostname.toLowerCase()===host||u.hostname.toLowerCase()==="www."+host)&&u.pathname.length>1}
 catch{return false}
}
export function socialLinks(settings:SiteSettings){
 return socialHosts.flatMap(({field,label,host})=>{
  const value=settings[field];return validSocialUrl(value,host)?[{label,url:value}]:[];
 });
}
export async function getSiteSettings():Promise<SiteSettings>{
 const db=supabase();
 if(!db)return defaultSiteSettings;
 try{
  const {data,error}=await db.from("site_settings").select(siteSettingsFields.join(",")).eq("id",1).maybeSingle();
  if(error||!data)return defaultSiteSettings;
  const values=data as unknown as Partial<SiteSettings>;
  const merged={...defaultSiteSettings};
  for(const field of siteSettingsFields){
   const value=values[field];if(typeof value==="string")merged[field]=value;
  }
  return merged;
 }catch{return defaultSiteSettings}
}
