import {supabase, type Article} from "./supabase";
export async function publicArticles(limit=24):Promise<Article[]>{
 const db=supabase();if(!db)return [];
 const {data,error}=await db.from("articles").select("id,slug,title,excerpt,body,cover_url,category_id,status,published_at,created_at").eq("status","published").lte("published_at",new Date().toISOString()).order("published_at",{ascending:false}).limit(limit);
 if(error){console.error("Could not load articles:",error.message);return []}
 return (data??[]) as Article[];
}
export async function articleBySlug(slug:string):Promise<Article|null>{
 const db=supabase();if(!db)return null;
 const {data}=await db.from("articles").select("id,slug,title,excerpt,body,cover_url,category_id,status,published_at,created_at").eq("slug",slug).eq("status","published").lte("published_at",new Date().toISOString()).maybeSingle();
 return data as Article|null;
}
