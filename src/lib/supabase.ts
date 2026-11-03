import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Reuse one Auth instance per browser tab so login, invitation callbacks and
// editorial pages observe the same session and Auth events.
let browserClient: SupabaseClient | null = null;

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

 // Server-side rendering must not share Auth state across requests.
 if(typeof window==="undefined")return createClient(url,key,{
   auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
 });
 if(!browserClient)browserClient=createClient(url,key);
 return browserClient;
}
export type Article={id:string;slug:string;title:string;excerpt:string;body:string;cover_url:string|null;category_id:string|null;status:"draft"|"published";published_at:string|null;created_at:string;is_featured?:boolean;deleted_at?:string|null};
export type Category={id:string;slug:string;name:string};
