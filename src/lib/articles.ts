import {supabase, type Article} from "./supabase";
export async function publicArticles(limit=24):Promise<Article[]>{
 const db=supabase();if(!db)return [];
 const {data,error}=await db.from("articles").select("id,slug,title,excerpt,body,cover_url,category_id,status,published_at,created_at").eq("status","published").is("deleted_at",null).lte("published_at",new Date().toISOString()).order("published_at",{ascending:false}).limit(limit);
 if(error){console.error("Could not load articles:",error.message);return []}
 return (data??[]) as Article[];
}
export async function articleBySlug(slug:string):Promise<Article|null>{
 const db=supabase();if(!db)return null;
 const {data}=await db.from("articles").select("id,slug,title,excerpt,body,cover_url,category_id,status,published_at,created_at").eq("slug",slug).eq("status","published").is("deleted_at",null).lte("published_at",new Date().toISOString()).maybeSingle();
 return data as Article|null;
}

/** Optional featured selection: if migration has not run, keep normal ordering. */
export async function homepageArticles(limit=6):Promise<Article[]>{
 const latest=await publicArticles(limit);
 const db=supabase();if(!db)return latest;
 const {data,error}=await db.from("articles")
  .select("id,slug,title,excerpt,body,cover_url,category_id,status,published_at,created_at,is_featured")
  .eq("status","published").is("deleted_at",null).eq("is_featured",true)
  .lte("published_at",new Date().toISOString())
  .order("published_at",{ascending:false}).limit(1);
 if(error||!data?.length)return latest;
 const selected=data[0] as Article;
 return [selected,...latest.filter(item=>item.id!==selected.id)].slice(0,limit);
}
