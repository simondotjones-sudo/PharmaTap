import {renderChecklistDashboard} from './checklist-dashboard';
import {renderChecklistForm} from './checklist-form';
import {statusPanels} from './status-panels';
import {checkCatalogue,type CheckDefinition} from './checks-catalogue';
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const frequencies=['Daily','Weekly','Monthly','Quarterly','Twice yearly','Annual'];
const owners=['Staff','Pharmacist','Supervising pharmacist','Owner / Superintendent'];
const drafts=new Map<string,CheckDefinition[]>();
let mode='checks',frequency='Daily',selected='',editing=false,scope='';
export function clearChecks(){drafts.clear();scope='';resetChecks();}
export function checksBack(){if(!selected)return false;selected='';editing=false;return true;}
export function resetChecks(){mode='checks';frequency='Daily';selected='';editing=false;}
export function renderChecks(host:Element,context:{organisationId:string;siteId:string;role:string;sites:{id:string;name:string}[];report:()=>void;api:(path:string,options?:RequestInit)=>Promise<any>}){
 if(scope!==context.organisationId){scope=context.organisationId;resetChecks();}
 const admin=context.role!=='staff';if(!admin&&mode!=='checks')resetChecks();
 if(!drafts.has(scope))drafts.set(scope,checkCatalogue.map(c=>({...c,sites:[...c.sites]})));
 const checks=drafts.get(scope)!;
 const assigned=(c:CheckDefinition)=>!c.sites.length||c.sites.includes(context.siteId);
 const visible=checks.filter(c=>c.enabled&&assigned(c)&&(admin||c.owner==='Staff'));
 const redraw=()=>renderChecks(host,context);
 const tileIcon=(c:CheckDefinition)=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${c.title.includes('temperature')?'M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z M12 8v9':c.title.includes('security')?'M6 10V8a6 6 0 0 1 12 0v2 M4 10h16v11H4z':'M8 4H5v17h14V4h-3 M8 2h8v5H8z M8 12l3 3 5-6'}"/></svg>`;
 const lines=(title:string)=>{const words=title.split(' '),mid=Math.ceil(words.length/2);return `<span>${esc(words.slice(0,mid).join(' '))}</span> <span>${esc(words.slice(mid).join(' '))}</span>`;};
 if(!admin&&selected&&!visible.some(c=>c.id===selected)){selected='';editing=false;}
 const current=checks.find(c=>c.id===selected);
 host.innerHTML=`<h1>Checks</h1>${!selected&&admin?`<div class="report-switch checks-switch" role="group" aria-label="Checks view">${['checks','dashboard','manage'].map(m=>`<button data-check-mode="${m}" aria-pressed="${mode===m}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div>`:''}<div id="checks-body"></div>`;
 const body=host.querySelector('#checks-body')!;
 if(current){
  if(editing&&admin){body.innerHTML=`<section class="card check-detail"><div class="row"><h2>Edit checklist</h2><button class="secondary" data-check-back>Back</button></div><p class="help">Preview settings apply during this session.</p><form id="check-edit"><label>Tile title<input name="title" value="${esc(current.title)}" maxlength="45" required></label><label>Checklist name<input name="fullTitle" value="${esc(current.fullTitle)}" maxlength="140" required></label><div class="columns"><label>Frequency<select name="frequency">${frequencies.map(f=>`<option ${f===current.frequency?'selected':''}>${f}</option>`).join('')}</select></label><label>Assigned role<select name="owner">${owners.map(o=>`<option ${o===current.owner?'selected':''}>${o}</option>`).join('')}</select></label></div><fieldset class="check-sites"><legend>Assign to sites</legend><label><input type="checkbox" name="allSites" ${!current.sites.length?'checked':''}> All sites</label>${context.sites.map(s=>`<label><input type="checkbox" name="sites" value="${esc(s.id)}" ${current.sites.includes(s.id)?'checked':''}> ${esc(s.name)}</label>`).join('')}</fieldset><p class="error" id="check-edit-error" role="status"></p><button>Save preview settings</button></form></section>`;
   body.querySelector<HTMLFormElement>('#check-edit')!.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target as HTMLFormElement);const title=String(f.get('title')).trim(),fullTitle=String(f.get('fullTitle')).trim(),sites=f.has('allSites')?[]:f.getAll('sites').map(String);if(!title||!fullTitle||(!f.has('allSites')&&!sites.length)){body.querySelector('#check-edit-error')!.textContent='Add a title and checklist name, and choose at least one site.';return;}Object.assign(current,{title,fullTitle,frequency:String(f.get('frequency')),owner:String(f.get('owner')),sites});selected='';editing=false;redraw();});
  }else{body.innerHTML=`<section class="card check-detail"><div class="row"><h2>${esc(current.fullTitle)}</h2><button class="secondary" data-check-back>Back</button></div><div class="check-meta"><span class="pill">${esc(current.frequency)}</span><span>${esc(current.owner)}</span></div>${current.id==='check-3'?'<p class="help">Record each near miss or dispensing error in Reports. This checklist will review the log.</p><button id="check-report">Open Reports</button>':''}${admin?`<details class="check-basis"><summary>Schedule details</summary><p>Basis: ${esc(current.basis)}${current.basis.includes('local frequency')?' · Frequency is an editable starting default.':''}</p>${current.conditional?'<p>Enable only where this service is provided.</p>':''}</details>`:''}</section>`;body.querySelector('#check-report')?.addEventListener('click',context.report);renderChecklistForm(body.querySelector('.check-detail')!,current,context);}
 }else if(mode==='dashboard'){
  body.innerHTML=`<div id="check-dashboard-records"></div><section class="check-frequency-summary" aria-label="Enabled checklists by frequency">${frequencies.map(f=>`<button class="card" data-dashboard-frequency="${f}"><strong>${visible.filter(c=>c.frequency===f).length}</strong><span>${f}</span></button>`).join('')}</section>`;
 void renderChecklistDashboard(body.querySelector('#check-dashboard-records')!,context);
 }else{
  body.innerHTML=`${mode==='manage'?statusPanels('—','—','—')+'<p class="help">Edit, assign and enable checklists. Preview settings apply during this session.</p>':''}<div class="check-frequencies" role="group" aria-label="Checklist frequency">${frequencies.map(f=>`<button data-check-frequency="${f}" aria-pressed="${frequency===f}">${f}</button>`).join('')}</div><section class="report-tiles check-tiles" aria-label="${esc(frequency)} checklists">${(mode==='manage'?checks:visible).filter(c=>c.frequency===frequency).map(c=>`<article class="check-card ${!c.enabled?'check-disabled':''}"><button class="report-tile" data-check-open="${c.id}"><span class="report-tile-icon">${tileIcon(c)}</span><strong class="check-tile-title">${lines(c.title)}</strong><span>${esc(c.frequency)}<br>${esc(c.owner)}</span></button>${mode==='manage'?`<div class="check-card-controls"><button class="secondary" data-check-edit="${c.id}">Edit & assign</button><button class="check-toggle" data-check-toggle="${c.id}" role="switch" aria-checked="${c.enabled}" aria-label="Enable ${esc(c.fullTitle)}"><span></span></button><small>${c.enabled?'Enabled':'Disabled'}</small></div>`:''}</article>`).join('')||'<p class="muted">No checklists assigned for this frequency.</p>'}</section>`;
 }
 host.querySelectorAll<HTMLElement>('[data-check-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.checkMode!;selected='';redraw();});
 host.querySelectorAll<HTMLElement>('[data-check-frequency]').forEach(b=>b.onclick=()=>{frequency=b.dataset.checkFrequency!;redraw();});
 host.querySelectorAll<HTMLElement>('[data-dashboard-frequency]').forEach(b=>b.onclick=()=>{frequency=b.dataset.dashboardFrequency!;mode='checks';redraw();});
 host.querySelectorAll<HTMLElement>('[data-check-open]').forEach(b=>b.onclick=()=>{selected=b.dataset.checkOpen!;editing=false;redraw();});
 host.querySelectorAll<HTMLElement>('[data-check-edit]').forEach(b=>b.onclick=()=>{selected=b.dataset.checkEdit!;editing=true;redraw();});
 host.querySelectorAll<HTMLElement>('[data-check-toggle]').forEach(b=>b.onclick=()=>{const c=checks.find(c=>c.id===b.dataset.checkToggle)!;c.enabled=!c.enabled;redraw();});
 host.querySelector('[data-check-back]')?.addEventListener('click',()=>{selected='';editing=false;redraw();});
}
