import {getDatabase} from '@netlify/database';
export function databaseOptions(env:Record<string,string|undefined>){
 if(env.PHARMATAP_DATABASE_PROVIDER!=='neon')return undefined;
 if(env.CONTEXT&&env.CONTEXT!=='production')throw new Error('The production database is unavailable in this deploy context.');
 const connectionString=env.NETLIFY_DATABASE_URL||env.DATABASE_URL;
 if(!connectionString)throw new Error('The Neon database connection has not been configured.');
 const url=new URL(connectionString);
 if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname.endsWith('.neon.tech')||!['require','verify-full'].includes(url.searchParams.get('sslmode')||''))throw new Error('Configure a Neon Postgres connection with required TLS.');
 return {connectionString};
}
export function workspaceDatabase(){return getDatabase(databaseOptions(process.env));}
