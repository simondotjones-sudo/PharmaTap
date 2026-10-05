import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
import {initialiseOrganisations,initialiseApprovedAdministrator} from '../netlify/functions/_shared/installation';
import {session,list,Fault} from '../netlify/functions/_shared/service';
const denied=(status:number)=>(e:unknown)=>e instanceof Fault&&e.status===status;
test('two organisations, 16 verified Stacks branches and two demo branches; administrator assignment is transactional and repeat-safe',async()=>{
 const pg=new PGlite();try{
 for(const path of ['001_working-foundation','002_organisation-catalogue','003_initial-administrator'])await pg.exec(await readFile('netlify/database/migrations/'+path+'/migration.sql','utf8'));
 const db={query:async(sql:string,p:any[]=[])=>({rows:(await pg.query(sql,p)).rows as any[]})},id=randomUUID();
 const outsider=await initialiseApprovedAdministrator(db,{id:randomUUID()});assert.equal(outsider.initialised,false);assert.equal((await db.query('SELECT count(*)::int AS n FROM memberships')).rows[0].n,0);
 const {createHash}=await import('node:crypto');await db.query("UPDATE installation_authorisation SET identity_fingerprint=$1 WHERE key='initial-organisations'",[createHash('sha256').update(id).digest('hex')]);
 const run=async()=>{await db.query('BEGIN');try{const r=await initialiseApprovedAdministrator(db,{id});await db.query('COMMIT');return r;}catch(e){await db.query('ROLLBACK');throw e;}};
 const first=await run();assert.equal(first.verified,true);assert.equal(first.totalPharmacies,18);assert.deepEqual(first.organisations.map((o:any)=>[o.name,o.pharmacies]).sort(),[['Demo',2],['Stacks Pharmacies',16]]);
 assert.equal((await run()).alreadyConfigured,true);const access=await session(db,{id});assert.equal(access.organisations.length,2);assert.equal(access.pharmacies.length,18);assert.ok(access.pharmacies.every(p=>p.role==='superintendent'));
 assert.equal((await db.query('SELECT count(*)::int AS n FROM reports')).rows[0].n,0);assert.equal((await db.query('SELECT count(*)::int AS n FROM audit_events')).rows[0].n,2);
 const stacks=access.pharmacies.filter(p=>p.organisation_name==='Stacks Pharmacies');assert.equal(stacks.length,16);assert.ok(stacks.every(p=>!p.is_demo));
 await assert.rejects(list(db,{id:randomUUID()},stacks[0].id),denied(403));
 await assert.rejects(initialiseOrganisations(db,randomUUID()),denied(409));
 await db.query('UPDATE memberships SET active=false WHERE user_id=$1 AND pharmacy_id=$2',[id,stacks[0].id]);assert.equal((await run()).alreadyConfigured,true);assert.equal((await session(db,{id})).pharmacies.length,17);
 }finally{await pg.close();}
});
