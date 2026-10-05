import {trainingCatalogue,trainingGroups,type TrainingGroup} from './training-catalogue';
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let mode='dashboards',group:TrainingGroup='Core',selected='',scope='';
export function resetTraining(){mode='dashboards';group='Core';selected='';}
export function trainingBack(){if(!selected)return false;selected='';return true;}
const paths:Record<TrainingGroup,string>={Core:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',Pharmacy:'M8 3a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5z M3 12h10 M17 8h4 M17 12h4 M17 16h4',Dispensary:'M8 4H5v17h14V4h-3 M8 2h8v5H8z M8 11h8 M8 15h5',Pharmacists:'M2 8l10-5 10 5-10 5z M6 10v7c4 3 8 3 12 0v-7 M22 8v9','Risk-based':'M12 3L2 21h20z M12 9v5 M12 17v1'};
export function renderTraining(host:Element,context:{organisationId:string;siteId:string;role:string}){
 const nextScope=context.organisationId+':'+context.siteId+':'+context.role;
 if(nextScope!==scope){scope=nextScope;resetTraining();}
 const manager=['manager','superintendent'].includes(context.role);
 const redraw=()=>renderTraining(host,context);
 const current=trainingCatalogue.find(c=>c.id===selected);
 host.innerHTML=`<h1>Training</h1>${manager&&!current?`<div class="report-switch training-switch" role="group" aria-label="Training view"><button data-training-mode="dashboards" aria-pressed="${mode==='dashboards'}">Dashboards</button><button data-training-mode="reports" aria-pressed="${mode==='reports'}">Reports</button></div>`:''}<section id="training-body"></section>`;
 const body=host.querySelector('#training-body')!;
 if(current){
  body.innerHTML=`<section class="card training-detail"><div class="row"><h2>${esc(current.name)}</h2><button class="secondary" data-training-back>Back</button></div><div class="check-meta"><span class="pill">${esc(current.group)}</span><span>${esc(current.audience)}</span></div><p>${esc(current.condition)}</p><h3>Topics to cover</h3><ul>${current.topics.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><h3>Training evidence</h3><p>${esc(current.evidence)}</p><p class="help">Course content has not been added yet.</p>${current.source?`<a class="training-source" href="${esc(current.source)}" target="_blank" rel="noopener noreferrer">View official guidance ↗</a>`:''}</section>`;
 }else if(manager&&mode==='reports'){
  body.innerHTML='<section class="card training-empty"><span class="report-tile-icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5"/></svg></span><h2>No training records yet</h2><p>Staff completions, due dates and certificate records will appear here when training tracking is connected.</p></section>';
 }else{
  body.innerHTML=`${manager?'<section class="card training-empty"><h2>Training overview</h2><p>Completion and overdue training will appear here when training tracking is connected.</p></section>':''}<div class="check-frequencies training-groups" role="group" aria-label="Training category">${trainingGroups.map(g=>`<button data-training-group="${esc(g)}" aria-pressed="${group===g}">${esc(g)}</button>`).join('')}</div><section class="report-tiles training-tiles" aria-label="${esc(group)} training">${trainingCatalogue.filter(c=>c.group===group).map(c=>`<button class="report-tile training-tile" data-training-open="${c.id}"><span class="report-tile-icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[c.group]}"/></svg></span><strong>${c.title.map(t=>`<span>${esc(t)}</span>`).join('')}</strong><span>${c.description.map(t=>`<span>${esc(t)}</span>`).join('')}</span></button>`).join('')}</section>`;
 }
 host.querySelectorAll<HTMLElement>('[data-training-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.trainingMode!;redraw();});
 host.querySelectorAll<HTMLElement>('[data-training-group]').forEach(b=>b.onclick=()=>{group=b.dataset.trainingGroup as TrainingGroup;redraw();});
 host.querySelectorAll<HTMLElement>('[data-training-open]').forEach(b=>b.onclick=()=>{selected=b.dataset.trainingOpen!;redraw();window.scrollTo({top:0,behavior:'instant'});});
 host.querySelector('[data-training-back]')?.addEventListener('click',()=>{selected='';redraw();});
}
