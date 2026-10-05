import { login,logout,getUser,handleAuthCallback,acceptInvite,updateUser,requestPasswordRecovery } from '@netlify/identity';
import {reportTypes,type ReportType} from './report-types';
import {prepareReportPhoto} from './report-photo';
const root=document.querySelector<HTMLElement>('#workspace')!,account=document.querySelector<HTMLElement>('#account')!;
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let userId='',organisations:any[]=[],organisationId='',pharmacies:any[]=[],pharmacyId='',data:any={reports:[],reviewers:[],role:'staff'},tab='home',viewRole='',profileOpen=false;
let reportMode='report',selectedReportType='Near miss';
let menuOpen=false,askOpen=false,screen='list',recordId='',navChoice='home';
const pageHistory:{tab:string,screen:string,recordId:string,reportMode:string,reportType:string}[]=[];
let askMessages:{question:string,answer:string}[]=[];
let retry:{key:string,body:any}|null=null;
function message(text:string){const el=document.querySelector('#message')!;el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),6000);}
async function api(path:string,options:RequestInit={}){
 const response=await fetch('/api/workspace'+path,{credentials:'same-origin',cache:'no-store',...options,headers:{...(viewRole?{'X-PharmaTap-Role':viewRole}:{}),...options.headers}});
 let result;try{result=await response.json();}catch{throw new Error('The workspace service is unavailable. Please try again.');}
 if(!response.ok){if(response.status===401){pharmacies=[];data={reports:[],reviewers:[],role:'staff'};retry=null;signIn();}throw new Error(result.error||'Unable to complete the request.');}return result;
}
const stamp=(v:string)=>new Date(v).toLocaleString('en-IE',{dateStyle:'medium',timeStyle:'short'});
const local=(d:Date)=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
function signIn(error=''){
 account.innerHTML='';document.querySelector('#navigation-root')?.remove();document.querySelector('#overlay-root')?.remove();menuOpen=false;askOpen=false;askMessages=[];pageHistory.length=0;screen='list';root.innerHTML=`<section class="card login"><h1>Sign in</h1><p class="muted">Your pharmacy workspace.</p><form id="login"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p class="error" id="login-error">${escape(error)}</p><button>Sign in</button> <button type="button" id="forgot" class="secondary">Reset password</button><div class="toolbar"><button type="button" id="accept-invitation" class="secondary">Accept invitation</button></div></form></section>`;
 document.querySelector('#login')!.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target as HTMLFormElement,button=form.querySelector('button')!;button.disabled=true;
  try{const f=new FormData(form);await login(String(f.get('email')),String(f.get('password')));form.reset();await start();}catch(e){document.querySelector('#login-error')!.textContent=(e as Error).message;}finally{button.disabled=false;}
 });
 document.querySelector('#accept-invitation')!.addEventListener('click',invitationForm);
 document.querySelector('#forgot')!.addEventListener('click',async()=>{const email=(document.querySelector('[name=email]') as HTMLInputElement);if(!email.reportValidity()||!email.value)return;try{await requestPasswordRecovery(email.value);message('If an account exists, check your email for the reset link.');}catch{message('Password reset is unavailable. Please contact your administrator.');}});
}
function invitationForm(){
 root.innerHTML='<section class="card login"><h1>Accept invitation</h1><p class="help">Paste the link from your invitation email to activate your account in this preview.</p><form id="invitation"><label>Invitation link<input name="link" type="url" autocomplete="off" required></label><label>New password<input name="password" type="password" autocomplete="new-password" minlength="12" required></label><p class="error" id="invitation-error"></p><button>Activate account</button> <button class="secondary" id="invitation-back" type="button">Back</button></form></section>';
 document.querySelector('#invitation-back')!.addEventListener('click',()=>signIn());
 document.querySelector('#invitation')!.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target as HTMLFormElement,button=form.querySelector('button')!;button.disabled=true;
  try{const f=new FormData(form),link=new URL(String(f.get('link')));const token=new URLSearchParams(link.hash.slice(1)).get('invite_token');if(!token)throw new Error('Use the complete invitation link from your email.');await acceptInvite(token,String(f.get('password')));form.reset();await start();}catch(e){document.querySelector('#invitation-error')!.textContent=(e as Error).message;}finally{button.disabled=false;}
 });
}
async function start(){
 const user=await getUser();if(!user){signIn();return;}userId=user.id;
 await api('/initialise',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
 const result=await api('/session');pharmacies=result.pharmacies;organisations=(result.organisations||[]).filter((o:any)=>pharmacies.some(p=>p.organisation_id===o.id));if(!organisations.length)organisations=[...new Map(pharmacies.map(p=>[p.organisation_id,{id:p.organisation_id,name:p.organisation_name,role:p.role}])).values()];
 account.innerHTML='<button id="profile-trigger" class="avatar" aria-label="Profile" aria-expanded="false" aria-controls="profile-panel">'+escape((user.name||'Simon').split(' ').map((n:string)=>n[0]).join('').slice(0,2))+'</button>';
 if(!pharmacies.length){root.innerHTML=`<section class="card"><h1>Access pending</h1><p>Your administrator needs to assign your pharmacy and role before you can use the workspace.</p><p class="help">Account reference: <code>${escape(userId)}</code></p></section>`;return;}
 if(!organisations.some(o=>o.id===organisationId))organisationId=organisations[0].id;
 if(!pharmacies.some(p=>p.id===pharmacyId&&p.organisation_id===organisationId))pharmacyId=pharmacies.find(p=>p.organisation_id===organisationId)!.id;
 await refresh();
}
async function refresh(){data=await api('/reports?pharmacyId='+encodeURIComponent(pharmacyId));screen='list';render();}
const APP_VERSION='1.05.10.26.7';
const roleLabel=(role:string)=>({'staff':'Staff','manager':'Pharmacist','superintendent':'Organisation admin'}[role]||role);
function render(){
 const site=pharmacies.find(p=>p.id===pharmacyId),organisation=organisations.find(o=>o.id===organisationId),accessibleSites=pharmacies.filter(p=>p.organisation_id===organisationId);
 const roles=site.role==='superintendent'?['superintendent','manager','staff']:site.role==='manager'?['manager','staff']:['staff'];
 const open=data.reports.filter((r:any)=>r.status!=='Closed'),overdue=open.filter((r:any)=>Date.parse(r.due_at)<Date.now());
 document.querySelector('#action-bell')?.remove();
 const count=open.filter((r:any)=>r.owner_id===userId).length;
 account.insertAdjacentHTML('afterbegin',`<button id="action-bell" class="topbar-bell" aria-label="My Actions${count?', '+count+' outstanding actions':''}" title="My Actions">${icon('bell')}${count?`<span class="action-count" aria-hidden="true">${count>99?'99+':count}</span>`:''}</button>`);
 const trigger=document.querySelector('#profile-trigger');trigger?.setAttribute('aria-expanded',String(profileOpen));
 document.querySelector('#profile-panel')?.remove();
 account.insertAdjacentHTML('beforeend',`<section id="profile-panel" class="profile-panel" ${profileOpen?'':'hidden'} aria-label="Profile settings"><h2>${escape(site.display_name)}</h2><label>Organisation<select id="organisation">${organisations.map(o=>`<option value="${escape(o.id)}" ${o.id===organisationId?'selected':''}>${escape(o.name)}</option>`).join('')}</select></label><label>Site<select id="pharmacy">${accessibleSites.map(p=>`<option value="${escape(p.id)}" ${p.id===pharmacyId?'selected':''}>${escape(p.name)}</option>`).join('')}</select></label><label>Role<select id="role">${roles.map(r=>`<option value="${r}" ${r===(viewRole||site.role)?'selected':''}>${roleLabel(r)}</option>`).join('')}</select></label><button id="logout" class="secondary">Sign out</button><small class="profile-version">PharmaTap Version ${APP_VERSION}</small></section>`);
 root.innerHTML=`${['home','reports'].includes(tab)?'':`<div class="site-context"><span>${escape(organisation.name)} · ${escape(site.name)}</span><small>${escape(roleLabel(data.role))}</small></div>`}${!['reports','actions'].includes(tab)?'':`<h1>${tab==='actions'?'My Actions':'Reports'}</h1>${tab==='reports'&&screen==='list'&&data.role!=='staff'?`<div class="report-switch" role="group" aria-label="Reports view"><button data-report-mode="report" aria-pressed="${reportMode==='report'}">Report</button><button data-report-mode="view" aria-pressed="${reportMode==='view'}">View reports</button></div>`:''}${tab==='actions'||(reportMode==='view'&&data.role!=='staff')?`<div class="toolbar"><button id="refresh" class="secondary">Refresh</button>${data.role!=='staff'?'<button id="export" class="secondary">Export records</button>':''}</div><div class="summary"><span><strong>${data.reports.length}</strong>reports</span><span><strong>${open.length}</strong>open</span><span><strong>${overdue.length}</strong>overdue</span></div>`:''}`}<section id="content"></section>`;
 const content=document.querySelector('#content')!;
 const records=tab==='actions'?data.reports.filter((r:any)=>r.owner_id===userId&&r.status!=='Closed'):data.reports;
 content.innerHTML=records.map((r:any)=>`<article class="card"><div class="row"><div><small>${escape(r.type)} · ${escape(stamp(r.created_at))}</small><h2>${escape(r.title)}</h2></div><span class="pill ${r.status!=='Closed'&&Date.parse(r.due_at)<Date.now()?'overdue':''}">${escape(r.status)}</span></div><p class="muted">Reviewer: ${escape(r.owner_name)} · Due ${escape(stamp(r.due_at))}</p><button class="secondary" data-record="${escape(r.id)}">View report</button></article>`).join('')||'<section class="card"><h2>All clear</h2><p>No records in this view.</p></section>';
 document.querySelector('#organisation')!.addEventListener('change',async e=>{organisationId=(e.target as HTMLSelectElement).value;await switchSite(pharmacies.find(p=>p.organisation_id===organisationId)!.id);});
 document.querySelector('#pharmacy')!.addEventListener('change',async e=>{await switchSite((e.target as HTMLSelectElement).value);});
 document.querySelector('#role')!.addEventListener('change',async e=>{viewRole=(e.target as HTMLSelectElement).value;retry=null;try{await refresh();}catch(e){message((e as Error).message);}});
 document.querySelector('#logout')!.addEventListener('click',async()=>{try{await logout();}finally{data={reports:[],reviewers:[],role:'staff'};retry=null;pharmacies=[];userId='';viewRole='';profileOpen=false;tab='home';signIn();}});
 document.querySelectorAll<HTMLElement>('[data-report-mode]').forEach(el=>el.addEventListener('click',()=>{reportMode=el.dataset.reportMode!;screen='list';render();}));
 document.querySelector('#refresh')?.addEventListener('click',()=>refresh().catch(e=>message(e.message)));
 document.querySelector('#export')?.addEventListener('click',async()=>{try{const result=await api('/export?pharmacyId='+pharmacyId);const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='PharmaTap-records-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);message(`${result.reportCount} reports exported with their audit history.`);}catch(e){message((e as Error).message);}});
 if(tab==='home'){
  const icons=['M12 5v14M5 12h14','M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4zM12 6v16','M5 3h14v18H5zM8 11l2 2 5-5','M14 6a5 5 0 0 0-6 6L3 17l4 4 5-5a5 5 0 0 0 6-6l-4 4-4-4z','M5 5h14M5 12h14M5 19h14','M3 8l9-5 9 5-9 5zM6 10v7l6 4 6-4v-7'];
  content.innerHTML='<h1 class="sr-only">Home</h1><section class="home-tasks" aria-label="Pharmacy tasks">'+[['Report','Medication errors|and near misses','report'],['SOPs','Find and read|procedures','sops'],['Checks','Record daily|pharmacy checks','checks'],['Faults','Equipment or|premises issues','faults'],['Actions','View tasks and|due dates','actions'],['Training','Courses and|SOP updates','training']].map(([title,description,target],i)=>`<button class="home-task" data-task="${target}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[i]}"/></svg><strong>${title}</strong><span>${description.split('|').map(escape).join('<br>')}</span></button>`).join('')+'</section>';
  document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('click',()=>{const task=(el as HTMLElement).dataset.task!;if(['sops','checks','training'].includes(task)){message('This module is awaiting implementation.');return;}navigate(task==='actions'?'actions':'reports');if(task==='faults')newReport(true,'Maintenance');}));
 }
 if(!['home','reports','actions'].includes(tab)){const titles:Record<string,string>={sops:'SOP Library',checks:'Checks',maintenance:'Maintenance',learning:'Learning',recalls:'Recalls',inspections:'Inspections'};content.innerHTML=tab==='maintenance'?'<section class="card"><h2>Maintenance</h2><p>Record equipment or premises issues and assign a reviewer.</p><button id="maintenance-report">Report a fault</button></section>':`<section class="card"><h2>${titles[tab]}</h2><p>This module is awaiting implementation.</p></section>`;document.querySelector('#maintenance-report')?.addEventListener('click',()=>{navigate('reports');newReport(true,'Maintenance');});}
 if(tab==='reports'&&(reportMode==='report'||data.role==='staff'))reportTiles();
 renderNavigation();
 document.querySelectorAll('[data-record]').forEach(el=>el.addEventListener('click',()=>viewReport((el as HTMLElement).dataset.record!)));
}
async function switchSite(id:string){
 pharmacyId=id;const site=pharmacies.find(p=>p.id===id);organisationId=site.organisation_id;
 if(viewRole&&(['staff','manager','superintendent'].indexOf(viewRole)>['staff','manager','superintendent'].indexOf(site.role)))viewRole='';
 retry=null;pageHistory.length=0;askMessages=[];menuOpen=false;askOpen=false;screen='list';reportMode='report';closeProfile();document.querySelector('#navigation-root')?.remove();document.querySelector('#overlay-root')?.remove();data={reports:[],reviewers:[],role:'staff'};root.innerHTML='<p>Opening site…</p>';
 try{await refresh();}catch(e){root.innerHTML='<p>Could not open this site. Reload to try again.</p>';message((e as Error).message);}
}
const paths:Record<string,string>={back:'M19 12H5 M10 7l-5 5 5 5',home:'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',menu:'M4 6h16 M4 12h16 M4 18h16',spark:'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',bell:'M5 17h14l-2-3V8a5 5 0 0 0-10 0v6z M10 21h4',close:'M6 6l12 12 M18 6L6 18',prescription:'M8 4H5v17h14V4h-3 M8 2h8v5H8z M8 11h8 M8 15h5',medicine:'M8 3a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5z M3 12h10 M17 8h4 M17 12h4 M17 16h4',shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',refusal:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M6 6l12 12',warning:'M12 3L2 21h20z M12 9v5 M12 17v1',injury:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',wrench:'M14 6a5 5 0 0 0-6 6L3 17l4 4 5-5a5 5 0 0 0 6-6l-4 4-4-4z',security:'M6 10V8a6 6 0 0 1 12 0v2 M4 10h16v11H4z M12 14v3',complaint:'M3 4h18v13H8l-5 4z M7 8h10 M7 12h6',quality:'M5 3h14v18H5z M8 8h8 M12 12v3 M12 17v1',other:'M5 3h10l4 4v14H5z M15 3v5h4 M8 14h8 M12 10v8'};
function icon(name:string){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;}
function remember(){pageHistory.push({tab,screen,recordId,reportMode,reportType:selectedReportType});}
function closeProfile(){profileOpen=false;document.querySelector('#profile-panel')?.setAttribute('hidden','');document.querySelector('#profile-trigger')?.setAttribute('aria-expanded','false');}
function navigate(to:string){
 if(to!==tab||screen!=='list')remember();tab=to;reportMode='report';screen='list';menuOpen=false;askOpen=false;closeProfile();navChoice=to==='home'?'home':'menu';render();window.scrollTo({top:0,behavior:'instant'});
}
function goBack(){
 if(askOpen||menuOpen){askOpen=false;menuOpen=false;renderNavigation();return;}
 const previous=pageHistory.pop();if(!previous)return;
 tab=previous.tab;recordId=previous.recordId;reportMode=previous.reportMode;selectedReportType=previous.reportType;screen='list';navChoice='back';closeProfile();render();
 if(previous.screen==='report')newReport(false,previous.reportType);else if(previous.screen==='detail')void viewReport(recordId,false);
}
function renderNavigation(){
 let nav=document.querySelector('#navigation-root');if(!nav){nav=document.createElement('div');nav.id='navigation-root';document.body.append(nav);}
 const selected=askOpen?'ask':menuOpen?'menu':navChoice,index=['back','home','menu','ask'].indexOf(selected);
 nav.innerHTML=`<nav class="mobile-navigation" aria-label="Quick navigation"><span class="nav-highlight" aria-hidden="true" style="transform:translateX(${index*100}%)"></span>${[['back','back','Back'],['home','home','Home'],['menu',menuOpen?'close':'menu','Menu'],['ask','spark','Ask']].map(([action,ic,label])=>`<button data-nav-action="${action}" class="${selected===action?'selected':''}" aria-label="${action==='ask'?'Ask PharmaTap':label}" ${action==='back'&&!pageHistory.length&&!menuOpen&&!askOpen?'disabled':''} ${['menu','ask'].includes(action)?`aria-expanded="${action==='menu'?menuOpen:askOpen}" aria-controls="${action==='menu'?'navigation-drawer':'ask-panel'}"`:''}>${icon(ic)}<span>${label}</span></button>`).join('')}</nav>`;
 let overlays=document.querySelector('#overlay-root');if(!overlays){overlays=document.createElement('div');overlays.id='overlay-root';document.body.append(overlays);}
 overlays.innerHTML=menuOpen?`<div class="navigation-shade" data-nav-action="dismiss"></div><aside id="navigation-drawer" class="navigation-drawer" aria-label="Main menu"><div class="row"><h2>Menu</h2><button data-nav-action="dismiss" class="icon-button" aria-label="Close menu">${icon('close')}</button></div>${organisations.find(o=>o.id===organisationId)?.name==='Stacks Pharmacies'?'<img class="client-logo" src="/assets/stacks-logo.png" alt="Stacks Pharmacy">':''}<nav aria-label="Main navigation">${[['actions','My Actions'],['reports','Reports'],['checks','Checks'],['maintenance','Maintenance'],['recalls','Recalls'],['sops','SOP Library'],['learning','Learning'],['inspections','Inspections']].map(([id,label])=>`<button data-page="${id}" ${tab===id?'aria-current="page"':''}>${label}</button>`).join('')}</nav></aside>`:askOpen?`<div class="navigation-shade" data-nav-action="dismiss"></div><section id="ask-panel" class="ask-panel" role="dialog" aria-modal="true" aria-labelledby="ask-title"><div class="row"><h2 id="ask-title">${icon('spark')} Ask PharmaTap</h2><button data-nav-action="dismiss" class="icon-button" aria-label="Close Ask PharmaTap">${icon('close')}</button></div><div class="ask-messages">${askMessages.map(m=>`<p class="ask-question">${escape(m.question)}</p><p class="ask-answer">${escape(m.answer)}</p>`).join('')}</div><div class="ask-suggestions"><button data-ask="What needs attention?">What needs attention?</button><button data-page="reports">View reports</button><button data-assistant-report>Record a near miss</button></div><form id="ask-form"><label class="sr-only" for="ask-input">Ask PharmaTap</label><textarea id="ask-input" name="question" rows="2" placeholder="Ask PharmaTap…" required maxlength="1000"></textarea><button>Send</button></form></section>`:'';
 if(askOpen){document.querySelector('#ask-form')!.addEventListener('submit',e=>{e.preventDefault();answerQuestion(String(new FormData(e.target as HTMLFormElement).get('question')));});document.querySelector('#ask-input')!.addEventListener('keydown',e=>{const key=e as KeyboardEvent;if(key.key==='Enter'&&!key.shiftKey){key.preventDefault();(document.querySelector('#ask-form') as HTMLFormElement).requestSubmit();}});}
}
function answerQuestion(question:string){
 const q=question.trim();if(!q)return;const mine=data.reports.filter((r:any)=>r.owner_id===userId&&r.status!=='Closed'),overdue=mine.filter((r:any)=>Date.parse(r.due_at)<Date.now());
 const answer=/attention|action|due|overdue|task/i.test(q)?`You have ${mine.length} open actions at ${pharmacies.find(p=>p.id===pharmacyId).name}, including ${overdue.length} overdue. Open My Actions to review them.`:/report|near miss|error|fault|maintenance/i.test(q)?`There are ${data.reports.length} reports visible in your current site and role. Use View reports or Record a near miss below to continue.`:/sop|procedure|training|check/i.test(q)?'This module is awaiting implementation. Approved procedures have not been loaded into this workspace yet.':'I can show your current reports, outstanding actions and deadlines, or help you open a report. Wider knowledge search is awaiting implementation.';
 askMessages.push({question:q,answer});renderNavigation();document.querySelector<HTMLTextAreaElement>('#ask-input')?.focus();
}
document.addEventListener('click',e=>{
 const target=e.target as Element;
 if(target.closest('#profile-trigger')){if(!pharmacies.length)return;profileOpen=!profileOpen;document.querySelector('#profile-panel')?.toggleAttribute('hidden',!profileOpen);target.closest('#profile-trigger')?.setAttribute('aria-expanded',String(profileOpen));menuOpen=false;askOpen=false;renderNavigation();return;}
 if(profileOpen&&!target.closest('#account'))closeProfile();
 if(target.closest('#action-bell')){navigate('actions');return;}
 if(target.closest('.brand')&&pharmacies.length){e.preventDefault();navigate('home');return;}
 const action=target.closest<HTMLElement>('[data-nav-action]')?.dataset.navAction;
 if(action){if(action==='back')goBack();else if(action==='home')navigate('home');else{closeProfile();menuOpen=action==='menu'?!menuOpen:false;askOpen=action==='ask'?!askOpen:false;renderNavigation();if(askOpen)document.querySelector<HTMLTextAreaElement>('#ask-input')?.focus();else if(menuOpen)document.querySelector<HTMLButtonElement>('#navigation-drawer button')?.focus();}return;}
 const page=target.closest<HTMLElement>('[data-page]')?.dataset.page;if(page){navigate(page);if(target.textContent==='View reports'&&data.role!=='staff'){reportMode='view';render();}return;}
 const question=target.closest<HTMLElement>('[data-ask]')?.dataset.ask;if(question){answerQuestion(question);return;}
 if(target.closest('[data-assistant-report]')){navigate('reports');newReport();}
});
document.addEventListener('keydown',e=>{if(e.key==='Tab'&&(menuOpen||askOpen)){const panel=document.querySelector(askOpen?'#ask-panel':'#navigation-drawer'),items=panel?.querySelectorAll<HTMLElement>('button,textarea,select,input,a[href]');if(items?.length){const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}if(e.key==='Escape'){if(profileOpen){closeProfile();document.querySelector<HTMLButtonElement>('#profile-trigger')?.focus();}else if(menuOpen||askOpen){const action=askOpen?'ask':'menu';menuOpen=false;askOpen=false;renderNavigation();document.querySelector<HTMLButtonElement>(`[data-nav-action=${action}]`)?.focus();}}});
const reportTileTitles:Record<string,[string,string]>={
 'Prescription error':['Prescription','error'],'Medication error':['Medication','error'],
 'Near miss':['Near','miss'],'Refusal of supply':['Refusal of','supply'],
 'Safety concern':['Safety','concern'],'Accident or injury':['Accident','or injury'],
 'Security incident':['Security','incident'],'Complaint':['Customer','complaint'],
 'Medicine quality issue':['Medicine','quality'],'Other':['Other','event']
};
function hideReportContext(){document.querySelector('.site-context')?.remove();document.querySelector('.report-switch')?.remove();}
function reportTiles(){
 document.querySelector('#content')!.innerHTML=`<section class="report-tiles" aria-label="Choose a report type">${reportTypes.map((t,i)=>t.type==='Maintenance'?'':`<button class="report-tile" data-report-type="${escape(t.type)}"><span class="report-tile-icon" aria-hidden="true">${icon(['prescription','medicine','shield','refusal','warning','injury','wrench','security','complaint','quality','other'][i])}</span><strong class="report-tile-title">${reportTileTitles[t.type].map(line=>`<span>${escape(line)}</span>`).join(' ')}</strong><span>${t.type==='Refusal of supply'?t.subtitle.split(', ').map(escape).join('<br>'):t.type==='Medicine quality issue'?['Stock defects or','storage issues'].map(escape).join('<br>'):escape(t.subtitle)}</span></button>`).join('')}</section>`;
 document.querySelectorAll<HTMLElement>('[data-report-type]').forEach(el=>el.addEventListener('click',()=>newReport(true,el.dataset.reportType!)));
}
function reportField(field:ReportType['fields'][number]){
 if(field.options)return `<fieldset class="quick-choice"><legend>${escape(field.label)}</legend><div>${field.options.map(option=>`<label><input type="radio" name="${field.id}" value="${escape(option)}" required><span>${escape(option)}</span></label>`).join('')}</div></fieldset>`;
 return `<label>${escape(field.label)}<input name="${field.id}" maxlength="200" required autocomplete="off"></label>`;
}
function newReport(pushHistory=true,type='Near miss'){
 if(!data.reviewers.length){message('An active pharmacy reviewer must be assigned before reports can be submitted.');return;}
 const definition=reportTypes.find(t=>t.type===type);if(!definition)return;
 if(pushHistory)remember();selectedReportType=type;screen='report';reportMode='report';hideReportContext();renderNavigation();
 const occurred=local(new Date()),due=new Date(Date.now()+86400000).toISOString(),owner=data.reviewers[0].user_id;
 document.querySelector('#content')!.innerHTML=`<section class="card quick-report"><div class="row"><h2>${escape(definition.label)}</h2><button type="button" class="secondary" id="change-report">Change type</button></div><form id="report-form">${definition.fields.map(reportField).join('')}${type==='Maintenance'?`<section class="photo-capture" aria-label="Maintenance photo"><input id="maintenance-photo" type="file" accept="image/*" capture="environment" hidden><button type="button" class="secondary" id="snap-photo">Snap a photo</button><div id="photo-preview" hidden><img alt="Maintenance photo preview"><button type="button" class="secondary" id="remove-photo">Remove photo</button></div><p id="photo-status" role="status"></p></section>`:''}<p id="urgent-report" class="urgent-report" role="alert" hidden>Alert the pharmacist immediately. Submitting this report does not contact them or emergency services.</p><details class="report-more"><summary>Add more detail</summary><label><span id="notes-label">Notes (optional)</span><textarea name="note" maxlength="2000" rows="3" placeholder="Keep patient names and identifiers in your clinical system."></textarea></label><button type="button" class="secondary" id="dictate" hidden>Dictate note</button><p id="dictation-status" role="status"></p><label>Occurred<input type="datetime-local" name="occurred" value="${occurred}" required></label></details><p class="report-routing">Review assigned to ${escape(data.reviewers[0].display_name)}.</p><p id="save-status" role="status"></p><button id="submit-report">Submit report</button></form></section>`;
 document.querySelector('#change-report')!.addEventListener('click',()=>{retry=null;screen='list';render();});
 const form=document.querySelector<HTMLFormElement>('#report-form')!;
 let photo:string|undefined,photoBusy=false;
 if(type==='Maintenance'){
  const input=document.querySelector<HTMLInputElement>('#maintenance-photo')!,preview=document.querySelector<HTMLElement>('#photo-preview')!,status=document.querySelector('#photo-status')!,snap=document.querySelector<HTMLButtonElement>('#snap-photo')!,remove=document.querySelector<HTMLButtonElement>('#remove-photo')!;
  snap.addEventListener('click',()=>input.click());
  input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;photoBusy=true;snap.disabled=true;remove.disabled=true;form.querySelector<HTMLButtonElement>('#submit-report')!.disabled=true;status.textContent='Preparing photo…';try{photo=await prepareReportPhoto(file);preview.querySelector('img')!.src='data:image/jpeg;base64,'+photo;preview.hidden=false;snap.textContent='Retake photo';status.textContent='Photo ready.';}catch(e){status.textContent=(e as Error).message;}finally{input.value='';photoBusy=false;snap.disabled=false;remove.disabled=false;form.querySelector<HTMLButtonElement>('#submit-report')!.disabled=false;}});
  remove.addEventListener('click',()=>{photo=undefined;preview.hidden=true;preview.querySelector('img')!.removeAttribute('src');snap.textContent='Snap a photo';status.textContent='';});
 }

 form.addEventListener('change',()=>{const values=new FormData(form),urgent=values.get('harm');document.querySelector('#urgent-report')!.toggleAttribute('hidden',!urgent||urgent==='No');const other=definition.fields.some(f=>values.get(f.id)==='Other'),note=form.querySelector<HTMLTextAreaElement>('[name=note]')!;note.required=other;document.querySelector('#notes-label')!.textContent=other?'Brief detail':'Notes (optional)';if(other)form.querySelector<HTMLDetailsElement>('details')!.open=true;});
 const Recognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
 if(Recognition){const button=document.querySelector<HTMLButtonElement>('#dictate')!,status=document.querySelector('#dictation-status')!;button.hidden=false;button.addEventListener('click',()=>{const recognition=new Recognition();recognition.lang='en-IE';recognition.onresult=(event:any)=>{const note=form.querySelector<HTMLTextAreaElement>('[name=note]')!;note.value=(note.value+' '+event.results[0][0].transcript).trim().slice(0,2000);status.textContent='Check your note before submitting.';};recognition.onerror=()=>{status.textContent='Dictation unavailable. You can type your note.';};recognition.onend=()=>{button.disabled=false;};try{recognition.start();button.disabled=true;status.textContent='Listening…';}catch{status.textContent='Dictation unavailable. You can type your note.';}});}
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(photoBusy)return;const fields=new FormData(form),button=document.querySelector<HTMLButtonElement>('#submit-report')!,status=document.querySelector('#save-status')!;
  const answers=Object.fromEntries(definition.fields.map(f=>[f.id,String(fields.get(f.id)||'').trim()])),note=String(fields.get('note')||'');
  const body={pharmacyId,type,answers,note,occurredAt:new Date(String(fields.get('occurred'))).toISOString(),dueAt:due,ownerId:owner,...(photo?{photo}:{})};
  if(!retry||JSON.stringify(retry.body)!==JSON.stringify(body))retry={key:crypto.randomUUID(),body};
  button.disabled=true;status.textContent='Saving…';
  try{await api('/reports',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':retry.key},body:JSON.stringify(body)});retry=null;form.reset();screen='list';reportMode='report';render();message('Report saved.');try{await refresh();}catch{message('Report saved. Records will update when you reconnect.');}}catch(e){status.textContent=(e as Error).message+' Your draft remains here; retry when ready.';}finally{button.disabled=false;}
 });
 window.scrollTo({top:0,behavior:'instant'});
}
async function viewReport(id:string,pushHistory=true){
 const r=data.reports.find((r:any)=>r.id===id);if(!r)return;
 if(pushHistory)remember();screen='detail';recordId=id;hideReportContext();renderNavigation();
 document.querySelector('#content')!.innerHTML=`<article class="card"><small>${escape(r.type)} · Report ${escape(r.id)}</small><h2>${escape(r.title)}</h2><p class="detail">${escape(r.detail)}</p>${r.has_photo?'<section class="report-photo"><h3>Photo</h3><div id="saved-photo">Loading photo…</div></section>':''}<p>Occurred ${escape(stamp(r.occurred_at))}</p><p>Reviewer: ${escape(r.owner_name)} · ${escape(r.status)}</p>${r.resolution?`<h3>Review notes</h3><p class="detail">${escape(r.resolution)}</p>`:''}${data.role!=='staff'&&r.status!=='Closed'?`<form id="review-form"><label>Status<select name="status">${['Open','Awaiting review','Closed'].map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}</select></label><label>Review notes<textarea name="resolution" maxlength="4000">${escape(r.resolution)}</textarea></label><button>Save review</button></form>`:''}<div class="toolbar"><button class="secondary" id="back">Back</button></div><h3>History</h3><div id="history">Loading history…</div></article>`;
 if(r.has_photo)void loadReportPhoto(id);
 document.querySelector('#back')!.addEventListener('click',goBack);
 document.querySelector('#review-form')?.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target as HTMLFormElement,fields=new FormData(form),button=form.querySelector('button')!;button.disabled=true;
  try{await api('/actions/'+r.action_id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:r.version,status:fields.get('status'),resolution:fields.get('resolution')})});message('Review saved.');await refresh();}catch(e){message((e as Error).message);}finally{button.disabled=false;}
 });
 try{const events=await api('/reports/'+id+'/history');const el=document.querySelector('#history');if(el)el.innerHTML=events.map((a:any)=>`<p><strong>${escape(a.event)}</strong> · ${escape(stamp(a.created_at))}<br><small>Recorded by ${escape(a.actor_id)}</small></p>`).join('');}catch(e){const el=document.querySelector('#history');if(el)el.textContent=(e as Error).message;}
}
async function loadReportPhoto(id:string){
 const container=document.querySelector('#saved-photo');if(!container)return;
 try{const response=await fetch('/api/workspace/reports/'+encodeURIComponent(id)+'/photo',{credentials:'same-origin',cache:'no-store',headers:viewRole?{'X-PharmaTap-Role':viewRole}:{}});if(!response.ok)throw new Error('Unable to load photo.');const blob=await response.blob();if(!container.isConnected)return;const url=URL.createObjectURL(blob),img=new Image();img.alt='Maintenance report photo';img.onload=img.onerror=()=>URL.revokeObjectURL(url);img.src=url;container.replaceChildren(img);}catch{if(container.isConnected)container.textContent='Photo could not be loaded. Reopen the report to try again.';}
}
async function boot(){
 try{
  const callback=await handleAuthCallback();
  if(callback?.type==='invite'||callback?.type==='recovery'){
   root.innerHTML='<section class="card login"><h1>Set your password</h1><form id="password"><label>New password<input type="password" name="password" autocomplete="new-password" minlength="12" required></label><button>Save password</button><p id="password-error" class="error"></p></form></section>';
   document.querySelector('#password')!.addEventListener('submit',async e=>{e.preventDefault();const form=e.target as HTMLFormElement,button=form.querySelector('button')!;button.disabled=true;try{const password=String(new FormData(form).get('password'));if(callback.type==='invite')await acceptInvite(callback.token!,password);else await updateUser({password});form.reset();await start();}catch(e){document.querySelector('#password-error')!.textContent=(e as Error).message;}finally{button.disabled=false;}});return;
  }
  await start();
 }catch(e){signIn((e as Error).message);}
}
void boot();
