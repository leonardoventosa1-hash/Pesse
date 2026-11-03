// Pesse editorial member management. Deploy only after review and Auth redirect validation.
// Service role is available ONLY inside the Supabase Edge runtime. Never expose it to clients.
import { createClient, type User } from "npm:@supabase/supabase-js@2.57.0";

const headers = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Content-Type":"application/json"};
const json=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers});
type MemberRole="admin"|"redactor";
type RequestBody={action?:string;email?:string;role?:string;userId?:string};
const isRole=(value:unknown):value is MemberRole=>value==="admin"||value==="redactor";
const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const inviteRedirect=()=>Deno.env.get("PESSE_INVITE_REDIRECT_URL")??"";
const validInviteRedirect=()=>{
 try{
  const parsed=new URL(inviteRedirect());
  return parsed.origin==="https://pesse-gilt.vercel.app"&&
   parsed.pathname==="/admin/activar"&&!parsed.search&&!parsed.hash;
 }catch{return false}
};
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
   // Auth paginates users independently of editor_roles. Retrieve several pages
   // to avoid silently omitting editorial members after the first 100 accounts.
   // Stop at 1,000 and report a visible warning if there may be more.
   const pageSize=100;
   const maxPages=10;
   const allUsers: User[]=[];
   let truncated=false;
   for(let page=1;page<=maxPages;page++){
    const {data:usersData,error:usersError}=await admin.auth.admin.listUsers({page,perPage:pageSize});
    if(usersError)return json(503,{error:"No se pudieron consultar todos los usuarios"});
    allUsers.push(...(usersData.users??[]));
    if((usersData.users??[]).length<pageSize)break;
    if(page===maxPages)truncated=true;
   }
   const roleMap=new Map((roles??[]).map(r=>[r.user_id,r.role]));
   const users=allUsers.filter(u=>roleMap.has(u.id)||isRole(u.app_metadata?.pesse_suspended_role)).map(u=>{
    const activeRole=roleMap.get(u.id);
    const suspendedRole=u.app_metadata?.pesse_suspended_role;
    const disabled=!activeRole&&isRole(suspendedRole);
    return {id:u.id,email:u.email??"",role:activeRole??suspendedRole,
     invitedAt:u.invited_at??null,confirmedAt:u.email_confirmed_at??null,
     lastSignInAt:u.last_sign_in_at??null,disabled};
   });
   return json(200,{users,truncated,invitationsConfigured:validInviteRedirect()});
  }
  let input:RequestBody;
  try{input=await request.json()}catch{return json(400,{error:"Solicitud inválida"})}
  if(input.action==="invite"){
   const email=(input.email??"").trim().toLowerCase();
   if(!validEmail(email)||!isRole(input.role))return json(400,{error:"Ingresá un correo válido y un rol"});
   const redirectTo=inviteRedirect();
   if(!validInviteRedirect())return json(503,{error:"La URL de activación debe coincidir con la ruta segura publicada de Pesse"});
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
   if(input.userId===user.id)return json(400,{error:"No podés suspender tu propia cuenta"});
   const {data:person,error:personError}=await admin.auth.admin.getUserById(input.userId);
   if(personError||!person.user)return json(404,{error:"Cuenta no encontrada"});
   const {data:existing,error:existingError}=await admin.from("editor_roles").select("role").eq("user_id",input.userId).maybeSingle();
   if(existingError)return json(503,{error:"No se pudo consultar el rol"});
   if(input.action==="disable"){
    if(!existing||!isRole(existing.role))return json(400,{error:"El acceso editorial ya está suspendido"});
    // Persist role server-side for restoration, then revoke database role immediately.
    const meta={...person.user.app_metadata,pesse_suspended_role:existing.role};
    const {error:metaError}=await admin.auth.admin.updateUserById(input.userId,{app_metadata:meta});
    if(metaError)return json(503,{error:"No se pudo guardar el rol para una futura reactivación"});
    const {error:removeError}=await admin.from("editor_roles").delete().eq("user_id",input.userId);
    if(removeError)return json(503,{error:"No se pudo revocar el acceso editorial. Revisá la cuenta antes de reintentar"});
    // Revoking editor_roles immediately invalidates RLS authorization, even with an old JWT.
    return json(200,{message:"Acceso editorial suspendido"});
   }
   const suspendedRole=person.user.app_metadata?.pesse_suspended_role;
   if(!isRole(suspendedRole))return json(400,{error:"La cuenta no tiene un rol suspendido para recuperar"});
   if(existing)return json(409,{error:"La cuenta ya tiene un rol activo. Revisá el estado antes de continuar"});
   const {error:restoreError}=await admin.from("editor_roles").upsert({user_id:input.userId,role:suspendedRole},{onConflict:"user_id"});
   if(restoreError)return json(503,{error:"No se pudo restaurar el rol"});
   const meta={...person.user.app_metadata};
   delete meta.pesse_suspended_role;
   const {error:metadataError}=await admin.auth.admin.updateUserById(input.userId,{app_metadata:meta,ban_duration:"none"});
   if(metadataError)return json(503,{error:"Se restauró el rol, pero hay que revisar el estado de autenticación"});
   return json(200,{message:"Acceso editorial restablecido"});
  }
  return json(400,{error:"Operación desconocida"});
 }catch{return json(500,{error:"No pudimos procesar la solicitud"})}
});
