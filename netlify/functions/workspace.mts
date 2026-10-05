import type { Config } from '@netlify/functions';
import { getUser } from '@netlify/identity';
import { getDatabase } from '@netlify/database';
import { Fault,session,list,createReport,updateAction,history,exportPharmacy } from './_shared/service';
import {guard} from './_shared/http';
export {guard} from './_shared/http';
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export default async (req:Request) => {
 let client;
 try {
  guard(req);const user=await getUser();if(!user)throw new Fault(401,'Sign in to continue.');
  const actor={id:user.id};client=await getDatabase().pool.connect();
  await client.query(req.method==='GET' ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN');
  await client.query("SET LOCAL statement_timeout='10s'");
  const url=new URL(req.url),path=url.pathname.slice('/api/workspace'.length);
  let result;
  if(req.method==='GET'&&path==='/session')result=await session(client,actor);
  else if(req.method==='GET'&&path==='/reports')result=await list(client,actor,url.searchParams.get('pharmacyId')||'');
  else if(req.method==='GET'&&path==='/export')result=await exportPharmacy(client,actor,url.searchParams.get('pharmacyId')||'');
  else if(req.method==='GET'&&/^\/reports\/[^/]+\/history$/.test(path))result=await history(client,actor,path.split('/')[2]);
  else if(req.method==='POST'&&path==='/reports'){
   const raw=await req.text();if(raw.length>12000)throw new Fault(413,'Report is too large.');
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
