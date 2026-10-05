import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { session,list,createReport,updateAction,history,exportPharmacy,Fault } from '../netlify/functions/_shared/service';
import { guard } from '../netlify/functions/workspace.mts';
const migration=await readFile('netlify/database/migrations/001_working-foundation/migration.sql','utf8');
async function fixture(){
 const pg=new PGlite();await pg.exec(migration);await pg.exec(await readFile('netlify/database/migrations/002_organisation-catalogue/migration.sql','utf8'));await pg.exec(await readFile('netlify/database/migrations/003_initial-administrator/migration.sql','utf8'));await pg.exec(await readFile('netlify/database/migrations/005_report-types/migration.sql','utf8'));const db={query:async(sql:string,params:any[]=[])=>{const result=await pg.query(sql,params);return {rows:result.rows as any[]};}};
 const org=randomUUID(),otherOrg=randomUUID(),site=randomUUID(),otherSite=randomUUID();
 await db.query('INSERT INTO organisations VALUES($1,$2),($3,$4)',[org,'Group',otherOrg,'Other group']);
 await db.query('INSERT INTO pharmacies(id,organisation_id,name) VALUES($1,$2,$3),($4,$5,$6)',[site,org,'First pharmacy',otherSite,otherOrg,'Other pharmacy']);
 for(const [id,pharmacy,role] of [['staff',site,'staff'],['colleague',site,'staff'],['manager',site,'manager'],['other',otherSite,'superintendent']])await db.query('INSERT INTO memberships(user_id,pharmacy_id,display_name,role) VALUES($1,$2,$1,$3)',[id,pharmacy,role]);
 const input={pharmacyId:site,type:'Near miss',title:'Incorrect shelf selection',detail:'An incorrect item was intercepted during the approved checking process.',occurredAt:new Date(Date.now()-60000).toISOString(),dueAt:new Date(Date.now()+86400000).toISOString(),ownerId:'manager'};
 const transaction=async(fn:()=>Promise<any>)=>{await db.query('BEGIN');try{const result=await fn();await db.query('COMMIT');return result;}catch(e){await db.query('ROLLBACK');throw e;}};
 return {pg,db,site,otherSite,input,transaction};
}
const denied=(status:number)=>(e:unknown)=>e instanceof Fault&&e.status===status;
test('report, assignment, review, history and export reconcile',async()=>{
 const f=await fixture();try{
 const saved=await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,randomUUID()));
 const staff=await list(f.db,{id:'staff'},f.site);assert.equal(staff.reports.length,1);assert.equal(staff.reports[0].owner_id,'manager');assert.equal(staff.reports[0].created_by,'staff');
 const action=staff.reports[0];await f.transaction(()=>updateAction(f.db,{id:'manager'},action.action_id,{version:1,status:'Closed',resolution:'Reviewed with the team and corrective action recorded.'}));
 const h=await history(f.db,{id:'staff'},saved.id);assert.equal(h.length,2);assert.equal(h[1].actor_id,'manager');
 const exported=await exportPharmacy(f.db,{id:'manager'},f.site);assert.equal(exported.reportCount,1);assert.equal(exported.reports[0].status,'Closed');assert.equal(exported.auditEvents.length,2);
 }finally{await f.pg.close();}
});
test('cross-organisation access, staff review/export and unrelated staff incident access denied',async()=>{
 const f=await fixture();try{
 const saved=await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,randomUUID()));
 await assert.rejects(list(f.db,{id:'other'},f.site),denied(403));
 await assert.rejects(createReport(f.db,{id:'other'},f.input,randomUUID()),denied(403));
 assert.equal((await list(f.db,{id:'colleague'},f.site)).reports.length,0);
 await assert.rejects(history(f.db,{id:'colleague'},saved.id),denied(403));
 await assert.rejects(history(f.db,{id:'other'},saved.id),denied(403));
 await assert.rejects(exportPharmacy(f.db,{id:'staff'},f.site),denied(403));
 const a=(await list(f.db,{id:'staff'},f.site)).reports[0];
 await assert.rejects(f.transaction(()=>updateAction(f.db,{id:'staff'},a.action_id,{version:1,status:'Closed',resolution:'I should not close this.'})),denied(403));
 await assert.rejects(f.transaction(()=>updateAction(f.db,{id:'other'},a.action_id,{version:1,status:'Closed',resolution:'I should not close this.'})),denied(403));
 }finally{await f.pg.close();}
});
test('idempotent retry returns same report; changed payload with same key rejected',async()=>{
 const f=await fixture();try{const key=randomUUID();const a=await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,key));const b=await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,key));assert.equal(a.id,b.id);assert.equal(b.replayed,true);
 await assert.rejects(f.transaction(()=>createReport(f.db,{id:'staff'},{...f.input,title:'Changed title'},key)),denied(409));assert.equal((await list(f.db,{id:'manager'},f.site)).reports.length,1);
 }finally{await f.pg.close();}
});
test('stale revisions cannot overwrite review; closure requires notes and is final',async()=>{
 const f=await fixture();try{await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,randomUUID()));const a=(await list(f.db,{id:'manager'},f.site)).reports[0];
 await f.transaction(()=>updateAction(f.db,{id:'manager'},a.action_id,{version:1,status:'Awaiting review',resolution:'Checking the documented contributing factors.'}));
 await assert.rejects(f.transaction(()=>updateAction(f.db,{id:'manager'},a.action_id,{version:1,status:'Closed',resolution:'Stale revision should never overwrite.'})),denied(409));
 await assert.rejects(f.transaction(()=>updateAction(f.db,{id:'manager'},a.action_id,{version:2,status:'Closed',resolution:''})),denied(400));
 await f.transaction(()=>updateAction(f.db,{id:'manager'},a.action_id,{version:2,status:'Closed',resolution:'Corrective action reviewed and completed.'}));
 await assert.rejects(f.transaction(()=>updateAction(f.db,{id:'manager'},a.action_id,{version:3,status:'Open',resolution:''})),denied(409));
 }finally{await f.pg.close();}
});
test('invalid owner, dates, type and inactive membership denied',async()=>{
 const f=await fixture();try{
 for(const patch of [{ownerId:'other'},{ownerId:'staff'},{type:'Unknown'},{title:'x'},{occurredAt:'bad'},{occurredAt:new Date(Date.now()+86400000).toISOString()},{dueAt:new Date(Date.now()-86400000).toISOString()}])await assert.rejects(f.transaction(()=>createReport(f.db,{id:'staff'},{...f.input,...patch},randomUUID())),denied(400));
 await f.db.query("UPDATE memberships SET active=false WHERE user_id='staff'");assert.equal((await session(f.db,{id:'staff'})).pharmacies.length,0);await assert.rejects(list(f.db,{id:'staff'},f.site),denied(403));
 }finally{await f.pg.close();}
});
test('audit update/delete blocked by database; failed audit insertion rolls report and action back',async()=>{
 const f=await fixture();try{await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,randomUUID()));await assert.rejects(f.db.query("UPDATE audit_events SET event='tampered'"),/append only/);await assert.rejects(f.db.query('DELETE FROM audit_events'),/append only/);await assert.rejects(f.db.query("UPDATE reports SET title='tampered'"),/append only/);await assert.rejects(f.db.query('DELETE FROM reports'),/append only/);
 await f.pg.exec("CREATE FUNCTION reject_new_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'simulated audit failure'; END $$; CREATE TRIGGER reject_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_new_audit();");
 await assert.rejects(f.transaction(()=>createReport(f.db,{id:'staff'},f.input,randomUUID())),/simulated audit failure/);
 assert.equal((await f.db.query('SELECT count(*)::int AS n FROM reports')).rows[0].n,1);assert.equal((await f.db.query('SELECT count(*)::int AS n FROM actions')).rows[0].n,1);
 }finally{await f.pg.close();}
});
test('mutation request guard denies cross-origin, absent origin and non-JSON writes',()=>{
 const url='https://pharmatap.netlify.app/api/workspace/reports';
 for(const origin of ['https://evil.example','null',undefined])assert.throws(()=>guard(new Request(url,{method:'POST',headers:{...(origin?{origin}:{}),'content-type':'application/json'}})),denied(403));
 assert.throws(()=>guard(new Request(url,{method:'POST',headers:{origin:'https://pharmatap.netlify.app','content-type':'text/plain'}})),denied(415));
 assert.doesNotThrow(()=>guard(new Request(url,{method:'POST',headers:{origin:'https://pharmatap.netlify.app','content-type':'application/json'}})));
});
test('role switching restricts privileges and cannot elevate a membership',async()=>{
 const f=await fixture();try{
 await f.transaction(()=>createReport(f.db,{id:'staff'},f.input,randomUUID()));
 await f.db.query("INSERT INTO memberships(user_id,pharmacy_id,display_name,role) VALUES('admin',$1,'Admin','superintendent')",[f.site]);
 assert.equal((await list(f.db,{id:'admin'},f.site)).reports.length,1);
 assert.equal((await list(f.db,{id:'admin',viewRole:'staff'},f.site)).reports.length,0);
 assert.equal((await list(f.db,{id:'admin',viewRole:'manager'},f.site)).role,'manager');
 await assert.rejects(exportPharmacy(f.db,{id:'admin',viewRole:'staff'},f.site),denied(403));
 const a=(await list(f.db,{id:'admin'},f.site)).reports[0];
 await assert.rejects(f.transaction(()=>updateAction(f.db,{id:'admin',viewRole:'staff'},a.action_id,{version:1,status:'Closed',resolution:'Review should be blocked in staff view.'})),denied(403));
 for(const viewRole of ['manager','superintendent','admin','invalid'])await assert.rejects(list(f.db,{id:'staff',viewRole},f.site),denied(403));
 await assert.rejects(list(f.db,{id:'manager',viewRole:'superintendent'},f.site),denied(403));
 await assert.rejects(list(f.db,{id:'admin',viewRole:'staff'},f.otherSite),denied(403));
 }finally{await f.pg.close();}
});

