import {Fault,uuid,type DB,type Actor} from './service';
export async function organisationAdmin(db:DB,actor:Actor,organisationId:string){
 uuid(organisationId);
 if(actor.viewRole&&actor.viewRole!=='superintendent')throw new Fault(403,'Organisation admin access is required.');
 const m=await db.query("SELECT 1 FROM organisation_memberships WHERE user_id=$1 AND organisation_id=$2 AND role='admin' AND active=true",[actor.id,organisationId]);
 if(!m.rows.length)throw new Fault(403,'Organisation admin access is required.');
}
const value=(v:unknown,max:number,label:string)=>{if(typeof v!=='string'||!v.trim()||v.trim().length>max)throw new Fault(400,'Enter a valid '+label+'.');return v.trim();};
export async function manageList(db:DB,actor:Actor,organisationId:string){
 await organisationAdmin(db,actor,organisationId);
 const sites=await db.query(`SELECT p.id,p.name,p.county,p.timezone,EXISTS(SELECT 1 FROM memberships m WHERE m.pharmacy_id=p.id AND m.active=true AND m.role IN ('manager','superintendent')) AS has_reviewer,EXISTS(SELECT 1 FROM memberships m JOIN organisation_memberships om ON om.user_id=m.user_id AND om.organisation_id=p.organisation_id AND om.active=true WHERE m.pharmacy_id=p.id AND m.active=true AND m.role='superintendent') AS has_admin FROM pharmacies p WHERE p.organisation_id=$1 ORDER BY p.name`,[organisationId]);
 const users=await db.query('SELECT m.user_id,m.display_name,m.email,m.role,m.pharmacy_id,p.name AS site_name FROM memberships m JOIN pharmacies p ON p.id=m.pharmacy_id WHERE p.organisation_id=$1 AND m.active=true ORDER BY m.display_name,p.name',[organisationId]);
 return {sites:sites.rows,users:users.rows};
}
export async function addSite(db:DB,actor:Actor,input:any){
 const org=uuid(input?.organisationId);await organisationAdmin(db,actor,org);
 const id=uuid(input.id),name=value(input.name,120,'site name'),county=typeof input.county==='string'?input.county.trim():'';
 if(county.length>80)throw new Fault(400,'County is too long.');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[org+':sites']);
 const existing=await db.query('SELECT id,name FROM pharmacies WHERE organisation_id=$1 AND (id=$2 OR lower(name)=lower($3))',[org,id,name]);
 if(existing.rows.length){if(existing.rows[0].id===id&&existing.rows[0].name===name)return {id,replayed:true};throw new Fault(409,'A site with this name already exists.');}
 await db.query('INSERT INTO pharmacies(id,organisation_id,name,county) VALUES($1,$2,$3,$4)',[id,org,name,county||null]);
 await db.query("INSERT INTO memberships(user_id,pharmacy_id,display_name,role,active,email) SELECT om.user_id,$1,COALESCE((SELECT display_name FROM memberships WHERE user_id=om.user_id ORDER BY pharmacy_id LIMIT 1),'Administrator'),'superintendent',true,(SELECT email FROM memberships WHERE user_id=om.user_id AND email IS NOT NULL LIMIT 1) FROM organisation_memberships om WHERE om.organisation_id=$2 AND om.active=true",[id,org]);
 await db.query("INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$1,$2,'site.created',$3)",[id,actor.id,JSON.stringify({name,county})]);
 return {id};
}
export async function addUser(db:DB,actor:Actor,input:any,resolve:(email:string,name:string)=>Promise<string>){
 const org=uuid(input?.organisationId);await organisationAdmin(db,actor,org);
 const name=value(input.name,120,'name'),email=value(input.email,254,'email').toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Fault(400,'Enter a valid email address.');
 const role=input.role;if(!['staff','manager','superintendent'].includes(role))throw new Fault(400,'Choose a valid role.');
 if(!Array.isArray(input.siteIds)||!input.siteIds.length||input.siteIds.length>500)throw new Fault(400,'Choose at least one site.');
 const selected=[...new Set(input.siteIds.map(uuid))];
 const sites=(await db.query('SELECT id FROM pharmacies WHERE organisation_id=$1 ORDER BY id',[org])).rows.map(r=>r.id);
 if(selected.some(id=>!sites.includes(id)))throw new Fault(403,'Choose sites in this organisation.');
 const assigned=role==='superintendent'?sites:selected;
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[org+':'+email]);
 const duplicate=await db.query('SELECT 1 FROM memberships m JOIN pharmacies p ON p.id=m.pharmacy_id WHERE p.organisation_id=$1 AND lower(m.email)=$2 AND m.active=true',[org,email]);
 if(duplicate.rows.length)throw new Fault(409,'This user already has access to this organisation.');
 const userId=await resolve(email,name);
 // Never downgrade or overwrite an existing account assignment.
 const prior=await db.query('SELECT 1 FROM memberships m JOIN pharmacies p ON p.id=m.pharmacy_id WHERE p.organisation_id=$1 AND m.user_id=$2 AND m.active=true',[org,userId]);
 if(prior.rows.length)throw new Fault(409,'This user already has access to this organisation.');
 if(role==='superintendent')await db.query("INSERT INTO organisation_memberships(user_id,organisation_id,role,active) VALUES($1,$2,'admin',true) ON CONFLICT(user_id,organisation_id) DO UPDATE SET active=true",[userId,org]);
 for(const site of assigned)await db.query('INSERT INTO memberships(user_id,pharmacy_id,display_name,email,role,active) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(user_id,pharmacy_id) DO UPDATE SET display_name=excluded.display_name,email=excluded.email,role=excluded.role,active=true',[userId,site,name,email,role]);
 await db.query("INSERT INTO audit_events(pharmacy_id,entity_id,actor_id,event,payload) VALUES($1,$2,$3,'user.added',$4)",[assigned[0],org,actor.id,JSON.stringify({userId,email,role,siteIds:assigned})]);
 return {userId};
}
