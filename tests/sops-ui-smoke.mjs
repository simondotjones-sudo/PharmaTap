import { createRequire } from 'node:module';
import { readFile,mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const { chromium }=require(require.resolve('playwright',{paths:process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]:[process.cwd()]}));
const output=process.env.PHARMATAP_TEST_OUTPUT||'.netlify/ui-smoke';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PHARMATAP_TEST_BROWSER?{executablePath:process.env.PHARMATAP_TEST_BROWSER}:{}),args:['--no-sandbox']});
const site='11111111-1111-4111-8111-111111111111',report='22222222-2222-4222-8222-222222222222',action='33333333-3333-4333-8333-333333333333';
let records=[],keys=[],failNext=true;
const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://pharmatap.test/**',async route=>{
 const request=route.request(),url=new URL(request.url()),path=url.pathname;
 const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 if(path==='/.netlify/identity/token')return json({access_token:'test-token',refresh_token:'test-refresh',expires_in:3600,token_type:'bearer'});
 if(path==='/.netlify/identity/user')return json({id:'manager',email:'manager@example.test',user_metadata:{full_name:'Test Manager'},app_metadata:{roles:[]}});
 if(path==='/.netlify/identity/logout')return json({});
 if(path==='/api/workspace/initialise')return json({initialised:false});
 if(path==='/api/workspace/session')return json({userId:'manager',pharmacies:[{id:site,name:'Test pharmacy',timezone:'Europe/Dublin',role:'superintendent',display_name:'Test Manager',organisation_id:'44444444-4444-4444-8444-444444444444',organisation_name:'Demo'}]});
 if(path==='/api/workspace/reports'&&request.method()==='POST'){
  keys.push(request.headers()['idempotency-key']);if(failNext){failNext=false;return json({error:'Temporary service error'},503);}
  const body=request.postDataJSON();records=[{...body,id:report,action_id:action,title:body.type+' · '+(body.answers.medicine||body.answers.area||'New report'),type:body.type,detail:JSON.stringify(body.answers),has_photo:Boolean(body.photo),created_at:new Date().toISOString(),occurred_at:body.occurredAt,due_at:body.dueAt,created_by:'manager',owner_id:'manager',owner_name:'Test Manager',status:'Open',resolution:'',version:1}];return json({id:report});
 }
 if(path==='/api/workspace/sops'&&request.method()==='POST'){const b=request.postDataJSON();records.push({...b,version_label:b.version,review_date:b.reviewDate,has_pdf:!!b.pdf});return json({id:b.id});}
 if(path==='/api/workspace/sops')return json({drafts:records});
 if(path==='/api/workspace/reports')return json({reports:records,reviewers:[{user_id:'manager',display_name:'Test Manager'}],role:request.headers()['x-pharmatap-role']||'superintendent'});
 if(path.endsWith('/photo'))return route.fulfill({contentType:'image/jpeg',body:Buffer.from(records[0].photo,'base64')});
 if(path.endsWith('/history'))return json([{event:'report.created',actor_id:'manager',created_at:new Date().toISOString()}]);
 if(path==='/api/workspace/actions/'+action){const b=request.postDataJSON();records[0]={...records[0],status:b.status,resolution:b.resolution,version:2};return json(records[0]);}
 const file=path==='/'?'workspace.html':path.slice(1);
 try{const body=await readFile('dist/'+file);const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.woff2')?'font/woff2':'image/svg+xml';return route.fulfill({body,contentType});}catch{return route.fulfill({status:404,body:'Not found'});}
});
try{
 await page.goto('https://pharmatap.test/');
 await page.getByLabel('Email',{exact:true}).fill('manager@example.test');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.locator('[data-task=sops]').click();
 assert.equal(await page.locator('[data-sops-mode]').count(),3);assert.equal(await page.locator('.site-context').count(),0);
 const wraps=[];
 for(const width of [320,375,390,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const group of ['Medicines','Dispensing','Non-prescription','Governance','Services']){
   await page.locator('[data-sops-group="'+group+'"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const wrapped=await page.locator('.training-tile').evaluateAll(tiles=>tiles.flatMap(t=>[...t.querySelectorAll('strong span, .training-tile>span:last-child span')].filter(s=>s.getBoundingClientRect().height>parseFloat(getComputedStyle(s).lineHeight)+2).map(s=>s.textContent)));
   if(wrapped.length)wraps.push({width,group,wrapped});
  }
 }
 assert.deepEqual(wraps,[]);
 await page.setViewportSize({width:390,height:844});await page.locator('[data-sops-group=Medicines]').click();await page.screenshot({path:output+'/sops-mobile.png',fullPage:true});
 await page.locator('[data-sops-open=sop-0]').click();assert.equal(await page.locator('[data-sops-mode]').count(),0);
 await page.locator('[data-sops-from-topic]').click();assert.equal(await page.locator('[name=title]').inputValue(),'Sourcing & suppliers');
 await page.locator('[name=reviewDate]').fill('2027-10-05');await page.locator('[name=content]').fill('Verify suppliers and document medicine receipt.');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.locator('[data-sops-draft]').waitFor();
 assert.equal(records.length,1);await page.locator('[data-sops-draft]').click();assert.match(await page.locator('#sops-body').innerText(),/Verify suppliers/);await page.locator('[data-sops-back]').click();
 await page.locator('[data-sops-mode=create]').click();await page.locator('[name=source]').selectOption('upload');await page.locator('[name=title]').fill('Supplier procedure');await page.locator('[name=reviewDate]').fill('2027-10-05');await page.locator('[name=supplier]').fill('Test supplier');await page.locator('[name=file]').setInputFiles({name:'supplier.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7\nSupplier procedure')});await page.screenshot({path:output+'/sops-create-mobile.png',fullPage:true});await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.locator('[data-sops-draft]').first().waitFor();assert.equal(records.length,2);await page.screenshot({path:output+'/sops-dashboard-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Profile',exact:true}).click();await page.locator('#role').selectOption('staff');await page.getByRole('button',{name:'Profile',exact:true}).click();assert.equal(await page.locator('[data-sops-mode]').count(),0);assert.equal(await page.locator('[data-sops-open]').count(),6);
 await page.locator('[data-sops-open=sop-0]').click();assert.equal(await page.locator('[data-sops-from-topic]').count(),0);await page.locator('[data-sops-back]').click();
 await page.setViewportSize({width:1280,height:900});await page.screenshot({path:output+'/sops-desktop.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('SOP categories, mobile/desktop layout, written drafts, supplier PDF upload and staff permissions passed.');
}finally{await browser.close();}
