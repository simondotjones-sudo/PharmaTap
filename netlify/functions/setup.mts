import type {Config} from '@netlify/functions';
import {getDatabase} from '@netlify/database';
import {Fault} from './_shared/service';
import {checkSetupKey,initialiseOrganisations} from './_shared/installation';
import {guard} from './_shared/http';
declare const Netlify:{env:{get:(key:string)=>string|undefined}};
export default async(req:Request)=>{
 let client;
 try{
  if(req.method!=='POST')throw new Fault(405,'Method not allowed.');
  guard(req);checkSetupKey(req.headers.get('x-pharmatap-setup-key'),Netlify.env.get('PHARMATAP_SETUP_KEY'));
  const userId=Netlify.env.get('PHARMATAP_INITIAL_ADMIN_ID');if(!userId)throw new Fault(404,'Setup is disabled.');
  client=await getDatabase().pool.connect();await client.query('BEGIN');
  await client.query("SET LOCAL statement_timeout='15s'");
  const result=await initialiseOrganisations(client,userId);await client.query('COMMIT');
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(e){if(client)await client.query('ROLLBACK').catch(()=>{});return Response.json({error:e instanceof Fault?e.message:'Setup could not be completed.'},{status:e instanceof Fault?e.status:503,headers:{'Cache-Control':'no-store'}});}
 finally{client?.release();}
};
export const config:Config={path:'/api/setup'};
