import { login,logout,getUser,handleAuthCallback,acceptInvite,updateUser,requestPasswordRecovery } from '@netlify/identity';
const root=document.querySelector<HTMLElement>('#workspace')!,account=document.querySelector<HTMLElement>('#account')!;
const escape=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let userId='',organisations:any[]=[],organisationId='',pharmacies:any[]=[],pharmacyId='',data:any={reports:[],reviewers:[],role:'staff'},tab='home',viewRole='',profileOpen=false;
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
 account.innerHTML='';root.innerHTML=`<section class="card login"><h1>Sign in</h1><p class="muted">Your pharmacy workspace.</p><form id="login"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p class="error" id="login-error">${escape(error)}</p><button>Sign in</button> <button type="button" id="forgot" class="secondary">Reset password</button><div class="toolbar"><button type="button" id="accept-invitation" class="secondary">Accept invitation</button></div></form></section>`;
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
async function refresh(){data=await api('/reports?pharmacyId='+encodeURIComponent(pharmacyId));render();}
const roleLabel=(role:string)=>({'staff':'Staff','manager':'Pharmacist','superintendent':'Organisation admin'}[role]||role);
function render(){
 const site=pharmacies.find(p=>p.id===pharmacyId),organisation=organisations.find(o=>o.id===organisationId),accessibleSites=pharmacies.filter(p=>p.organisation_id===organisationId);
 const roles=site.role==='superintendent'?['superintendent','manager','staff']:site.role==='manager'?['manager','staff']:['staff'];
 const open=data.reports.filter((r:any)=>r.status!=='Closed'),overdue=open.filter((r:any)=>Date.parse(r.due_at)<Date.now());
 const trigger=document.querySelector('#profile-trigger');trigger?.setAttribute('aria-expanded',String(profileOpen));
 document.querySelector('#profile-panel')?.remove();
 account.insertAdjacentHTML('beforeend',`<section id="profile-panel" class="profile-panel" ${profileOpen?'':'hidden'} aria-label="Profile settings"><h2>${escape(site.display_name)}</h2><label>Organisation<select id="organisation">${organisations.map(o=>`<option value="${escape(o.id)}" ${o.id===organisationId?'selected':''}>${escape(o.name)}</option>`).join('')}</select></label><label>Site<select id="pharmacy">${accessibleSites.map(p=>`<option value="${escape(p.id)}" ${p.id===pharmacyId?'selected':''}>${escape(p.name)}</option>`).join('')}</select></label><label>Role<select id="role">${roles.map(r=>`<option value="${r}" ${r===(viewRole||site.role)?'selected':''}>${roleLabel(r)}</option>`).join('')}</select></label><button id="logout" class="secondary">Sign out</button></section>`);
 root.innerHTML=`<div class="site-context"><span>${escape(organisation.name)} · ${escape(site.name)}</span><small>${escape(roleLabel(data.role))}</small></div><nav class="toolbar" aria-label="Workspace navigation"><button id="home" class="secondary" aria-pressed="${tab==='home'}">Home</button><button id="reports" class="secondary" aria-pressed="${tab==='reports'}">Reports</button><button id="actions" class="secondary" aria-pressed="${tab==='actions'}">My Actions (${open.filter((r:any)=>r.owner_id===userId).length})</button></nav>${tab==='home'?'':`<h1>${tab==='actions'?'My Actions':'Reports'}</h1><div class="toolbar"><button id="new">Report</button><button id="refresh" class="secondary">Refresh</button>${data.role!=='staff'?'<button id="export" class="secondary">Export records</button>':''}</div><div class="summary"><span><strong>${data.reports.length}</strong>reports</span><span><strong>${open.length}</strong>open</span><span><strong>${overdue.length}</strong>overdue</span></div>`}<section id="content"></section>`;
 const content=document.querySelector('#content')!;
 const records=tab==='actions'?data.reports.filter((r:any)=>r.owner_id===userId&&r.status!=='Closed'):data.reports;
 content.innerHTML=records.map((r:any)=>`<article class="card"><div class="row"><div><small>${escape(r.type)} · ${escape(stamp(r.created_at))}</small><h2>${escape(r.title)}</h2></div><span class="pill ${r.status!=='Closed'&&Date.parse(r.due_at)<Date.now()?'overdue':''}">${escape(r.status)}</span></div><p class="muted">Reviewer: ${escape(r.owner_name)} · Due ${escape(stamp(r.due_at))}</p><button class="secondary" data-record="${escape(r.id)}">View report</button></article>`).join('')||'<section class="card"><h2>All clear</h2><p>No records in this view.</p></section>';
 document.querySelector('#organisation')!.addEventListener('change',async e=>{organisationId=(e.target as HTMLSelectElement).value;await switchSite(pharmacies.find(p=>p.organisation_id===organisationId)!.id);});
 document.querySelector('#pharmacy')!.addEventListener('change',async e=>{await switchSite((e.target as HTMLSelectElement).value);});
 document.querySelector('#role')!.addEventListener('change',async e=>{viewRole=(e.target as HTMLSelectElement).value;retry=null;try{await refresh();}catch(e){message((e as Error).message);}});
 document.querySelector('#logout')!.addEventListener('click',async()=>{try{await logout();}finally{data={reports:[],reviewers:[],role:'staff'};retry=null;pharmacies=[];userId='';viewRole='';profileOpen=false;tab='home';signIn();}});
 for(const name of ['home','reports','actions'])document.querySelector('#'+name)!.addEventListener('click',()=>{tab=name;render();});
 document.querySelector('#new')?.addEventListener('click',newReport);
 document.querySelector('#refresh')?.addEventListener('click',()=>refresh().catch(e=>message(e.message)));
 document.querySelector('#export')?.addEventListener('click',async()=>{try{const result=await api('/export?pharmacyId='+pharmacyId);const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='PharmaTap-records-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);message(`${result.reportCount} reports exported with their audit history.`);}catch(e){message((e as Error).message);}});
 if(tab==='home'){
  const icons=['M12 5v14M5 12h14','M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4zM12 6v16','M5 3h14v18H5zM8 11l2 2 5-5','M14 6a5 5 0 0 0-6 6L3 17l4 4 5-5a5 5 0 0 0 6-6l-4 4-4-4z','M5 5h14M5 12h14M5 19h14','M3 8l9-5 9 5-9 5zM6 10v7l6 4 6-4v-7'];
  content.innerHTML='<h1 class="sr-only">Home</h1><section class="home-tasks" aria-label="Pharmacy tasks">'+[['Report','Medication errors and near misses','report'],['SOPs','Find and read procedures','sops'],['Checks','Record daily checks','checks'],['Faults','Equipment or premises issues','faults'],['Actions','View tasks and due dates','actions'],['Training','Courses and SOP updates','training']].map(([title,description,target],i)=>`<button class="home-task" data-task="${target}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[i]}"/></svg><strong>${title}</strong><span>${description}</span>${['sops','checks','training'].includes(target)?'<small>Coming soon</small>':''}</button>`).join('')+'</section>';
  document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('click',()=>{const task=(el as HTMLElement).dataset.task!;if(['sops','checks','training'].includes(task)){message('This module is awaiting implementation.');return;}tab=task==='actions'?'actions':'reports';profileOpen=false;render();if(task==='report'||task==='faults'){newReport();if(task==='faults'){const type=document.querySelector<HTMLSelectElement>('[name=type]');if(type)type.value='Maintenance';}}}));
 }
 document.querySelectorAll('[data-record]').forEach(el=>el.addEventListener('click',()=>viewReport((el as HTMLElement).dataset.record!)));
}
async function switchSite(id:string){
 pharmacyId=id;const site=pharmacies.find(p=>p.id===id);organisationId=site.organisation_id;
 if(viewRole&&(['staff','manager','superintendent'].indexOf(viewRole)>['staff','manager','superintendent'].indexOf(site.role)))viewRole='';
 retry=null;data={reports:[],reviewers:[],role:'staff'};root.innerHTML='<p>Opening site…</p>';
 try{await refresh();}catch(e){root.innerHTML='<p>Could not open this site. Reload to try again.</p>';message((e as Error).message);}
}
document.addEventListener('click',e=>{const target=e.target as Element;if(target.closest('#profile-trigger')){profileOpen=!profileOpen;render();}else if(profileOpen&&!target.closest('#account')){profileOpen=false;render();}if(target.closest('.brand')&&pharmacies.length){e.preventDefault();tab='home';profileOpen=false;render();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&profileOpen){profileOpen=false;render();document.querySelector<HTMLButtonElement>('#profile-trigger')?.focus();}});
function newReport(){
 if(!data.reviewers.length){message('An active pharmacy reviewer must be assigned before reports can be submitted.');return;}
 const now=local(new Date()),tomorrow=local(new Date(Date.now()+86400000));
 document.querySelector('#content')!.innerHTML=`<section class="card"><h2>Report</h2><p class="help">Record the operational issue. Keep patient names, prescription identifiers and other patient details in your designated clinical system.</p><form id="report-form"><div class="columns"><label>Type<select name="type">${['Near miss','Medication error','Complaint','Safety concern','Maintenance'].map(t=>`<option>${t}</option>`).join('')}</select></label><label>Occurred<input type="datetime-local" name="occurred" value="${now}" required></label></div><label>Title<input name="title" minlength="3" maxlength="160" required></label><label>What happened?<textarea name="detail" minlength="10" maxlength="4000" required></textarea></label><div class="columns"><label>Reviewer<select name="owner">${data.reviewers.map((r:any)=>`<option value="${escape(r.user_id)}">${escape(r.display_name)}</option>`).join('')}</select></label><label>Review deadline<input type="datetime-local" name="due" value="${tomorrow}" required></label></div><p id="save-status" role="status"></p><button id="submit-report">Submit report</button> <button class="secondary" type="button" id="cancel">Cancel</button></form></section>`;
 document.querySelector('#cancel')!.addEventListener('click',()=>{retry=null;render();});
 document.querySelector('#report-form')!.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target as HTMLFormElement,fields=new FormData(form),button=document.querySelector<HTMLButtonElement>('#submit-report')!,status=document.querySelector('#save-status')!;
  const body={pharmacyId,type:fields.get('type'),title:fields.get('title'),detail:fields.get('detail'),occurredAt:new Date(String(fields.get('occurred'))).toISOString(),dueAt:new Date(String(fields.get('due'))).toISOString(),ownerId:fields.get('owner')};
  if(!retry||JSON.stringify(retry.body)!==JSON.stringify(body))retry={key:crypto.randomUUID(),body};
  button.disabled=true;status.textContent='Saving…';
  try{await api('/reports',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':retry.key},body:JSON.stringify(body)});retry=null;status.textContent='Saved. Your reviewer has an action.';form.reset();message('Report saved. Review action created.');try{await refresh();}catch{status.textContent='Report saved. Refresh the page to view it.';}}catch(e){status.textContent=(e as Error).message+' Your draft remains here; retry when ready.';}finally{button.disabled=false;}
 });
}
async function viewReport(id:string){
 const r=data.reports.find((r:any)=>r.id===id);if(!r)return;
 document.querySelector('#content')!.innerHTML=`<article class="card"><small>${escape(r.type)} · Report ${escape(r.id)}</small><h2>${escape(r.title)}</h2><p class="detail">${escape(r.detail)}</p><p>Occurred ${escape(stamp(r.occurred_at))}</p><p>Reviewer: ${escape(r.owner_name)} · ${escape(r.status)}</p>${r.resolution?`<h3>Review notes</h3><p class="detail">${escape(r.resolution)}</p>`:''}${data.role!=='staff'&&r.status!=='Closed'?`<form id="review-form"><label>Status<select name="status">${['Open','Awaiting review','Closed'].map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}</select></label><label>Review notes<textarea name="resolution" maxlength="4000">${escape(r.resolution)}</textarea></label><button>Save review</button></form>`:''}<div class="toolbar"><button class="secondary" id="back">Back</button></div><h3>History</h3><div id="history">Loading history…</div></article>`;
 document.querySelector('#back')!.addEventListener('click',render);
 document.querySelector('#review-form')?.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target as HTMLFormElement,fields=new FormData(form),button=form.querySelector('button')!;button.disabled=true;
  try{await api('/actions/'+r.action_id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:r.version,status:fields.get('status'),resolution:fields.get('resolution')})});message('Review saved.');await refresh();}catch(e){message((e as Error).message);}finally{button.disabled=false;}
 });
 try{const events=await api('/reports/'+id+'/history');const el=document.querySelector('#history');if(el)el.innerHTML=events.map((a:any)=>`<p><strong>${escape(a.event)}</strong> · ${escape(stamp(a.created_at))}<br><small>Recorded by ${escape(a.actor_id)}</small></p>`).join('');}catch(e){const el=document.querySelector('#history');if(el)el.textContent=(e as Error).message;}
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
