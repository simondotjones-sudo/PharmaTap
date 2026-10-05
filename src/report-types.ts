export type ReportField = {id:string;label:string;options?:string[];optional?:boolean};
export type ReportType = {type:string;label:string;subtitle:string;fields:ReportField[]};
const medicine={id:'medicine',label:'Medicine / product'};
const description={id:'description',label:'What happened?'};
const action={id:'action',label:'Immediate action',options:['Pharmacist informed','Made safe','Follow-up needed','Other']};
export const reportTypes:ReportType[]=[
 {type:'Prescription error',label:'Prescription error',subtitle:'A problem with the prescription received',fields:[{id:'issue',label:'What was wrong?',options:['Dose','Directions','Missing information','Other']},medicine,{id:'action',label:'Action taken',options:['Referred to pharmacist','Prescriber contacted','Prescription clarified','Other']}]},
 {type:'Medication error',label:'Medication error',subtitle:'An error that reached the patient',fields:[{id:'issue',label:'What was wrong?',options:['Medicine','Strength','Quantity','Label','Other']},medicine,{id:'harm',label:'Patient harm or immediate danger?',options:['Yes','No','Unknown']},action]},
 {type:'Near miss',label:'Near miss',subtitle:'A medicine error caught before supply',fields:[{id:'issue',label:'What was wrong?',options:['Medicine','Strength','Quantity','Label','Other']},medicine]},
 {type:'Refusal of supply',label:'Refusal of supply',subtitle:'Medicine requested, not supplied',fields:[medicine,{id:'reason',label:'Reason for refusal',options:['Unsuitable','Repeated request','Suspected misuse','Other']},{id:'advice',label:'Advice given',options:['Explained refusal','Alternative offered','Referred','Other']}]},
 {type:'Safety concern',label:'Safety concern',subtitle:'A hazard or unsafe practice',fields:[{id:'area',label:'Concern',options:['Premises','Working practice','Equipment','Other']},description,action]},
 {type:'Accident or injury',label:'Accident or injury',subtitle:'An accident involving staff or visitors',fields:[{id:'person',label:'Who was involved?',options:['Staff','Visitor','Both']},description,{id:'harm',label:'Immediate danger or urgent care needed?',options:['Yes','No','Unknown']},action]},
 {type:'Maintenance',label:'Maintenance issue',subtitle:'Equipment, premises or IT needs attention',fields:[{id:'area',label:'Affected area',options:['Equipment','Premises','IT','Other']},description,{id:'urgency',label:'Can it still be used safely?',options:['Yes','No','Unknown']}]},
 {type:'Security incident',label:'Security incident',subtitle:'Theft, aggression or suspicious activity',fields:[{id:'issue',label:'Incident',options:['Theft','Threats / aggression','Suspicious activity','Other']},description,action]},
 {type:'Complaint',label:'Complaint',subtitle:'A concern that needs follow-up',fields:[{id:'area',label:'About',options:['Service','Medicine','Privacy','Other']},description,{id:'action',label:'Action taken',options:['Resolved','Pharmacist informed','Follow-up needed','Other']}]},
 {type:'Medicine quality issue',label:'Medicine quality',subtitle:'Stock defects or storage issues',fields:[medicine,{id:'issue',label:'Problem',options:['Damaged stock','Suspected defect','Storage / temperature','Other']},{id:'action',label:'Action taken',options:['Quarantined','Pharmacist informed','Follow-up needed','Other']}]},
 {type:'Other',label:'Other',subtitle:'Something else needs to be recorded',fields:[description,action]}
];
export function reportDetail(type:ReportType,answers:Record<string,string>,note:string){
 return type.fields.filter(f=>answers[f.id]?.trim()).map(f=>`${f.label}: ${answers[f.id].trim()}`).concat(note.trim()?['Additional detail: '+note.trim()]:[]).join('\n');
}
