import {supabase} from "@/lib/supabase";
export const mediaBucket="pesse-media";
export const validMediaPath=(path:string,prefix:"brand"|"sponsors")=>new RegExp("^"+prefix+"/[0-9a-f-]{36}\\.(png|jpg|jpeg|webp)$").test(path);
export function mediaUrl(path:string,prefix:"brand"|"sponsors"):string|null{
 if(!validMediaPath(path,prefix))return null;
 const db=supabase();if(!db)return null;
 return db.storage.from(mediaBucket).getPublicUrl(path).data.publicUrl;
}
export type Banner={
 id:string;advertiser_name:string;alt_text:string;image_path:string;target_url:string;
 placement:"home_mid"|"home_bottom";status:"draft"|"scheduled"|"paused"|"archived";
 starts_at:string|null;ends_at:string|null;created_at:string;
};
export async function activeBanners(placement:Banner["placement"]):Promise<Banner[]>{
 const db=supabase();if(!db)return [];
 const now=new Date().toISOString();
 try{const {data,error}=await db.from("sponsor_banners").select("id,advertiser_name,alt_text,image_path,target_url,placement,status,starts_at,ends_at,created_at")
 .eq("placement",placement).eq("status","scheduled").lte("starts_at",now).or("ends_at.is.null,ends_at.gt."+now).order("starts_at",{ascending:false}).limit(4);
 return error?[]:(data??[]) as Banner[];}catch{return []}
}
