import { createClient, type SupabaseClient } from "@supabase/supabase-js";
export function supabase(): SupabaseClient | null {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key) return null;
 return createClient(url,key);
}
export type Article={id:string;slug:string;title:string;excerpt:string;body:string;cover_url:string|null;category_id:string|null;status:"draft"|"published";published_at:string|null;created_at:string};
export type Category={id:string;slug:string;name:string};
