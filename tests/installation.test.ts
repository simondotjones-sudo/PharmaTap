import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
import {initialiseOrganisations,checkSetupKey} from '../netlify/functions/_shared/installation';
import {session,list,Fault} from '../netlify/functions/_shared/service';
const denied=(status:number)=>(e:unknown)=>e instanceof Fault&&e.status===status;
test('setup key rejects missing/wrong credentials and is disabled without operator configuration',()=>{
 assert.throws(()=>checkSetupKey('wrong','x'.repeat(64)),denied(403));assert.throws(()=>checkSetupKey(null,'x'.repeat(64)),denied(403));assert.throws(()=>checkSetupKey('x'.repeat(64),undefined),denied(404));assert.doesNotThrow(()=>checkSetupKey('x'.repeat(64),'x'.repeat(64)));
});
test('two organisations, 16 verified Stacks branches and two demo branches; administrator assignment is transactional and repeat-safe',async()=>{
 const pg=new PGlite();try{
 for(const path of ['001_working-foundation','002_organisation-catalogue'])await pg.exec(await readFile('netlify/database/migrations/'+path+'/migration.sql','utf8'));
 const db={query:async(sql:string,p:any[]=[])=>({rows:(await pg.query(sql,p)).rows as any[]})},id=randomUUID();
 const run=async()=>{await db.query('BEGIN');try{const r=await initialiseOrganisations(db,id);await db.query('COMMIT');return r;}catch(e){await db.query('ROLLBACK');throw e;}};
 const first=await run();assert.equal(first.verified,true);assert.equal(first.totalPharmacies,18);assert.deepEqual(first.organisations.map((o:any)=>[o.name,o.pharmacies]).sort(),[['Demo',2],['Stacks Pharmacies',16]]);
 assert.equal((await run()).totalPharmacies,18);const access=await session(db,{id});assert.equal(access.organisations.length,2);assert.equal(access.pharmacies.length,18);assert.ok(access.pharmacies.every(p=>p.role==='superintendent'));
 assert.equal((await db.query('SELECT count(*)::int AS n FROM reports')).rows[0].n,0);assert.equal((await db.query('SELECT count(*)::int AS n FROM audit_events')).rows[0].n,2);
 const stacks=access.pharmacies.filter(p=>p.organisation_name==='Stacks Pharmacies');assert.equal(stacks.length,16);assert.ok(stacks.every(p=>!p.is_demo));
 await assert.rejects(list(db,{id:randomUUID()},stacks[0].id),denied(403));
 await assert.rejects(initialiseOrganisations(db,randomUUID()),denied(409));
 await db.query('UPDATE memberships SET active=false WHERE user_id=$1 AND pharmacy_id=$2',[id,stacks[0].id]);await assert.rejects(run(),denied(409));assert.equal((await session(db,{id})).pharmacies.length,17);
 }finally{await pg.close();}
});
