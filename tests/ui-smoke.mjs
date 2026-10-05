import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const { chromium }=require(require.resolve('playwright',{paths:process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]:[process.cwd()]}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
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
 if(path==='/api/workspace/session')return json({userId:'manager',pharmacies:[{id:site,name:'Test pharmacy',timezone:'Europe/Dublin',role:'manager',display_name:'Test Manager'}]});
 if(path==='/api/workspace/reports'&&request.method()==='POST'){
  keys.push(request.headers()['idempotency-key']);if(failNext){failNext=false;return json({error:'Temporary service error'},503);}
  const body=request.postDataJSON();records=[{...body,id:report,action_id:action,title:body.title,type:body.type,detail:body.detail,created_at:new Date().toISOString(),occurred_at:body.occurredAt,due_at:body.dueAt,created_by:'manager',owner_id:'manager',owner_name:'Test Manager',status:'Open',resolution:'',version:1}];return json({id:report});
 }
 if(path==='/api/workspace/reports')return json({reports:records,reviewers:[{user_id:'manager',display_name:'Test Manager'}],role:'manager'});
 if(path.endsWith('/history'))return json([{event:'report.created',actor_id:'manager',created_at:new Date().toISOString()}]);
 if(path==='/api/workspace/actions/'+action){const b=request.postDataJSON();records[0]={...records[0],status:b.status,resolution:b.resolution,version:2};return json(records[0]);}
 const file=path==='/'?'workspace.html':path.slice(1);
 try{const body=await readFile('dist/'+file);const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.woff2')?'font/woff2':'image/svg+xml';return route.fulfill({body,contentType});}catch{return route.fulfill({status:404,body:'Not found'});}
});
try{
 await page.goto('https://pharmatap.test/');
 await page.getByLabel('Email',{exact:true}).fill('manager@example.test');await page.getByLabel('Password',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.getByRole('heading',{name:'Test pharmacy'}).waitFor();
 await page.getByRole('button',{name:'Report',exact:true}).click();await page.getByLabel('Title',{exact:true}).fill('Shelf selection intercepted');await page.getByLabel('What happened?',{exact:true}).fill('The wrong item was identified before completing the check.');
 await page.getByRole('button',{name:'Submit report'}).click();await page.getByText(/Your draft remains here/).waitFor();assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),'Shelf selection intercepted');
 await page.getByRole('button',{name:'Submit report'}).click();await page.getByRole('button',{name:'View report'}).waitFor();assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 await page.screenshot({path:'/workspace/scratch/f501d0b0a93a/workspace-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'View report'}).click();await page.getByLabel('Status',{exact:true}).selectOption('Closed');await page.getByLabel('Review notes',{exact:true}).fill('Reviewed and corrective action agreed with the team.');await page.getByRole('button',{name:'Save review'}).click();await page.getByText('Closed',{exact:true}).waitFor();
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/workspace/scratch/f501d0b0a93a/workspace-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Sign out'}).click();await page.getByRole('heading',{name:'Sign in'}).waitFor();assert.equal(await page.getByText('Shelf selection intercepted',{exact:true}).count(),0);assert.deepEqual(errors,[]);
 console.log('UI smoke passed: login, mobile layout, failed-save draft preservation, identical retry key, report creation, review closure, sign-out. Identity/API mocked; deployed authentication remains a separate gate.');
}finally{await browser.close();}
