import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {sopCreate,sopList,sopPdf} from '../netlify/functions/_shared/sops';
import {Fault} from '../netlify/functions/_shared/service';
test('SOP drafts and supplier PDFs are private, audited, repeat-safe and role restricted',async()=>{
 const pg=new PGlite();try{
 for(const name of ['001_working-foundation','007_sop-drafts'])await pg.exec(await readFile(`netlify/database/migrations/${name}/migration.sql`,'utf8'));
 const db={query:async(sql:string,params:any[]=[])=>({rows:(await pg.query(sql,params)).rows as any[]})};
 const org=randomUUID(),site=randomUUID(),other=randomUUID();await db.query('INSERT INTO organisations VALUES($1,$2)',[org,'Test']);await db.query('INSERT INTO pharmacies(id,organisation_id,name) VALUES($1,$3,$4),($2,$3,$5)',[site,other,org,'First','Other']);
 for(const role of ['staff','manager','superintendent'])await db.query('INSERT INTO memberships(user_id,pharmacy_id,display_name,role) VALUES($1,$2,$1,$1)',[role,site]);
 const input={id:randomUUID(),pharmacyId:site,title:'Receipt of medicines',category:'Medicines',version:'1.0',reviewDate:'2027-10-05',content:'This is a written draft procedure.'};
 const denied=(status:number)=>(e:unknown)=>e instanceof Fault&&e.status===status;
 for(const actor of [{id:'staff'},{id:'manager'},{id:'superintendent',viewRole:'staff'}])await assert.rejects(sopCreate(db,actor,input),denied(403));
 await sopCreate(db,{id:'superintendent'},input);await sopCreate(db,{id:'superintendent'},input);
 assert.equal((await sopList(db,{id:'manager'},site)).drafts.length,1);assert.equal((await sopList(db,{id:'staff'},site)).drafts.length,0);
 assert.equal((await db.query("SELECT * FROM audit_events WHERE event='sop.draft.created'")).rows.length,1);
 await assert.rejects(sopCreate(db,{id:'superintendent'},{...input,title:'Changed draft'}),denied(409));
 await assert.rejects(sopList(db,{id:'superintendent'},other),denied(403));
 const pdf=Buffer.from('%PDF-1.7\n supplier content');const upload={...input,id:randomUUID(),content:'',supplier:'Supplier',pdf:pdf.toString('base64')};await sopCreate(db,{id:'superintendent'},upload);
 assert.deepEqual(Buffer.from(await sopPdf(db,{id:'manager'},upload.id)),pdf);await assert.rejects(sopPdf(db,{id:'staff'},upload.id),denied(403));
 for(const patch of [{pdf:Buffer.from('not a PDF').toString('base64')},{reviewDate:'2027-02-30'},{category:'Bad'},{pdf:undefined,content:''}])await assert.rejects(sopCreate(db,{id:'superintendent'},{...upload,...patch,id:randomUUID()}),denied(400));
 }finally{await pg.close();}
});
