import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {checkCatalogue} from '../src/checks-catalogue';
import {checkQuestions} from '../src/check-questions';
import {validateCheckAnswers} from '../src/check-answers';
import {checklistCreate,checklistList} from '../netlify/functions/_shared/checklists';
const answers=(id:string)=>Object.fromEntries(checkQuestions[id].map(q=>[q.id,q.kind==='yesno'?'Yes':[Object.fromEntries(q.fields!.map(f=>[f.id,f.type==='date'?'2026-10-05':f.type==='text'?'Recorded value':id==='check-1'?'4':'0']))]]));
test('all 50 checklist question sets match the supplied source verbatim',async()=>{
 const source=await readFile('sources/checklist-questions.md','utf8');const sections=source.split(/^### /m).slice(1);assert.equal(sections.length,50);
 for(let i=0;i<50;i++){const questions=sections[i].match(/^\d+\. .+$/gm)!.map(line=>line.replace(/^\d+\. (\(record\) )?/,''));assert.deepEqual(checkQuestions[checkCatalogue[i].id].map(q=>q.label),questions);assert.doesNotThrow(()=>validateCheckAnswers(checkCatalogue[i].id,answers(checkCatalogue[i].id),{}));}
 assert.equal(Object.values(checkQuestions).flat().length,323);assert.equal(checkCatalogue[35].frequency,'Twice yearly');
});
test('recorded values support zero counts, multiple fridges and enforce temperature integrity',()=>{
 const a=answers('check-1') as any;a.q1.push({area:'Second fridge',current:'3',minimum:'2',maximum:'8'});assert.equal(validateCheckAnswers('check-1',a,{}).failures,0);
 a.q1[0].maximum='9';assert.throws(()=>validateCheckAnswers('check-1',a,{}),/out of range/);a.q2='No';assert.throws(()=>validateCheckAnswers('check-1',a,{}),/issue or action/);assert.equal(validateCheckAnswers('check-1',a,{q2:'Stock quarantined and pharmacist informed.'}).failures,1);
 a.q1[0].minimum='6';assert.throws(()=>validateCheckAnswers('check-1',a,{q2:'Recorded corrective action'}),/minimum and maximum/);
 assert.equal((validateCheckAnswers('check-3',answers('check-3'),{}).answers.q1 as any)[0].count,'0');
 for(const v of ['-1','0.5','NaN','']){const b=answers('check-3') as any;b.q1[0].count=v;assert.throws(()=>validateCheckAnswers('check-3',b,{}));}
 const b=answers('check-11') as any;b.q6[0].date='2026-02-30';assert.throws(()=>validateCheckAnswers('check-11',b,{}),/date/);
});
test('completions save with audit trail, role/site isolation, safe retry and immutable records',async()=>{
 const pg=new PGlite();try{
 await pg.exec(await readFile('netlify/database/migrations/001_working-foundation/migration.sql','utf8'));await pg.exec(await readFile('netlify/database/migrations/009_checklist-records/migration.sql','utf8'));
 const db={query:async(sql:string,params:any[]=[])=>({rows:(await pg.query(sql,params)).rows as any[]})},org=randomUUID(),site=randomUUID(),other=randomUUID();
 await db.query('INSERT INTO organisations VALUES($1,$2)',[org,'Group']);await db.query('INSERT INTO pharmacies(id,organisation_id,name) VALUES($1,$2,$3),($4,$2,$5)',[site,org,'First',other,'Second']);
 for(const [id,s,role] of [['staff',site,'staff'],['manager',site,'manager'],['other',other,'manager']])await db.query('INSERT INTO memberships(user_id,pharmacy_id,display_name,role) VALUES($1,$2,$1,$3)',[id,s,role]);
 const tx=async(fn:()=>Promise<any>)=>{await db.query('BEGIN');try{const r=await fn();await db.query('COMMIT');return r;}catch(e){await db.query('ROLLBACK');throw e;}};
 const body={pharmacyId:site,checkId:'check-3',answers:answers('check-3'),notes:{}},key=randomUUID();
 const saved=await tx(()=>checklistCreate(db,{id:'staff'},body,key));assert.equal((await tx(()=>checklistCreate(db,{id:'staff'},body,key))).id,saved.id);
 const rows=(await checklistList(db,{id:'manager'},site)).records;assert.equal(rows.length,1);assert.equal(rows[0].created_by,'staff');assert.equal(rows[0].questions.length,5);assert.equal((await db.query('SELECT * FROM audit_events')).rows.length,1);
 await assert.rejects(tx(()=>checklistCreate(db,{id:'staff'},{...body,answers:{...body.answers,q2:'No'},notes:{q2:'Recorded issue'}},key)),/different answers/);
 await assert.rejects(checklistList(db,{id:'other'},site),/access/);
 await assert.rejects(tx(()=>checklistCreate(db,{id:'staff'},{...body,checkId:'check-5',answers:answers('check-5')},randomUUID())),/pharmacist access/);
 await tx(()=>checklistCreate(db,{id:'manager'},{...body,checkId:'check-5',answers:answers('check-5')},randomUUID()));assert.equal((await checklistList(db,{id:'staff'},site)).records.length,1);
 await assert.rejects(db.query('DELETE FROM checklist_records'),/append only/);
 await pg.exec("CREATE FUNCTION reject_check_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'audit failure'; END $$; CREATE TRIGGER reject_check_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_check_audit();");
 await assert.rejects(tx(()=>checklistCreate(db,{id:'staff'},body,randomUUID())),/audit failure/);assert.equal((await db.query('SELECT count(*)::int AS n FROM checklist_records')).rows[0].n,2);
 }finally{await pg.close();}
});
