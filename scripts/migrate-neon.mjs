import {getDatabase,getConnectionString} from '@netlify/database';
import {readdir,readFile} from 'node:fs/promises';
import {transferDatabase} from './neon-transfer.mjs';
export async function prepareNeon(){
 if(process.env.PHARMATAP_DATABASE_PROVIDER!=='neon')return;
 if(process.env.CONTEXT&&process.env.CONTEXT!=='production')throw new Error('Neon production migrations are disabled outside production.');
 const targetUrl=process.env.NETLIFY_DATABASE_URL||process.env.DATABASE_URL;
 if(!targetUrl)throw new Error('Add the Neon connection as a secret DATABASE_URL for production builds and functions.');
 const targetAddress=new URL(targetUrl);
 if(!['postgres:','postgresql:'].includes(targetAddress.protocol)||!targetAddress.hostname.endsWith('.neon.tech')||!['require','verify-full'].includes(targetAddress.searchParams.get('sslmode')||''))throw new Error('Use a Neon connection with required TLS.');
 const targetPool=getDatabase({connectionString:targetUrl}).pool;
 let sourcePool,target,source;
 try{
  target=await targetPool.connect();
  const marker=await target.query("SELECT to_regclass('public.database_transfer') AS table_name");
  const complete=marker.rows[0]?.table_name?(await target.query("SELECT 1 FROM database_transfer WHERE key='netlify-to-neon'")).rows.length:false;
  if(!complete){
   let sourceUrl=process.env.PHARMATAP_SOURCE_DATABASE_URL;
   if(!sourceUrl){try{sourceUrl=getConnectionString();}catch{throw new Error('The source connection is unavailable in this build. Set PHARMATAP_SOURCE_DATABASE_URL as a production build secret.');}}
   const sourceAddress=new URL(sourceUrl);
   if(sourceAddress.hostname.replace('-pooler','')===targetAddress.hostname.replace('-pooler','')&&sourceAddress.pathname===targetAddress.pathname)throw new Error('Source and destination must be different databases.');
   sourcePool=getDatabase({connectionString:sourceUrl}).pool;source=await sourcePool.connect();
  }
  const folder='netlify/database/migrations',names=(await readdir(folder)).sort();
  const migrations=await Promise.all(names.map(async name=>({name,sql:await readFile(`${folder}/${name}/migration.sql`,'utf8')})));
  const result=await transferDatabase(source,target,migrations);
  console.log(result.alreadyTransferred?'Neon database verified; migrations current.':'Neon migration verified. Original database retained with writes paused.');
  console.log('Verified row counts:',JSON.stringify(Object.fromEntries(Object.entries(result.manifest).map(([table,value])=>[table,value.count]))));
 }catch{throw new Error('Neon migration did not complete. Production deployment is blocked. Check the connection settings and database preparation; credentials and record content are omitted from logs.');}
 finally{source?.release();target?.release();await sourcePool?.end();await targetPool.end();}
}
