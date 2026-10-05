import {checklistList,checklistCreate} from './_shared/checklists';
import {sopList,sopCreate,sopPdf} from './_shared/sops';
import type { Config } from '@netlify/functions';
import {randomBytes} from 'node:crypto';
import {manageList,addSite,addUser} from './_shared/manage';
import { admin,getUser } from '@netlify/identity';
import {workspaceDatabase} from './_shared/database';
import {initialiseApprovedAdministrator} from './_shared/installation';
import { Fault,session,list,createReport,updateAction,history,exportPharmacy,reportPhoto } from './_shared/service';
import {guard} from './_shared/http';
export {guard} from './_shared/http';
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export default async (req:Request) => {
 let client;
 try {
  guard(req);const user=await getUser();if(!user)throw new Fault(401,'Sign in to continue.');
  const actor={id:user.id,viewRole:req.headers.get('x-pharmatap-role')||undefined};client=await workspaceDatabase().pool.connect();
  await client.query(req.method==='GET' ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN');
  await client.query("SET LOCAL statement_timeout='10s'");
  const url=new URL(req.url),path=url.pathname.slice('/api/workspace'.length);
  if(process.env.PHARMATAP_DATABASE_PROVIDER==='neon'){
   const ready=await client.query("SELECT 1 FROM database_transfer WHERE key='netlify-to-neon'");
   if(!ready.rows.length)throw new Fault(503,'The database migration has not been verified.');
  }
  if(req.method!=='GET'){
   const control=await client.query('SELECT writes_paused FROM database_control WHERE id=true FOR SHARE');
   if(control.rows[0]?.writes_paused)throw new Fault(503,'Database maintenance is in progress. Please try again shortly.');
  }
  let result;
  if(req.method==='GET'&&path==='/session')result=await session(client,actor);
  else if(req.method==='POST'&&path==='/initialise')result=await initialiseApprovedAdministrator(client,actor);
  else if(req.method==='GET'&&path==='/manage')result=await manageList(client,actor,url.searchParams.get('organisationId')||'');
  else if(req.method==='POST'&&['/manage/sites','/manage/users'].includes(path)){
   const raw=await req.text();if(raw.length>20000)throw new Fault(413,'Request is too large.');
   let body;try{body=JSON.parse(raw);}catch{throw new Fault(400,'Invalid JSON.');}
   result=path.endsWith('/sites')?await addSite(client,actor,body):await addUser(client,actor,body,async(email,name)=>{
    for(let page=1;page<=100;page++){const users=await admin.listUsers({page,perPage:100});const existing=users.find(u=>u.email?.toLowerCase()===email);if(existing)return existing.id;if(users.length<100)return (await admin.createUser({email,password:randomBytes(48).toString('base64url'),data:{user_metadata:{full_name:name}}})).id;}
    throw new Fault(503,'User lookup could not be completed.');
   });
  }
  else if(req.method==='GET'&&path==='/checklists')result=await checklistList(client,actor,url.searchParams.get('pharmacyId')||'');
  else if(req.method==='POST'&&path==='/checklists'){
   const raw=await req.text();if(raw.length>200000)throw new Fault(413,'Checklist is too large.');
   let body;try{body=JSON.parse(raw);}catch{throw new Fault(400,'Invalid JSON.');}
   result=await checklistCreate(client,actor,body,req.headers.get('idempotency-key')||'');
  }
  else if(req.method==='GET'&&path==='/reports')result=await list(client,actor,url.searchParams.get('pharmacyId')||'');
  else if(req.method==='GET'&&path==='/export')result=await exportPharmacy(client,actor,url.searchParams.get('pharmacyId')||'');
  else if(req.method==='GET'&&/^\/reports\/[^/]+\/history$/.test(path))result=await history(client,actor,path.split('/')[2]);
  else if(req.method==='GET'&&/^\/reports\/[^/]+\/photo$/.test(path)){
   const photo=await reportPhoto(client,actor,path.split('/')[2]);await client.query('COMMIT');
   return new Response(new Uint8Array(photo.data),{headers:{'Content-Type':photo.content_type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline; filename="maintenance-photo.jpg"'}});
  }
  else if(req.method==='GET'&&path==='/sops')result=await sopList(client,actor,url.searchParams.get('pharmacyId')||'');
  else if(req.method==='POST'&&path==='/sops'){
   const raw=await req.text();if(raw.length>2900000)throw new Fault(413,'SOP is too large.');
   let body;try{body=JSON.parse(raw);}catch{throw new Fault(400,'Invalid JSON.');}
   result=await sopCreate(client,actor,body);
  }
  else if(req.method==='GET'&&/^\/sops\/[^/]+\/pdf$/.test(path)){
   const pdf=await sopPdf(client,actor,path.split('/')[2]);await client.query('COMMIT');
   return new Response(new Uint8Array(pdf),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="supplier-sop.pdf"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  else if(req.method==='POST'&&path==='/reports'){
   const raw=await req.text();if(raw.length>1450000)throw new Fault(413,'Report is too large.');
   let body;try{body=JSON.parse(raw);}catch{throw new Fault(400,'Invalid JSON.');}
   result=await createReport(client,actor,body,req.headers.get('idempotency-key')||'');
  } else if(req.method==='PATCH'&&/^\/actions\/[^/]+$/.test(path)){
   const raw=await req.text();if(raw.length>12000)throw new Fault(413,'Review is too large.');
   let body;try{body=JSON.parse(raw);}catch{throw new Fault(400,'Invalid JSON.');}
   result=await updateAction(client,actor,path.split('/')[2],body);
  } else throw new Fault(404,'Endpoint not found.');
  await client.query('COMMIT');return json(result);
 }catch(error){
  if(client)await client.query('ROLLBACK').catch(()=>{});
  if(error instanceof Fault)return json({error:error.message},error.status);
  // Do not log record content, identity tokens or database credentials.
  console.error('PharmaTap workspace request failed');return json({error:'The request could not be completed. Please try again.'},503);
 }finally{client?.release();}
};
export const config:Config={path:'/api/workspace/*'};
