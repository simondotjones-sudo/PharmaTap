export const sopGroups=['Medicines','Dispensing','Non-prescription','Governance','Services'] as const;
export type SopGroup=typeof sopGroups[number];
export const sopCatalogue: {id:string;group:SopGroup;name:string;title:string[];description:string[]}[]=[];
const groups: [SopGroup,string[][]][]=[
 ['Medicines',[
 ['Sourcing & suppliers','Sourcing|& suppliers','Verify medicines|and suppliers'],
 ['Receipt & storage','Receipt|& storage','Deliveries, fridges|and cold chain'],
 ['Date checking & stock rotation','Dates &|stock rotation','Check expiry dates|and rotate stock'],
 ['Controlled drugs','Controlled|drugs','Ordering, registers|and safe supply'],
 ['Disposal & patient returns','Disposal|& returns','Waste medicines|and patient returns'],
 ['Recalls, quality defects & FMD alerts','Recalls &|FMD alerts','Quality defects|and medicine alerts']]],
 ['Dispensing',[
 ['Prescription receipt & validation','Prescription|validation','Legal and clinical|prescription checks'],
 ['Assembly & labelling','Assembly|& labelling','Prepare medicines|and accurate labels'],
 ['Final accuracy check','Final accuracy|check','Check medicines|before supply'],
 ['Supply & patient counselling','Supply &|counselling','Patient advice|and collections'],
 ['Owings & part-supplies','Owings &|part-supplies','Outstanding items|and partial supply'],
 ['Emergency supply','Emergency|supply','Urgent requests|and documentation'],
 ['High-risk medicines','High-risk|medicines','Extra checks for|higher-risk supply'],
 ['Dispensing record keeping','Dispensing|records','Prescriptions, drugs|and duty registers'],
 ['Dispensing errors & near misses','Errors &|near misses','Report errors|and learn from them']]],
 ['Non-prescription',[
 ['Sale, supply & pharmacist referral','Sale &|referral','Safe supply|and referral'],
 ['Codeine-containing products','Codeine|products','Assess requests|and record supply'],
 ['Other restricted products','Restricted|products','Specific controls|for restricted supply']]],
 ['Governance',[
 ['Pharmacist absence & supervision','Absence &|supervision','Pharmacist cover|and supervision'],
 ['Opening, closing & security','Opening &|security','Keys, access and|closing checks'],
 ['Confidentiality & data protection','Privacy &|data security','Protect patient|and staff records'],
 ['Complaints handling','Complaints|handling','Record concerns|and follow them up'],
 ['Adverse reaction reporting','Adverse|reactions','Report suspected|reactions to HPRA'],
 ['Staff training, SOP sign-off & locum induction','Training &|SOP sign-off','Staff competence|and locum induction'],
 ['Cleaning & hygiene','Cleaning|& hygiene','Clean premises|and safe work areas'],
 ['SOP control & review','SOP control|& review','Draft, approve|and review SOPs']]],
 ['Services',[
 ['Vaccination','Vaccination|service','Safe vaccination|and service records'],
 ['Emergency medicines','Emergency|medicines','Service controls|for emergency care'],
 ['Delivery of medicines','Medicine|deliveries','Safe delivery|and patient receipt'],
 ['Monitored dosage systems','Monitored|dosage packs','Prepare packs|and track changes'],
 ['Nursing homes & residential care','Residential|care supply','Medicine supply|and care records'],
 ['Opioid substitution','Opioid|substitution','Supervised supply|and service records'],
 ['Extemporaneous dispensing','Extemporaneous|dispensing','Prepare medicines|to agreed methods'],
 ['Point of care testing, sharps & needle-stick','Testing &|sharps safety','Safe testing and|sharps incidents'],
 ['Online supply','Online|supply','Remote requests|and safe supply'],
 ['Prescription extension','Prescription|extension','Assess extensions|and record advice'],
 ['Veterinary medicines','Veterinary|medicines','Animal medicines|and supply records']]]
];
for(const [group,rows] of groups)for(const [name,title,description] of rows)sopCatalogue.push({id:'sop-'+sopCatalogue.length,group,name,title:title.split('|'),description:description.split('|')});
