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
 if(path==='/api/workspace/session')return json({userId:'manager',pharmacies:[{id:site,name:'Test pharmacy',timezone:'Europe/Dublin',role:'manager',display_name:'Test Manager',organisation_id:'44444444-4444-4444-8444-444444444444',organisation_name:'Demo'}]});
 if(path==='/api/workspace/reports'&&request.method()==='POST'){
  keys.push(request.headers()['idempotency-key']);if(failNext){failNext=false;return json({error:'Temporary service error'},503);}
  const body=request.postDataJSON();records=[{...body,id:report,action_id:action,title:body.type+' · '+(body.answers.medicine||body.answers.area||'New report'),type:body.type,detail:JSON.stringify(body.answers),has_photo:Boolean(body.photo),created_at:new Date().toISOString(),occurred_at:body.occurredAt,due_at:body.dueAt,created_by:'manager',owner_id:'manager',owner_name:'Test Manager',status:'Open',resolution:'',version:1}];return json({id:report});
 }
 if(path==='/api/workspace/reports')return json({reports:records,reviewers:[{user_id:'manager',display_name:'Test Manager'}],role:request.headers()['x-pharmatap-role']||'manager'});
 if(path.endsWith('/photo'))return route.fulfill({contentType:'image/jpeg',body:Buffer.from(records[0].photo,'base64')});
 if(path.endsWith('/history'))return json([{event:'report.created',actor_id:'manager',created_at:new Date().toISOString()}]);
 if(path==='/api/workspace/actions/'+action){const b=request.postDataJSON();records[0]={...records[0],status:b.status,resolution:b.resolution,version:2};return json(records[0]);}
 const file=path==='/'?'workspace.html':path.slice(1);
 try{const body=await readFile('dist/'+file);const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.woff2')?'font/woff2':'image/svg+xml';return route.fulfill({body,contentType});}catch{return route.fulfill({status:404,body:'Not found'});}
});
try{
 await page.goto('https://pharmatap.test/');
 await page.getByLabel('Email',{exact:true}).fill('manager@example.test');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.locator('[data-task=training]').click();
 assert.equal(await page.locator('[data-training-open]').count(),6);
 assert.equal(await page.locator('[data-training-mode]').count(),2);
 assert.equal(await page.locator('.site-context').count(),0);
 for(const width of [390,375,320,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const group of ['Core','Pharmacy','Dispensary','Pharmacists','Risk-based']){
   await page.locator('[data-training-group="'+group+'"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const wrapped=await page.locator('.training-tile').evaluateAll(tiles=>tiles.flatMap(t=>[...t.querySelectorAll('strong span, .training-tile>span:last-child span')].filter(s=>s.getBoundingClientRect().height>parseFloat(getComputedStyle(s).lineHeight)+2).map(s=>s.textContent)));
   assert.deepEqual(wrapped,[],'Tile lines wrapped at '+width+' in '+group);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.locator('[data-training-group=Core]').click();
 await page.screenshot({path:output+'/training-manager-mobile.png',fullPage:true});
 await page.locator('[data-training-open=handling]').click();assert.equal(await page.locator('.training-switch').count(),0);assert.match(await page.locator('.training-detail').innerText(),/risk/);
 await page.getByRole('button',{name:'Back',exact:true}).last().click();
 assert.equal(await page.locator('[data-training-open]').count(),6);
 await page.locator('[data-training-mode=reports]').click();assert.match(await page.locator('#training-body').innerText(),/No training records yet/);
 await page.screenshot({path:output+'/training-reports-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Profile',exact:true}).click();await page.locator('#role').selectOption('staff');await page.getByRole('button',{name:'Profile',exact:true}).click();
 assert.equal(await page.locator('[data-training-mode]').count(),0);assert.equal(await page.locator('[data-training-open]').count(),6);
 await page.screenshot({path:output+'/training-staff-mobile.png',fullPage:true});
 await page.locator('[data-training-group=Pharmacists]').click();await page.locator('[data-training-open=cpd]').click();assert.match(await page.locator('.training-detail').innerText(),/January 2027/);
 await page.locator('[data-training-back]').click();await page.setViewportSize({width:1280,height:900});await page.locator('[data-training-group=Core]').click();await page.screenshot({path:output+'/training-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Menu',exact:true}).click();await page.locator('[data-page=learning]').click();assert.equal(await page.locator('[data-training-open]').count(),6);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('Training mobile/desktop, all 25 modules, details, reports, staff view, home/menu navigation passed');
}finally{await browser.close();}