test('all quick-report types save their specific answers, action and audit history',async()=>{
 const {reportTypes}=await import('../src/report-types');const f=await fixture();try{
 for(const definition of reportTypes){
  const answers=Object.fromEntries(definition.fields.map(field=>[field.id,field.options?.[0]||'Sample product or incident']));
  const saved=await f.transaction(()=>createReport(f.db,{id:'staff'},{...f.input,type:definition.type,answers,note:'Extra context for review.'},randomUUID()));
  const row=(await list(f.db,{id:'staff'},f.site)).reports.find(r=>r.id===saved.id);
  assert.equal(row.type,definition.type);assert.match(row.detail,/Extra context for review/);assert.equal(row.owner_id,'manager');assert.equal((await history(f.db,{id:'staff'},saved.id)).length,1);
 }
 await assert.rejects(f.transaction(()=>createReport(f.db,{id:'staff'},{...f.input,answers:{issue:'Invalid choice',medicine:'Sample'},note:''},randomUUID())),denied(400));
 await assert.rejects(f.transaction(()=>createReport(f.db,{id:'staff'},{...f.input,answers:{issue:'Medicine'},note:''},randomUUID())),denied(400));
 assert.equal((await list(f.db,{id:'manager'},f.site)).reports.length,11);
 }finally{await f.pg.close();}
});
