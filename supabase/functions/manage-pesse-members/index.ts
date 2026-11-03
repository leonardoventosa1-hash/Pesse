// Pesse editorial member management. Deploy only after review and Auth redirect validation.
// Service role is available ONLY inside the Supabase Edge runtime. Never expose it to clients.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const headers = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Content-Type":"application/json"};
const json=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers});
type MemberRole="admin"|"redactor";
type RequestBody={action?:string;email?:string;role?:string;userId?:string};
const isRole=(value:unknown):value is MemberRole=>value==="admin"||value==="redactor";
const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
Deno.serve(async(request:Request)=>{
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(!["GET","POST"].includes(request.method))return json(405,{error:"Método no permitido"});
 try{
  const token=request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token)return json(401,{error:"Iniciá sesión"});
  const url=Deno.env.get("SUPABASE_URL")??"";
  const publicKey=Deno.env.get("SUPABASE_ANON_KEY")??"";
  const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
  if(!url||!publicKey||!secret)return json(503,{error:"La administración de integrantes no está configurada"});
  const auth=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:userError}=await auth.auth.getUser(token);
  if(userError||!user)return json(401,{error:"Sesión vencida o inválida"});
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:editor,error:roleError}=await admin.from("editor_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(roleError)return json(503,{error:"No se pudo verificar el rol administrativo"});
  if(editor?.role!=="admin")return json(403,{error:"Solo los administradores pueden gestionar integrantes"});
  if(request.method==="GET"){
   const {data:roles,error:rolesError}=await admin.from("editor_roles").select("user_id,role");
   if(rolesError)return json(503,{error:"No se pudieron consultar los roles"});
   const {data:usersData,error:usersError}=await admin.auth.admin.listUsers({page:1,perPage:100});
   if(usersError)return json(503,{error:"No se pudieron consultar los usuarios"});
   const roleMap=new Map((roles??[]).map(r=>[r.user_id,r.role]));
   const users=(usersData.users??[]).filter(u=>roleMap.has(u.id)).map(u=>({
    id:u.id,email:u.email??"",role:roleMap.get(u.id),invitedAt:u.invited_at??null,
    confirmedAt:u.email_confirmed_at??null,lastSignInAt:u.last_sign_in_at??null,
    disabled:!!(u.banned_until&&new Date(u.banned_until).getTime()>Date.now())
   }));
   return json(200,{users,truncated:(usersData.users?.length??0)>=100});
  }
  let input:RequestBody;
  try{input=await request.json()}catch{return json(400,{error:"Solicitud inválida"})}
  if(input.action==="invite"){
   const email=(input.email??"").trim().toLowerCase();
   if(!validEmail(email)||!isRole(input.role))return json(400,{error:"Ingresá un correo válido y un rol"});
   const redirectTo=Deno.env.get("PESSE_INVITE_REDIRECT_URL")??"https://pesse-gilt.vercel.app/admin/activar";
   if(!redirectTo||!redirectTo.startsWith("https://"))return json(503,{error:"Falta configurar la dirección segura de activación"});
   const {data:invite,error:inviteError}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo});
   if(inviteError||!invite.user)return json(400,{error:inviteError?.message??"No se pudo crear la invitación"});
   const {error:assignError}=await admin.from("editor_roles").upsert({user_id:invite.user.id,role:input.role},{onConflict:"user_id"});
   if(assignError)return json(503,{error:"Se creó la invitación pero no se pudo asignar el rol. Revisá el usuario en Supabase antes de reenviar."});
   return json(200,{message:"Invitación enviada. El integrante deberá activar su cuenta."});
  }
  if(input.action==="change-role"){
   if(typeof input.userId!=="string"||!isRole(input.role))return json(400,{error:"Datos de rol inválidos"});
   if(input.userId===user.id&&input.role!=="admin")return json(400,{error:"No podés quitarte tu propio rol de administrador"});
   const {data:existing,error:existingError}=await admin.from("editor_roles").select("role").eq("user_id",input.userId).maybeSingle();
   if(existingError||!existing)return json(404,{error:"Integrante no encontrado"});
   const {error:updateError}=await admin.from("editor_roles").update({role:input.role}).eq("user_id",input.userId);
   if(updateError)return json(503,{error:"No se pudo actualizar el rol"});
   return json(200,{message:"Rol actualizado"});
  }
  if(input.action==="disable"||input.action==="enable"){
   if(typeof input.userId!=="string")return json(400,{error:"Integrante inválido"});
   if(input.userId===user.id)return json(400,{error:"No podés desactivar tu propia cuenta"});
   const {data:existing,error:existingError}=await admin.from("editor_roles").select("role").eq("user_id",input.userId).maybeSingle();
   if(existingError||!existing)return json(404,{error:"Integrante no encontrado"});
   const {error:updateError}=await admin.auth.admin.updateUserById(input.userId,{ban_duration:input.action==="disable"?"876000h":"none"});
   if(updateError)return json(503,{error:"No se pudo actualizar el acceso"});
   return json(200,{message:input.action==="disable"?"Acceso suspendido":"Acceso restablecido"});
  }
  return json(400,{error:"Operación desconocida"});
 }catch{return json(500,{error:"No pudimos procesar la solicitud"})}
});
