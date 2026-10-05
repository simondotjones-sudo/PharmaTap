import {checkQuestions} from './check-questions';
export type CheckAnswer=string|Record<string,string>[];
export function validateCheckAnswers(checkId:string,answers:Record<string,CheckAnswer>,notes:Record<string,string>){
 const questions=checkQuestions[checkId];if(!questions)throw new Error('Checklist not found.');
 if(!answers||typeof answers!=='object'||Array.isArray(answers)||!notes||typeof notes!=='object'||Array.isArray(notes))throw new Error('Invalid checklist answers.');
 const clean:Record<string,CheckAnswer>={},cleanNotes:Record<string,string>={};let failures=0;
 if(Object.keys(answers).some(id=>!questions.some(q=>q.id===id))||Object.keys(notes).some(id=>!questions.some(q=>q.id===id)))throw new Error('Unknown checklist question.');
 for(const q of questions){
  const value=answers[q.id];
  if(q.kind==='yesno'){
   if(value!=='Yes'&&value!=='No')throw new Error('Answer every question with Yes or No.');clean[q.id]=value;
   if(value==='No'){failures++;const note=notes[q.id];if(typeof note!=='string'||note.trim().length<3||note.length>2000)throw new Error('Record the issue or action taken for each No answer.');cleanNotes[q.id]=note.trim();}
  }else{
   if(!Array.isArray(value)||!value.length||value.length>(q.repeat?50:1))throw new Error('Complete all recorded values.');
   clean[q.id]=value.map(row=>{
    if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Invalid recorded values.');const entry:Record<string,string>={};
    for(const f of q.fields!){const v=row[f.id];if(typeof v!=='string'||!v.trim()||v.length>2000)throw new Error('Enter '+f.label.toLowerCase()+'.');
     if(['number','count','nonnegative'].includes(f.type)&&(!Number.isFinite(Number(v))||(f.type!=='number'&&Number(v)<0)||(f.type==='count'&&!Number.isInteger(Number(v)))))throw new Error('Enter a valid '+f.label.toLowerCase()+'.');
     if(f.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))throw new Error('Enter a valid date.');entry[f.id]=v.trim();
    }return entry;
   });
   if(q.repeat){for(const row of clean[q.id] as Record<string,string>[]){if(Number(row.minimum)>Number(row.current)||Number(row.current)>Number(row.maximum))throw new Error('Current temperature must be between the minimum and maximum readings.');}}
  }
 }
 // Temperature answers must agree with the recorded readings.
 if(checkId==='check-1'||checkId==='check-2'){
  const rows=clean.q1 as Record<string,string>[];const inRange=rows.every(r=>['current','minimum','maximum'].every(k=>Number(r[k])<= (checkId==='check-1'?8:25)&&(checkId!=='check-1'||Number(r[k])>=2)));
  if(clean.q2==='Yes'&&!inRange)throw new Error('A temperature is out of range. Answer No to the readings question and record the action taken.');
 }
 return {answers:clean,notes:cleanNotes,failures};
}
