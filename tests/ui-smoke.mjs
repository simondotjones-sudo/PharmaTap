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
  const body=request.postDataJSON();records=[{...body,id:report,action_id:action,title:body.type+' · '+body.answers.medicine,type:body.type,detail:JSON.stringify(body.answers),created_at:new Date().toISOString(),occurred_at:body.occurredAt,due_at:body.dueAt,created_by:'manager',owner_id:'manager',owner_name:'Test Manager',status:'Open',resolution:'',version:1}];return json({id:report});
 }
 if(path==='/api/workspace/reports')return json({reports:records,reviewers:[{user_id:'manager',display_name:'Test Manager'}],role:request.headers()['x-pharmatap-role']||'manager'});
 if(path.endsWith('/history'))return json([{event:'report.created',actor_id:'manager',created_at:new Date().toISOString()}]);
 if(path==='/api/workspace/actions/'+action){const b=request.postDataJSON();records[0]={...records[0],status:b.status,resolution:b.resolution,version:2};return json(records[0]);}
 const file=path==='/'?'workspace.html':path.slice(1);
 try{const body=await readFile('dist/'+file);const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.woff2')?'font/woff2':'image/svg+xml';return route.fulfill({body,contentType});}catch{return route.fulfill({status:404,body:'Not found'});}
});
try{
 await page.goto('https://pharmatap.test/');
 await page.getByLabel('Email',{exact:true}).fill('manager@example.test');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.locator('.home-task').first().waitFor();
 await page.getByRole('button',{name:'Profile',exact:true}).click();await page.locator('#pharmacy').waitFor();await page.locator('#role').selectOption('staff');await page.getByRole('button',{name:'Profile',exact:true}).click();
 await page.locator('[data-task=report]').click();
 assert.equal(await page.locator('[data-report-type]').count(),11);assert.equal(await page.locator('.report-switch').count(),0);
 await page.screenshot({path:output+'/reports-mobile.png',fullPage:true});
 await page.locator('[data-report-type="Near miss"]').click();
 assert.equal(await page.locator('[name=title]').count(),0);assert.equal(await page.locator('[name=owner]').count(),0);
 await page.getByLabel('Medicine',{exact:true}).check();await page.getByLabel('Medicine / product',{exact:true}).fill('Sample medicine');
 await page.getByRole('button',{name:'Submit report'}).click();await page.getByText(/Your draft remains here/).waitFor();assert.equal(await page.getByLabel('Medicine / product',{exact:true}).inputValue(),'Sample medicine');
 await page.getByRole('button',{name:'Submit report'}).click();await page.locator('[data-report-type]').first().waitFor();assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 await page.locator('[data-report-type="Refusal of supply"]').click();await page.getByLabel('Medicine / product',{exact:true}).fill('Codeine product');await page.getByLabel('Suspected misuse',{exact:true}).check();await page.getByLabel('Explained refusal',{exact:true}).check();
 await page.screenshot({path:output+'/refusal-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 await page.getByRole('button',{name:'Change type'}).click();await page.locator('[data-report-type="Medication error"]').click();await page.getByLabel('Yes',{exact:true}).check();await page.getByText(/Alert the pharmacist immediately/).waitFor();await page.getByRole('button',{name:'Change type'}).click();
 await page.getByRole('button',{name:'Profile',exact:true}).click();await page.locator('#role').selectOption('manager');await page.locator('[data-report-mode=view]').waitFor();await page.getByRole('button',{name:'Profile',exact:true}).click();await page.locator('[data-report-mode=view]').click();
 await page.getByRole('button',{name:'View report',exact:true}).click();await page.locator('[name=status]').selectOption('Closed');await page.getByLabel('Review notes',{exact:true}).fill('Reviewed and corrective action agreed with the team.');await page.getByRole('button',{name:'Save review'}).click();await page.getByText('Closed',{exact:true}).waitFor();
 await page.locator('[data-report-mode=report]').click();await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:output+'/reports-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Profile',exact:true}).click();await page.getByRole('button',{name:'Sign out'}).click();await page.getByRole('heading',{name:'Sign in'}).waitFor();assert.equal(await page.getByText('Sample medicine',{exact:true}).count(),0);assert.deepEqual(errors,[]);
 console.log('UI smoke passed: login, mobile layout, failed-save draft preservation, identical retry key, report creation, review closure, sign-out. Identity/API mocked; deployed authentication remains a separate gate.');
}catch(error){await page.screenshot({path:output+'/smoke-debug.png',fullPage:true});throw error;}finally{await browser.close();}
