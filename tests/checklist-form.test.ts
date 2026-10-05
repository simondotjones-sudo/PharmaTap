import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
test('checklist form keeps failed submissions, retries safely and shows saved records',async()=>{
 const compiled=await build({stdin:{contents:`import {renderChecklistForm} from './src/checklist-form';import {checkCatalogue} from './src/checks-catalogue';window.renderTest=(host,context)=>renderChecklistForm(host,checkCatalogue[0],context);`,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'});
 const window=new Window({url:'https://pharmatap.test/'}),document=window.document;document.body.innerHTML='<div id="host"></div>';window.eval(compiled.outputFiles[0].text);
 let fail=true;const calls:any[]=[];const api=async(path:string,options:any)=>{if(!options)return {records:[]};calls.push(options);if(fail){fail=false;throw new Error('Temporary save failure');}return {id:'saved'};};
 try{
 (window as any).renderTest(document.querySelector('#host'),{siteId:'site',api});const form=document.querySelector('#check-complete')!;
 const click=(selector:string)=>(document.querySelector(selector) as any).click();const fill=(selector:string,value:string)=>{(document.querySelector(selector) as any).value=value;};
 fill('[data-field=area]','First fridge');fill('[data-field=current]','4');fill('[data-field=minimum]','3');fill('[data-field=maximum]','9');
 for(const id of ['q2','q3','q4','q5','q6'])click('input[name='+id+'][value=Yes]');
 const submit=()=>form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));submit();assert.match(document.querySelector('#check-save-error')!.textContent!,/out of range/);assert.equal(calls.length,0);
 click('input[name=q2][value=No]');assert.equal(document.querySelector('.check-issue')!.hasAttribute('hidden'),false);fill('[name=note-q2]','Quarantined stock and informed pharmacist.');
 click('[data-add-row=q1]');assert.equal(document.querySelectorAll('[data-question=q1]').length,2);click('[data-remove-row]');assert.equal(document.querySelectorAll('[data-question=q1]').length,1);
 submit();await new Promise(r=>setTimeout(r,10));assert.equal((document.querySelector('#check-submit') as any).disabled,false);assert.match(document.querySelector('#check-save-error')!.textContent!,/Temporary save failure/);assert.equal((document.querySelector('[data-field=area]') as any).value,'First fridge');
 submit();await new Promise(r=>setTimeout(r,10));assert.equal(calls.length,2);assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);assert.match(form.textContent!,/Checklist saved/);assert.equal(JSON.parse(calls[1].body).notes.q2,'Quarantined stock and informed pharmacist.');
 }finally{await window.happyDOM.abort();}
});
