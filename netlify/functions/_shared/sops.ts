import {createHash} from 'node:crypto';
import {Fault,membership,uuid,type DB,type Actor} from './service';
import {sopGroups} from '../../../src/sops-catalogue';
const text=(v:unknown,min:number,max:number,label:string)=>{if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw new Fault(400,`Check ${label}.`);return v.trim();};
async function admin(db:DB,actor:Actor,site:string){const m=await membership(db,actor,site);if(m.role!=='superintendent')throw new Fault(403,'Only organisation admins can create SOPs.');}
export async function sopList(db:DB,actor:Actor,site:string){
 const m=await membership(db,actor,site);
 if(m.role==='staff')return {drafts:[]};
 return {drafts:(await db.query('SELECT id,title,category,version_label,review_date,supplier,content,pdf IS NOT NULL AS has_pdf,created_at FROM sop_drafts WHERE pharmacy_id=$1 ORDER BY created_at DESC',[site])).rows};
}
export async function sopCreate(db:DB,actor:Actor,input:any){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Fault(400,'Invalid SOP.');
 const site=uuid(input.pharmacyId);await admin(db,actor,site);const id=uuid(input.id);
 const title=text(input.title,3,160,'the SOP title'),category=text(input.category,1,40,'the category'),version=text(input.version,1,30,'the version'),supplier=text(input.supplier??'',0,160,'the supplier'),content=text(input.content??'',0,30000,'the procedure');
 if(!sopGroups.includes(category as any))throw new Fault(400,'Choose a valid category.');
 const review=text(input.reviewDate,10,10,'the review date');if(!/^\d{4}-\d{2}-\d{2}$/.test(review)||!Number.isFinite(Date.parse(review))||new Date(review).toISOString().slice(0,10)!==review)throw new Fault(400,'Choose a valid review date.');
 let pdf:Buffer|undefined;
 if(input.pdf!==undefined){if(typeof input.pdf!=='string'||input.pdf.length>2796204||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.pdf))throw new Fault(400,'Use a PDF smaller than 2 MB.');pdf=Buffer.from(input.pdf,'base64');if(pdf.length>2097152||pdf.toString('base64')!==input.pdf||pdf.subarray(0,5).toString()!=='%PDF-')throw new Fault(400,'Use a valid PDF smaller than 2 MB.');}
 if(!content&&!pdf)throw new Fault(400,'Write the procedure or upload a PDF.');
 if(pdf&&content)throw new Fault(400,'Choose a written SOP or a PDF upload.');
 const hash=createHash('sha256').update(JSON.stringify({site,title,category,version,review,supplier,content,pdf:pdf?.toString('base64')})).digest('hex');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[id]);
 const existing=await db.query('SELECT id,pharmacy_id,created_by,request_hash FROM sop_drafts WHERE id=$1',[id]);
 if(existing.rows.length){if(existing.rows[0].pharmacy_id!==site||existing.rows[0].created_by!==actor.id||existing.rows[0].request_hash!==hash)throw new Fault(409,'This draft identifier is in use.');return {id};}
 await db.query('INSERT INTO sop_drafts(id,pharmacy_id,title,category,version_label,review_date,supplier,content,pdf,created_by,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id,site,title,category,version,review,supplier,content,pdf??null,actor.id,hash]);
 await db.query('INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$2,$3,$4,$5)',[site,id,actor.id,'sop.draft.created',JSON.stringify({title,category,version,reviewDate:review,supplier,uploaded:!!pdf})]);
 return {id};
}
export async function sopPdf(db:DB,actor:Actor,id:string){
 const r=(await db.query('SELECT pharmacy_id,pdf FROM sop_drafts WHERE id=$1',[uuid(id)])).rows[0];if(!r)throw new Fault(404,'SOP not found.');const m=await membership(db,actor,r.pharmacy_id);if(m.role==='staff')throw new Fault(403,'Draft SOPs are restricted to reviewers.');if(!r.pdf)throw new Fault(404,'No PDF attached.');return r.pdf;
}
