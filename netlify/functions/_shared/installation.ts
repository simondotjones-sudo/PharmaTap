import { timingSafeEqual } from 'node:crypto';
import { Fault,uuid,session,type DB } from './service';
export function checkSetupKey(supplied:string|null,expected:string|undefined){
 if(!expected||expected.length<32)throw new Fault(404,'Setup is disabled.');
 const a=Buffer.from(supplied||''),b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))throw new Fault(403,'Setup authorisation required.');
}
export async function initialiseOrganisations(db:DB,userId:string){
 uuid(userId);
 await db.query("SELECT pg_advisory_xact_lock(hashtextextended('pharmatap-initial-organisations',0))");
 const marker=await db.query("SELECT configured_user_id FROM installation_setup WHERE key='initial-organisations'");
 if(marker.rows.length&&marker.rows[0].configured_user_id!==userId)throw new Fault(409,'Setup is already assigned to a different administrator.');
 const ids=['b118137f-b4ca-46df-a329-5b66ab329a23','876b7b2e-6cbf-4f83-a6c0-a47ae392ef1d'];
 if(!marker.rows.length){
  const catalogue=await db.query('SELECT o.id,count(p.id)::int AS n FROM organisations o JOIN pharmacies p ON p.organisation_id=o.id WHERE o.id=ANY($1::uuid[]) GROUP BY o.id',[ids]);
  if(catalogue.rows.length!==2||catalogue.rows.reduce((n,r)=>n+r.n,0)!==18)throw new Fault(409,'The organisation catalogue is incomplete.');
  for(const organisation of ids){
   await db.query("INSERT INTO organisation_memberships(user_id,organisation_id,role,active) VALUES($1,$2,'admin',true) ON CONFLICT(user_id,organisation_id) DO UPDATE SET role='admin',active=true",[userId,organisation]);
   await db.query("INSERT INTO memberships(user_id,pharmacy_id,display_name,role,active) SELECT $1,id,'Simon','superintendent',true FROM pharmacies WHERE organisation_id=$2 ON CONFLICT(user_id,pharmacy_id) DO UPDATE SET role='superintendent',active=true",[userId,organisation]);
  }
  await db.query("INSERT INTO installation_setup(key,configured_user_id) VALUES('initial-organisations',$1)",[userId]);
  for(const organisation of ids){
   const pharmacy=await db.query('SELECT id FROM pharmacies WHERE organisation_id=$1 ORDER BY name LIMIT 1',[organisation]);
   await db.query("INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$2,$3,'organisation.admin-assigned',$4)",[pharmacy.rows[0].id,organisation,userId,JSON.stringify({organisationId:organisation,role:'admin',source:'authorised installation setup'})]);
  }
 }
 const result=await session(db,{id:userId});
 const verified=result.organisations.filter((o:any)=>ids.includes(o.id)&&o.role==='admin');
 const pharmacies=result.pharmacies.filter((p:any)=>ids.includes(p.organisation_id));
 if(verified.length!==2||pharmacies.length!==18)throw new Fault(409,'Administrator access verification failed.');
 return {verified:true,organisations:verified.map((o:any)=>({id:o.id,name:o.name,role:o.role,pharmacies:pharmacies.filter((p:any)=>p.organisation_id===o.id).length})),totalPharmacies:pharmacies.length};
}
