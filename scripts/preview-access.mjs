import { getDatabase } from '@netlify/database';

// Operator-configured setup for this development preview only. No public API.
export async function provisionPreviewAccess(env=process.env,connect=getDatabase){
 if(env.CONTEXT!=='deploy-preview'||env.BRANCH!=='development/working-foundation')return false;
 const userId=env.PHARMATAP_PREVIEW_USER_ID;
 if(!userId)return false;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId))throw new Error('Invalid preview account configuration.');
 const organisation='b118137f-b4ca-46df-a329-5b66ab329a23',pharmacy='a0e2cc87-2fb0-4a72-9bb4-1f8f4eeb476e';
 const db=connect(),client=await db.pool.connect();
 try{
  await client.query('BEGIN');
  await client.query('INSERT INTO organisations(id,name) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',[organisation,'PharmaTap Development']);
  await client.query('INSERT INTO pharmacies(id,organisation_id,name) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',[pharmacy,organisation,'Skerries · Test pharmacy']);
  const existing=await client.query('SELECT organisation_id FROM pharmacies WHERE id=$1',[pharmacy]);
  if(existing.rows[0]?.organisation_id!==organisation)throw new Error('Preview pharmacy configuration mismatch.');
  await client.query("INSERT INTO memberships(user_id,pharmacy_id,display_name,role,active) VALUES($1,$2,$3,'superintendent',true) ON CONFLICT(user_id,pharmacy_id) DO UPDATE SET role='superintendent',active=true",[userId,pharmacy,'Simon']);
  const result=await client.query("SELECT count(*)::int AS n FROM memberships WHERE user_id=$1 AND pharmacy_id=$2 AND role='superintendent' AND active=true",[userId,pharmacy]);
  if(result.rows[0]?.n!==1)throw new Error('Preview membership verification failed.');
  await client.query('COMMIT');
  console.log('Preview administrator access assigned and verified.');return true;
 }catch{await client.query('ROLLBACK');throw new Error('Preview access setup failed; deployment stopped.');}
 finally{client.release();await db.pool.end();}
}
