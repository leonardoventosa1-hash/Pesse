import {supabase} from "@/lib/supabase";

export type HomepageSectionKey="news_by_category"|"category_directory"|"video_promo";
export type HomepageSection={section_key:HomepageSectionKey;display_order:number;is_visible:boolean};
export const homepageSectionLabels:Record<HomepageSectionKey,string>={
 news_by_category:"Noticias por sección",
 category_directory:"Explorar secciones",
 video_promo:"Conocé nuestros videos"
};
export const defaultHomepageSections:HomepageSection[]=[
 {section_key:"news_by_category",display_order:10,is_visible:true},
 {section_key:"category_directory",display_order:20,is_visible:true},
 {section_key:"video_promo",display_order:30,is_visible:true}
];
export async function getHomepageSections():Promise<HomepageSection[]>{
 const db=supabase();
 if(!db)return defaultHomepageSections;
 try{
  const {data,error}=await db.from("homepage_sections").select("section_key,display_order,is_visible").order("display_order",{ascending:true});
  if(error||!data||data.length!==defaultHomepageSections.length)return defaultHomepageSections;
  const keys=new Set(defaultHomepageSections.map(s=>s.section_key));
  if(data.some(s=>!keys.has(s.section_key as HomepageSectionKey)))return defaultHomepageSections;
  return (data as HomepageSection[]).sort((a,b)=>a.display_order-b.display_order||a.section_key.localeCompare(b.section_key));
 }catch{return defaultHomepageSections}
}
