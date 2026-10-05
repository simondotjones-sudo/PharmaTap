import { randomUUID, createHash } from 'node:crypto';
import {reportTypes,reportDetail} from '../../../src/report-types';
export type Actor = { id: string; viewRole?: string };
export type DB = { query: (sql: string, params?: any[]) => Promise<{rows: any[]}> };
export class Fault extends Error { constructor(public status: number, message: string) { super(message); } }
const fail = (status:number, message:string): never => { throw new Fault(status,message); };
export function uuid(value:unknown): string {
 if(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))fail(400,'Invalid record identifier.'); return value as string;
}
function text(value:unknown,min:number,max:number,label:string):string {
 if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)fail(400,`${label} must contain ${min}–${max} characters.`); return (value as string).trim();
}
function date(value:unknown,label:string):string { if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value)))fail(400,`Invalid ${label}.`); return new Date(value as string).toISOString(); }
export async function membership(db:DB,actor:Actor,pharmacy:string) {
 const {rows}=await db.query('SELECT * FROM memberships WHERE user_id=$1 AND pharmacy_id=$2 AND active=true',[actor.id,uuid(pharmacy)]);
 const m=rows[0]||fail(403,'You do not have access to this pharmacy.');
 if(actor.viewRole){const roles=['staff','manager','superintendent'];if(!roles.includes(actor.viewRole)||roles.indexOf(actor.viewRole)>roles.indexOf(m.role))fail(403,'This role is not available for your account at this pharmacy.');return {...m,role:actor.viewRole};}
 return m;
}
export async function session(db:DB,actor:Actor){
 const {rows}=await db.query('SELECT p.id,p.name,p.timezone,p.organisation_id,o.name AS organisation_name,o.is_demo,m.role,m.display_name FROM memberships m JOIN pharmacies p ON p.id=m.pharmacy_id JOIN organisations o ON o.id=p.organisation_id WHERE m.user_id=$1 AND m.active=true ORDER BY o.is_demo,o.name,p.name',[actor.id]);
 const organisations=await db.query("SELECT o.id,o.name,o.is_demo,om.role FROM organisation_memberships om JOIN organisations o ON o.id=om.organisation_id WHERE om.user_id=$1 AND om.active=true ORDER BY o.is_demo,o.name",[actor.id]);
 return {userId:actor.id,pharmacies:rows,organisations:organisations.rows};
}
export async function list(db:DB,actor:Actor,pharmacy:string){
 const m=await membership(db,actor,pharmacy);
 const reports=await db.query(`SELECT r.*,EXISTS(SELECT 1 FROM report_photos p WHERE p.report_id=r.id) AS has_photo,a.id AS action_id,a.status,a.owner_id,a.due_at,a.resolution,a.version,m.display_name AS owner_name FROM reports r JOIN actions a ON a.report_id=r.id JOIN memberships m ON m.user_id=a.owner_id AND m.pharmacy_id=a.pharmacy_id WHERE r.pharmacy_id=$1 AND ($2 OR r.created_by=$3 OR a.owner_id=$3) ORDER BY r.created_at DESC`,[pharmacy,m.role!=='staff',actor.id]);
 const reviewers=await db.query("SELECT user_id,display_name FROM memberships WHERE pharmacy_id=$1 AND active=true AND role IN ('manager','superintendent') ORDER BY CASE role WHEN 'manager' THEN 0 ELSE 1 END,display_name,user_id",[pharmacy]);
 return {reports:reports.rows,reviewers:reviewers.rows,role:m.role};
}
export async function createReport(db:DB,actor:Actor,input:any,key:string){
 if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'Invalid report.');
 const pharmacy=uuid(input.pharmacyId); await membership(db,actor,pharmacy); uuid(key);
 const type=text(input.type,3,40,'Report type');
 if(!reportTypes.some(t=>t.type===type))fail(400,'Invalid report type.');
 let photo:Buffer|undefined,photoHash:string|undefined;
 if(input.photo!==undefined){
  if(type!=='Maintenance')fail(400,'Photos are available for maintenance reports.');
  if(typeof input.photo!=='string'||input.photo.length>1398104||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.photo))fail(400,'Invalid photo.');
  photo=Buffer.from(input.photo,'base64');
  if(photo.toString('base64')!==input.photo||photo.length<6||photo.length>1048576||photo[0]!==255||photo[1]!==216||photo[2]!==255||photo.at(-2)!==255||photo.at(-1)!==217)fail(400,'Use a JPEG photo smaller than 1 MB.');
  photoHash=createHash('sha256').update(photo).digest('hex');
 }
 if(input.answers!==undefined){
  if(!input.answers||typeof input.answers!=='object'||Array.isArray(input.answers))fail(400,'Invalid report answers.');
  const definition=reportTypes.find(t=>t.type===type)!;
  const answers:Record<string,string>={};
  for(const field of definition.fields){const value=text(input.answers[field.id],field.optional?0:1,200,field.label);if(field.options&&!field.options.includes(value))fail(400,'Choose a valid '+field.label.toLowerCase()+'.');answers[field.id]=value;}
  const note=text(input.note??'',Object.values(answers).includes('Other')?1:0,2000,'Additional detail');
  input={...input,title:(type+' · '+(answers.medicine||answers.issue||answers.area||'New report')).slice(0,160),detail:reportDetail(definition,answers,note)};
 }
 const title=text(input.title,3,160,'Title'),detail=text(input.detail,10,4000,'Details');
 const occurred=date(input.occurredAt,'occurrence time'),due=date(input.dueAt,'due time'),owner=text(input.ownerId,1,128,'Reviewer');
 if(Date.parse(occurred)>Date.now()+60000)fail(400,'Occurrence time cannot be in the future.');

 const reviewer=await db.query("SELECT user_id FROM memberships WHERE pharmacy_id=$1 AND user_id=$2 AND active=true AND role IN ('manager','superintendent')",[pharmacy,owner]);
 if(!reviewer.rows.length)fail(400,'Select an active reviewer at this pharmacy.');
 const hash=createHash('sha256').update(JSON.stringify({pharmacy,type,title,detail,occurred,due,owner,...(photoHash?{photoHash}:{})})).digest('hex');
 // Serialize identical submissions before looking up the idempotency key.
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[actor.id+':'+key]);
 const existing=await db.query('SELECT id,request_hash FROM reports WHERE created_by=$1 AND idempotency_key=$2',[actor.id,key]);
 if(existing.rows.length){if(existing.rows[0].request_hash!==hash)fail(409,'This submission key was already used for different content.');return {id:existing.rows[0].id,replayed:true};}
 if(Date.parse(due)<=Date.now())fail(400,'Choose a future review deadline.');
 const id=randomUUID(),action=randomUUID();
 await db.query('INSERT INTO reports(id,pharmacy_id,type,title,detail,occurred_at,created_by,idempotency_key,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,pharmacy,type,title,detail,occurred,actor.id,key,hash]);
 if(photo)await db.query('INSERT INTO report_photos(report_id,pharmacy_id,content_type,data,sha256) VALUES($1,$2,$3,$4,$5)',[id,pharmacy,'image/jpeg',photo,photoHash]);
 await db.query('INSERT INTO actions(id,pharmacy_id,report_id,owner_id,due_at) VALUES($1,$2,$3,$4,$5)',[action,pharmacy,id,owner,due]);
 await db.query('INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$2,$3,$4,$5)',[pharmacy,id,actor.id,'report.created',JSON.stringify({type,title,detail,occurredAt:occurred,actionId:action,ownerId:owner,dueAt:due,...(photo?{photo:{contentType:'image/jpeg',bytes:photo.length,sha256:photoHash}}:{})})]);
 return {id,replayed:false};
}
export async function updateAction(db:DB,actor:Actor,id:string,input:any){
 uuid(id);if(!input||typeof input!=='object')fail(400,'Invalid action.');
 const {rows}=await db.query('SELECT * FROM actions WHERE id=$1 FOR UPDATE',[id]);
 const a=rows[0]||fail(404,'Action not found.'); const m=await membership(db,actor,a.pharmacy_id);
 if(m.role==='staff')fail(403,'Only pharmacy reviewers can update actions.');
 if(!Number.isInteger(input.version)||input.version!==a.version)fail(409,'This action has changed. Refresh before saving.');
 if(!['Open','Awaiting review','Closed'].includes(input.status))fail(400,'Invalid action status.');
 const resolution=text(input.resolution,input.status==='Open'?0:10,4000,'Review notes');
 if(a.status==='Closed')fail(409,'Closed actions cannot be edited. Create a follow-up report.');
 const updated=await db.query('UPDATE actions SET status=$1,resolution=$2,version=version+1,updated_at=now() WHERE id=$3 RETURNING *',[input.status,resolution,id]);
 await db.query('INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$2,$3,$4,$5)',[a.pharmacy_id,a.report_id,actor.id,'action.updated',JSON.stringify({actionId:id,before:{status:a.status,resolution:a.resolution,version:a.version},after:{status:input.status,resolution,version:a.version+1}})]);
 return updated.rows[0];
}
export async function history(db:DB,actor:Actor,id:string){
 uuid(id);const {rows}=await db.query('SELECT r.pharmacy_id,r.created_by,a.owner_id FROM reports r JOIN actions a ON a.report_id=r.id WHERE r.id=$1',[id]);
 const r=rows[0]||fail(404,'Report not found.');const m=await membership(db,actor,r.pharmacy_id);
 if(m.role==='staff'&&r.created_by!==actor.id&&r.owner_id!==actor.id)fail(403,'You do not have access to this report.');
 return (await db.query('SELECT id,actor_id,event,payload,created_at FROM audit_events WHERE pharmacy_id=$1 AND entity_id=$2 ORDER BY id',[r.pharmacy_id,id])).rows;
}
export async function reportPhoto(db:DB,actor:Actor,id:string){
 uuid(id);const {rows}=await db.query('SELECT r.pharmacy_id,r.created_by,a.owner_id FROM reports r JOIN actions a ON a.report_id=r.id WHERE r.id=$1',[id]);
 const r=rows[0]||fail(404,'Report not found.');const m=await membership(db,actor,r.pharmacy_id);
 if(m.role==='staff'&&r.created_by!==actor.id&&r.owner_id!==actor.id)fail(403,'You do not have access to this photo.');
 const photo=await db.query('SELECT content_type,data FROM report_photos WHERE report_id=$1',[id]);
 return photo.rows[0]||fail(404,'Photo not found.');
}
export async function exportPharmacy(db:DB,actor:Actor,pharmacy:string){
 const m=await membership(db,actor,pharmacy);if(m.role==='staff')fail(403,'Only pharmacy reviewers can export records.');
 const data=await list(db,actor,pharmacy);
 const audit=await db.query('SELECT * FROM audit_events WHERE pharmacy_id=$1 ORDER BY id',[pharmacy]);
 const photos=await db.query("SELECT report_id,content_type,sha256,encode(data,'base64') AS base64 FROM report_photos WHERE pharmacy_id=$1",[pharmacy]);
 return {formatVersion:1,exportedAt:new Date().toISOString(),exportedBy:actor.id,pharmacyId:pharmacy,reportCount:data.reports.length,reports:data.reports,auditEvents:audit.rows,photos:photos.rows};
}
