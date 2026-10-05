import {createHash} from 'node:crypto';
export const tables=['organisations','pharmacies','memberships','organisation_memberships','installation_authorisation','installation_setup','reports','report_photos','actions','sop_drafts','audit_events'];
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const digest=rows=>createHash('sha256').update(JSON.stringify(rows.map(canonical).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))).digest('hex');
export async function applyMigrations(db,migrations){
 await db.query('CREATE TABLE IF NOT EXISTS database_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
 for(const m of migrations){const checksum=createHash('sha256').update(m.sql).digest('hex'),existing=await db.query('SELECT checksum FROM database_migrations WHERE name=$1',[m.name]);if(existing.rows.length){if(existing.rows[0].checksum!==checksum)throw new Error('An applied migration was changed: '+m.name);continue;}await db.query(m.sql);await db.query('INSERT INTO database_migrations(name,checksum) VALUES($1,$2)',[m.name,checksum]);}
}
export async function transferDatabase(source,target,migrations){
 let frozen=false,targetStarted=false,sourceStarted=false,commitAttempted=false;
 try{
  await target.query('BEGIN');targetStarted=true;
  await target.query("SELECT pg_advisory_xact_lock(hashtextextended('pharmatap-neon-transfer',0))");
  await target.query('CREATE TABLE IF NOT EXISTS database_transfer(key text PRIMARY KEY, manifest jsonb NOT NULL, completed_at timestamptz NOT NULL DEFAULT now())');
  const prior=await target.query("SELECT manifest FROM database_transfer WHERE key='netlify-to-neon'");
  if(prior.rows.length){await applyMigrations(target,migrations);await target.query('COMMIT');targetStarted=false;return {alreadyTransferred:true,manifest:prior.rows[0].manifest};}
  if(!source)throw new Error('The current database connection is required for the first migration.');
  const existing=await target.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=ANY($1::text[])",[tables]);
  if(existing.rows.length)throw new Error('Migration requires a new empty Neon database. Existing application tables will not be overwritten.');
  // Existing requests hold a share lock on this row until their mutation commits.
  // This UPDATE waits for them, then makes subsequent writes fail closed.
  const control=await source.query('UPDATE database_control SET writes_paused=true WHERE id=true AND writes_paused=false RETURNING id');
  if(!control.rows.length)throw new Error('The source database is already paused or migration preparation is missing.');
  frozen=true;
  await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');sourceStarted=true;
  await applyMigrations(target,migrations);
  // Remove only the freshly seeded catalogue before restoring the source exactly.
  await target.query('DELETE FROM pharmacies');await target.query('DELETE FROM organisations');await target.query('DELETE FROM installation_authorisation');
  const manifest={};
  for(const table of tables){
   const exists=table==='sop_drafts'?(await source.query("SELECT to_regclass('public.sop_drafts') AS name")).rows[0].name:true;
   const rows=exists?(await source.query(`SELECT to_jsonb(t) AS value FROM ${table} t`)).rows.map(r=>r.value):[];
   for(const row of rows){const columns=Object.keys(row);const values=columns.map(c=>((table==='report_photos'&&c==='data')||(table==='sop_drafts'&&c==='pdf'))&&typeof row[c]==='string'&&row[c].startsWith('\\x')?Buffer.from(row[c].slice(2),'hex'):row[c]);await target.query(`INSERT INTO ${table} (${columns.map(c=>'"'+c+'"').join(',')}) ${table==='audit_events'?'OVERRIDING SYSTEM VALUE':''} VALUES (${values.map((_,i)=>'$'+(i+1)).join(',')})`,values);}
   const restored=(await target.query(`SELECT to_jsonb(t) AS value FROM ${table} t`)).rows.map(r=>r.value);
   if(rows.length!==restored.length||digest(rows)!==digest(restored))throw new Error('Transferred data verification failed: '+table);
   manifest[table]={count:rows.length,checksum:digest(rows)};
  }
  await target.query("SELECT setval(pg_get_serial_sequence('audit_events','id'),COALESCE((SELECT max(id) FROM audit_events),1),(SELECT count(*)>0 FROM audit_events))");
  await target.query("INSERT INTO database_transfer(key,manifest) VALUES('netlify-to-neon',$1)",[JSON.stringify(manifest)]);
  await source.query('COMMIT');sourceStarted=false;
  commitAttempted=true;await target.query('COMMIT');targetStarted=false;
  // Keep the old database paused so an older deploy cannot write stale records.
  return {alreadyTransferred:false,manifest};
 }catch(error){
  if(sourceStarted)await source.query('ROLLBACK').catch(()=>{});
  if(targetStarted)await target.query('ROLLBACK').catch(()=>{});
  if(frozen&&!commitAttempted)await source.query('UPDATE database_control SET writes_paused=false WHERE id=true').catch(()=>{});
  throw error;
 }
}
