import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {readFile} from 'node:fs/promises';

test('working workspace keeps navigation, bell, profile and report drafts together',async()=>{
 const compiled=await build({entryPoints:['src/workspace.ts'],bundle:true,write:false,format:'iife',plugins:[{name:'mock-identity',setup(b){b.onResolve({filter:/^@netlify\/identity$/},()=>({path:'identity',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:`export async function getUser(){return {id:'simon',name:'Simon Jones'}};export async function handleAuthCallback(){return null};export async function logout(){};export async function login(){};export async function acceptInvite(){};export async function updateUser(){};export async function requestPasswordRecovery(){}` }));}}]});
 const window=new Window({url:'https://pharmatap.test/'}),document=window.document;
 document.write((await readFile('workspace.html','utf8')).replace(/<script.*?<\/script>/g,''));
 const records=[{id:'report-1',title:'Open review',type:'Near miss',detail:'This record needs a reviewer.',owner_id:'simon',owner_name:'Simon',created_at:new Date().toISOString(),occurred_at:new Date().toISOString(),due_at:new Date(Date.now()-3600000).toISOString(),status:'Open'},{id:'report-2',title:'Other open review',owner_id:'simon',status:'Awaiting review',due_at:new Date(Date.now()+3600000).toISOString()},{id:'report-3',title:'Closed review',owner_id:'simon',status:'Closed'},{id:'report-4',title:'Another owner',owner_id:'other',status:'Open'}];
 window.fetch=async(input:any)=>{const url=String(input);return new Response(JSON.stringify(url.endsWith('/session')?{pharmacies:[{id:'site-1',name:'Skerries',display_name:'Simon',role:'superintendent',organisation_id:'org-1',organisation_name:'Stacks Pharmacies'}],organisations:[{id:'org-1',name:'Stacks Pharmacies',role:'admin'}]}:url.includes('/reports?')?{reports:records,reviewers:[{user_id:'simon',display_name:'Simon'}],role:'superintendent'}:url.endsWith('/history')?[]:{initialised:true})) as any;};
 const click=(selector:string)=>{const el=document.querySelector(selector);assert.ok(el,selector);(el as any).click();};
 try{
 window.eval(compiled.outputFiles[0].text);
 for(let i=0;i<50&&!document.querySelector('#navigation-root');i++)await new Promise(r=>setTimeout(r,5));
 assert.equal(document.querySelectorAll('.mobile-navigation button').length,4);
 assert.equal(document.querySelectorAll('.home-task').length,6);
 assert.equal(document.querySelector('.site-context'),null);
 assert.equal(document.querySelector('.profile-version')?.textContent,'PharmaTap Version 1.05.10.26.5');
 assert.equal(document.querySelector('#action-bell .action-count')?.textContent,'2');
 click('#action-bell');assert.equal(document.querySelector('h1')?.textContent,'My Actions');assert.equal(document.querySelectorAll('[data-record]').length,2);
 click('[data-nav-action=back]');assert.equal(document.querySelectorAll('.home-task').length,6);
 click('[data-nav-action=menu]');assert.ok(document.querySelector('#navigation-drawer'));click('[data-page=reports]');assert.equal(document.querySelector('h1')?.textContent,'Reports');assert.equal(document.querySelector('#navigation-drawer'),null);
 assert.equal(document.querySelectorAll('[data-report-type]').length,10);assert.equal(document.querySelector('.site-context'),null);assert.equal(document.querySelector('[data-report-type=Maintenance]'),null);assert.ok([...document.querySelectorAll('.report-tile-title')].every(t=>t.children.length===2));click('[data-report-mode=view]');click('[data-record="report-1"]');assert.equal(document.querySelector('.site-context'),null);assert.equal(document.querySelector('.report-switch'),null);assert.equal(document.querySelector('h2')?.textContent,'Simon');assert.match(document.querySelector('#content')!.textContent!,/Open review/);click('[data-nav-action=back]');assert.equal(document.querySelectorAll('[data-record]').length,4);
 click('[data-nav-action=home]');click('[data-task=report]');click('[data-report-type="Near miss"]');assert.equal(document.querySelector('.report-switch'),null);assert.equal(document.querySelector('.site-context'),null);(document.querySelector('[name=medicine]') as any).value='Keep this draft';
 click('[data-nav-action=ask]');assert.ok(document.querySelector('#ask-panel'));click('[data-ask]');assert.match(document.querySelector('.ask-answer')!.textContent!,/2 open actions.*1 overdue/);click('[data-nav-action=back]');assert.equal((document.querySelector('[name=medicine]') as any).value,'Keep this draft');
 click('#profile-trigger');assert.equal(document.querySelector('#profile-panel')?.hasAttribute('hidden'),false);click('#profile-trigger');assert.equal((document.querySelector('[name=medicine]') as any).value,'Keep this draft');
 click('[data-nav-action=back]');assert.equal(document.querySelector('#report-form'),null);assert.equal(document.querySelector('h1')?.textContent,'Reports');
 assert.ok(document.querySelector('.report-switch'));click('[data-nav-action=home]');click('[data-task=faults]');assert.equal(document.querySelector('.quick-report h2')?.textContent,'Maintenance issue');assert.equal(document.querySelector('.report-switch'),null);click('[data-nav-action=menu]');document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(document.querySelector('#navigation-drawer'),null);
 click('#profile-trigger');click('#logout');for(let i=0;i<50&&!document.querySelector('#login');i++)await new Promise(r=>setTimeout(r,5));assert.ok(document.querySelector('#login'));assert.equal(document.querySelector('#navigation-root'),null);assert.equal(document.querySelector('#action-bell'),null);
 }finally{await window.happyDOM.abort();}
});
