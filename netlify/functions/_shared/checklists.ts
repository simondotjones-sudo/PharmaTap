import {randomUUID,createHash} from 'node:crypto';
import {membership,uuid,Fault,type Actor,type DB} from './service';
import {checkCatalogue} from '../../../src/checks-catalogue';
import {checkQuestions} from '../../../src/check-questions';
import {validateCheckAnswers} from '../../../src/check-answers';
export async function checklistList(db:DB,actor:Actor,pharmacy:string){
 const m=await membership(db,actor,pharmacy);
 return {records:(await db.query(`SELECT r.*,m.display_name AS completed_by FROM checklist_records r JOIN memberships m ON m.user_id=r.created_by AND m.pharmacy_id=r.pharmacy_id WHERE r.pharmacy_id=$1 AND ($2 OR r.owner_role='Staff') ORDER BY r.created_at DESC LIMIT 100`,[pharmacy,m.role!=='staff'])).rows};
}
export async function checklistCreate(db:DB,actor:Actor,input:any,key:string){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Fault(400,'Invalid checklist.');
 const pharmacy=uuid(input.pharmacyId),m=await membership(db,actor,pharmacy);uuid(key);
 const check=checkCatalogue.find(c=>c.id===input.checkId);if(!check)throw new Fault(400,'Checklist not found.');
 if(m.role==='staff'&&check.owner!=='Staff')throw new Fault(403,'This checklist requires pharmacist access.');
 let result;try{result=validateCheckAnswers(check.id,input.answers,input.notes);}catch(e){throw new Fault(400,(e as Error).message);}
 const hash=createHash('sha256').update(JSON.stringify({pharmacy,checkId:check.id,...result})).digest('hex');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[actor.id+':checklist:'+key]);
 const prior=await db.query('SELECT id,request_hash FROM checklist_records WHERE created_by=$1 AND idempotency_key=$2',[actor.id,key]);
 if(prior.rows.length){if(prior.rows[0].request_hash!==hash)throw new Fault(409,'This submission key was used for different answers.');return {id:prior.rows[0].id,replayed:true};}
 const id=randomUUID();await db.query('INSERT INTO checklist_records(id,pharmacy_id,check_id,title,frequency,owner_role,questions,answers,notes,failures,created_by,idempotency_key,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',[id,pharmacy,check.id,check.fullTitle,check.frequency,check.owner,JSON.stringify(checkQuestions[check.id]),JSON.stringify(result.answers),JSON.stringify(result.notes),result.failures,actor.id,key,hash]);
 await db.query('INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$2,$3,$4,$5)',[pharmacy,id,actor.id,'checklist.completed',JSON.stringify({checkId:check.id,failures:result.failures})]);
 return {id,replayed:false};
}
