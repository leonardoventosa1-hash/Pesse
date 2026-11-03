import {supabase} from "@/lib/supabase";
export type NavigationCategory={id:string;slug:string;name:string;description:string;display_order:number;is_visible:boolean};
const defaults:NavigationCategory[]=[
 ["politica","Política",10],["sociedad","Sociedad",20],["deportes","Deportes",30],["cultura","Cultura",40],
 ["musica","Música",50],["turismo","Turismo",60],["entretenimiento","Entretenimiento",70]
].map(([slug,name,order])=>({id:String(slug),slug:String(slug),name:String(name),description:"",is_visible:true,display_order:Number(order)}));
export async function getNavigationCategories():Promise<NavigationCategory[]>{
 const db=supabase();if(!db)return defaults;
 try{
  const {data,error}=await db.from("categories").select("id,slug,name,description,is_visible,display_order").eq("is_visible",true).order("display_order",{ascending:true}).order("name");
  if(error)return defaults;
  return (data??[]) as NavigationCategory[];
 }catch{return defaults}
}
