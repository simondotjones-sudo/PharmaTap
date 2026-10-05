import {test} from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {addSite,addUser,manageList} from '../netlify/functions/_shared/manage';import {Fault,session} from '../netlify/functions/_shared/service';
test('organisation admins add audited sites and users without cross-organisation access or role escalation',async()=>{
 const pg=new PGlite();try{
 for(const n of ['001_working-foundation','002_organisation-catalogue','008_manage-users'])await pg.exec(await readFile(`netlify/database/migrations/${n}/migration.sql`,'utf8'));
 const db={query:async(sql:string,p:any[]=[])=>({rows:(await pg.query(sql,p)).rows as any[]})};const org='876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d',admin=randomUUID();
 await db.query("INSERT INTO organisation_memberships VALUES($1,$2,'admin',true)",[admin,org]);await db.query("INSERT INTO memberships(user_id,pharmacy_id,display_name,role) SELECT $1,id,'Admin','superintendent' FROM pharmacies WHERE organisation_id=$2",[admin,org]);
 const denied=(status:number)=>(e:any)=>e instanceof Fault&&e.status===status;
 for(const actor of [{id:randomUUID()},{id:admin,viewRole:'staff'},{id:admin,viewRole:'manager'}])await assert.rejects(manageList(db,actor,org),denied(403));
 const input={id:randomUUID(),organisationId:org,name:'New pharmacy',county:'Dublin'};await addSite(db,{id:admin},input);await addSite(db,{id:admin},input);assert.equal((await session(db,{id:admin})).pharmacies.length,17);await assert.rejects(addSite(db,{id:admin},{...input,id:randomUUID()}),denied(409));
 const u={organisationId:org,name:'New staff',email:'staff@example.test',role:'staff',siteIds:[input.id]};let calls=0;const resolve=async()=>{calls++;return 'staff-id';};
 await assert.rejects(addUser(db,{id:admin},{...u,siteIds:['a0e2cc87-2fb0-4a72-9bb4-1f8f4eeb476e']},resolve),denied(403));assert.equal(calls,0);
 await addUser(db,{id:admin},u,resolve);await assert.rejects(addUser(db,{id:admin},u,resolve),denied(409));assert.equal(calls,1);
 const access=await session(db,{id:'staff-id'});assert.equal(access.pharmacies.length,1);assert.equal(access.pharmacies[0].role,'staff');assert.equal(access.organisations.length,0);
 await assert.rejects(addUser(db,{id:'staff-id'},{...u,email:'bad@example.test',role:'superintendent'},resolve),denied(403));
 await addUser(db,{id:admin},{...u,email:'admin@example.test',role:'superintendent'},async()=> 'new-admin');assert.equal((await session(db,{id:'new-admin'})).pharmacies.length,17);
 const second={...input,id:randomUUID(),name:'Another pharmacy'};await addSite(db,{id:admin},second);assert.equal((await session(db,{id:'new-admin'})).pharmacies.length,18);assert.equal((await session(db,{id:'staff-id'})).pharmacies.length,1);
 const result=await manageList(db,{id:admin},org);assert.ok(result.sites.every(s=>s.has_admin&&s.has_reviewer));assert.equal(result.users.filter(u=>u.user_id==='staff-id')[0].email,'staff@example.test');assert.equal((await db.query("SELECT * FROM audit_events WHERE event IN ('site.created','user.added')")).rows.length,4);
 }finally{await pg.close();}
});
