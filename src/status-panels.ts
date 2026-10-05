export function statusPanels(good:number|string,attention:number|string,critical:number|string){
 return `<section class="status-panels" aria-label="Status overview">${[[good,'No issues','good'],[attention,'Needs attention','attention'],[critical,'Critical','critical']].map(([n,label,tone])=>`<div class="status-panel status-${tone}"><strong>${n}</strong><span>${label}</span></div>`).join('')}</section>`;
}
