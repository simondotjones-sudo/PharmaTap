import {statusPanels} from './status-panels';
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function renderChecklistDashboard(host:Element,context:{siteId:string;api:(path:string,options?:RequestInit)=>Promise<any>}){
 host.innerHTML='<p>Loading check records…</p>';
 try{const {records}=await context.api('/checklists?pharmacyId='+encodeURIComponent(context.siteId));if(!host.isConnected)return;
  const attention=records.filter((r:any)=>r.failures>0).length;
  host.innerHTML=statusPanels(records.length-attention,attention,'—')+`<p class="help">Latest ${records.length} completions. Needs attention means at least one No answer. Critical severity is not assessed.</p>`+(records.length?`<section class="card"><h2>Recent completions</h2>${records.map((r:any)=>`<div class="check-saved"><strong>${esc(r.title)}</strong><p>${esc(new Date(r.created_at).toLocaleString('en-IE'))} · ${esc(r.completed_by)}<br>${r.failures?esc(r.failures)+' No answer'+(r.failures===1?'':'s'):'All Yes'}</p></div>`).join('')}</section>`:'<section class="card"><h2>No check records yet</h2><p>Completed checklists will appear here.</p></section>');
 }catch(e){if(host.isConnected){host.innerHTML='<p class="error">'+esc((e as Error).message)+'</p><button class="secondary" data-retry-dashboard>Retry</button>';host.querySelector('[data-retry-dashboard]')?.addEventListener('click',()=>void renderChecklistDashboard(host,context));}}
}
