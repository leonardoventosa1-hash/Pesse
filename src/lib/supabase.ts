import { createClient, type SupabaseClient } from "@supabase/supabase-js";
export function supabase(): SupabaseClient | null {
 const raw=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
 if(!raw||!key)return null;
 let url:string;
 try {
   const parsed=new URL(raw);
   if(parsed.protocol!=="https:" || !parsed.hostname.endsWith(".supabase.co"))return null;
   url=parsed.origin;
 } catch {return null;}
 return createClient(url,key);
}
export type Article={id:string;slug:string;title:string;excerpt:string;body:string;cover_url:string|null;category_id:string|null;status:"draft"|"published";published_at:string|null;created_at:string;is_featured?:boolean};
export type Category={id:string;slug:string;name:string};
