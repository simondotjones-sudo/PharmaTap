import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(require.resolve('playwright',{paths:process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]:[process.cwd()]}));
const browser=await chromium.launch({headless:true,...(process.env.PHARMATAP_TEST_BROWSER?{executablePath:process.env.PHARMATAP_TEST_BROWSER}:{}),args:['--no-sandbox']});
const output=process.env.PHARMATAP_TEST_OUTPUT||'.netlify/registration-smoke';await mkdir(output,{recursive:true});
async function scenario(options,run){
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 const identityUser={id:'11111111-1111-4111-8111-111111111111',email:'demo@pharmacy.com',user_metadata:{full_name:'Pharmacy Demo'},app_metadata:{roles:[]},...(options.confirmation?{}:{confirmed_at:'2026-10-06T10:00:00Z'})};
 await page.route('https://pharmatap.test/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;
  const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(path==='/.netlify/identity/settings')return json({external:{email:true},disable_signup:Boolean(options.closed),autoconfirm:!options.confirmation},options.settingsError?503:200);
  if(path==='/.netlify/identity/signup'){requests.push({type:'signup',body:request.postDataJSON()});if(options.duplicate)return json({msg:'A user with this email address has already been registered'},422);if(options.closeOnSubmit)return json({msg:'Signups not allowed for this instance'},403);return json(identityUser);}
  if(path==='/.netlify/identity/token'){requests.push({type:'login'});return json({access_token:'test-token',refresh_token:'test-refresh',expires_in:3600,token_type:'bearer'});}
  if(path==='/.netlify/identity/user')return json(identityUser);
  if(path==='/.netlify/identity/logout')return json({});
  if(path==='/api/workspace/initialise'){requests.push({type:'initialise'});return options.workspaceError?json({error:'Temporarily unavailable'},503):json({initialised:false});}
  if(path==='/api/workspace/session')return json({pharmacies:[],organisations:[]});
  if(path.startsWith('/api/'))throw new Error('Unexpected privileged workspace request: '+path);
  const file=['/','/register','/register/'].includes(path)?'workspace.html':path.slice(1);
  try{const body=await readFile('dist/'+file);return route.fulfill({body,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.woff2')?'font/woff2':'image/svg+xml'});}catch{return route.fulfill({status:404,body:'Not found'});}
 });
 const fill=async()=>{await page.getByLabel('Name',{exact:true}).fill('Pharmacy Demo');await page.getByLabel('Email',{exact:true}).fill('demo@pharmacy.com');await page.getByLabel('Password',{exact:true}).fill('test-password-only');await page.getByLabel('Confirm password',{exact:true}).fill('test-password-only');};
 try{await run({page,requests,fill});assert.deepEqual(errors,[]);}finally{await context.close();}
}
try{
 await scenario({},async({page,requests,fill})=>{
  await page.goto('https://pharmatap.test/');await page.getByRole('link',{name:'Create account',exact:true}).click();assert.equal(new URL(page.url()).pathname,'/register');await fill();
  await page.getByLabel('Confirm password',{exact:true}).fill('different-password');await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByText('Your passwords do not match.').waitFor();assert.equal(requests.length,0);
  await page.getByLabel('Confirm password',{exact:true}).fill('test-password-only');await page.screenshot({path:output+'/registration-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByRole('heading',{name:'Access pending'}).waitFor();
  assert.deepEqual(requests.map(r=>r.type),['signup','login','initialise']);assert.deepEqual(requests[0].body.data,{full_name:'Pharmacy Demo'});assert.equal(requests[0].body.email,'demo@pharmacy.com');
  assert.equal(await page.locator('#navigation-root').count(),0);await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('heading',{name:'Sign in',exact:true}).waitFor();
 });
 await scenario({confirmation:true},async({page,requests,fill})=>{await page.goto('https://pharmatap.test/register/');await fill();await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByText('Check your email to confirm your account, then sign in.').waitFor();assert.deepEqual(requests.map(r=>r.type),['signup']);assert.equal(await page.locator('[name=password]').inputValue(),'');await page.getByRole('link',{name:'Sign in',exact:true}).click();await page.getByRole('heading',{name:'Sign in',exact:true}).waitFor();});
 await scenario({closed:true},async({page,requests})=>{await page.goto('https://pharmatap.test/register');await page.getByText(/Registration is currently closed/).waitFor();assert.equal(await page.locator('#registration').isVisible(),false);await page.getByRole('link',{name:'Sign in',exact:true}).click();assert.equal(await page.getByRole('link',{name:'Create account'}).isVisible(),false);assert.equal(requests.length,0);});
 for(const options of [{duplicate:true},{closeOnSubmit:true}])await scenario(options,async({page,requests,fill})=>{await page.goto('https://pharmatap.test/register');await fill();await page.getByRole('button',{name:'Create account',exact:true}).click();await page.locator('#registration-error').filter({hasText:options.duplicate?'already been registered':'Signups not allowed'}).waitFor();assert.equal(await page.getByRole('button',{name:'Create account',exact:true}).isEnabled(),true);assert.deepEqual(requests.map(r=>r.type),['signup']);});
 await scenario({workspaceError:true},async({page,requests,fill})=>{await page.goto('https://pharmatap.test/register');await fill();await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByRole('heading',{name:'Account created',exact:true}).waitFor();assert.equal(requests.filter(r=>r.type==='signup').length,1);assert.equal(await page.locator('#registration').count(),0);});
 await scenario({settingsError:true},async({page,requests})=>{await page.goto('https://pharmatap.test/register');await page.getByText('Registration is unavailable. Please reload to try again.').waitFor();assert.equal(await page.locator('#registration').isVisible(),false);assert.equal(requests.length,0);});
 console.log('Registration smoke passed: live SDK with mocked transport; open/closed registration, password mismatch, auto-confirm login, confirmation email flow, duplicate email, settings failure, workspace failure, pending access, sign-out and mobile layout.');
}finally{await browser.close();}
