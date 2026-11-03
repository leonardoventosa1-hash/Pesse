import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabase";

export const dynamic="force-dynamic";
export const runtime="nodejs";

// Public readiness probe: only aggregate booleans, never keys, user data, or DB errors.
// A page can render cached/default content while Supabase is down; this endpoint must not.
export async function GET(){
 const headers={"Cache-Control":"no-store, max-age=0","X-Robots-Tag":"noindex, nofollow"};
 const db=supabase();
 if(!db)return NextResponse.json({status:"degraded",checks:{database:false,settings:false,categories:false,homepage:false}},
  {status:503,headers});
 try{
  const [settings,categories,homepage,articles]=await Promise.all([
   db.from("site_settings").select("id,brand_variant").eq("id",1).maybeSingle(),
   db.from("categories").select("id").limit(1),
   db.from("homepage_sections").select("section_key").limit(3),
   db.from("articles").select("id").eq("status","published").limit(1)
  ]);
  const checks={
   database:!articles.error,
   settings:!settings.error&&settings.data?.id===1,
   categories:!categories.error,
   homepage:!homepage.error&&homepage.data?.length===3
  };
  const ok=Object.values(checks).every(Boolean);
  return NextResponse.json({status:ok?"ok":"degraded",checks},{status:ok?200:503,headers});
 }catch{
  return NextResponse.json({status:"degraded",checks:{database:false,settings:false,categories:false,homepage:false}},
   {status:503,headers});
 }
}
