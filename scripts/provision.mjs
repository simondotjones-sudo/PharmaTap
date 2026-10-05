// Operator-only provisioning. Run in a linked Netlify environment, never from a browser.
import { readFile } from 'node:fs/promises';
import { getDatabase } from '@netlify/database';
const file=process.argv[2];if(!file)throw new Error('Usage: node scripts/provision.mjs /absolute/path/access.json');
const config=JSON.parse(await readFile(file,'utf8'));
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if(!uuid.test(config.organisation?.id)||!config.organisation?.name?.trim()||!Array.isArray(config.pharmacies)||!config.pharmacies.length)throw new Error('Provide an organisation and pharmacies.');
for(const p of config.pharmacies){if(!uuid.test(p.id)||!p.name?.trim()||!Array.isArray(p.members)||!p.members.some(m=>['manager','superintendent'].includes(m.role)&&m.active!==false))throw new Error('Each pharmacy needs an ID, name and reviewer.');for(const m of p.members)if(!m.userId||!m.displayName||!['staff','manager','superintendent'].includes(m.role))throw new Error('Invalid member. Use verified Identity user IDs.');}
const db=getDatabase(process.env.PHARMATAP_DATABASE_PROVIDER==='neon'?{connectionString:process.env.NETLIFY_DATABASE_URL||process.env.DATABASE_URL}:undefined);
const client=await db.pool.connect();
try{
 await client.query('BEGIN');
 await client.query('INSERT INTO organisations(id,name) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET name=excluded.name',[config.organisation.id,config.organisation.name]);
 for(const p of config.pharmacies){
  const existing=await client.query('SELECT organisation_id FROM pharmacies WHERE id=$1',[p.id]);
  if(existing.rows.length&&existing.rows[0].organisation_id!==config.organisation.id)throw new Error('Cannot move an existing pharmacy between organisations.');
  await client.query('INSERT INTO pharmacies(id,organisation_id,name) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET name=excluded.name',[p.id,config.organisation.id,p.name]);
  for(const m of p.members)await client.query('INSERT INTO memberships(user_id,pharmacy_id,display_name,role,active) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,pharmacy_id) DO UPDATE SET display_name=excluded.display_name,role=excluded.role,active=excluded.active',[m.userId,p.id,m.displayName,m.role,m.active!==false]);
 }
 await client.query('COMMIT');console.log('Provisioning complete. Pharmacy memberships saved.');
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await db.pool.end();}
