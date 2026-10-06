import {getSettings,signup,login} from '@netlify/identity';

export async function registrationForm(root:HTMLElement,openWorkspace:()=>Promise<void>,back:()=>void){
 root.innerHTML='<section class="card login"><h1>Create account</h1><p class="muted">Your pharmacy workspace.</p><p id="registration-status" role="status">Checking registration…</p><form id="registration" hidden><label>Name<input name="name" autocomplete="name" maxlength="120" required></label><label>Email<input name="email" type="email" autocomplete="username" maxlength="254" required></label><label>Password<input name="password" type="password" autocomplete="new-password" minlength="12" aria-describedby="password-hint" required></label><p class="help" id="password-hint">Use at least 12 characters.</p><label>Confirm password<input name="confirm" type="password" autocomplete="new-password" minlength="12" required></label><p class="error" id="registration-error" role="alert"></p><button type="submit">Create account</button></form><p class="help">Already have an account? <a class="auth-link" href="/workspace.html" id="registration-back">Sign in</a></p></section>';
 const form=root.querySelector<HTMLFormElement>('#registration')!,status=root.querySelector<HTMLElement>('#registration-status')!,error=root.querySelector<HTMLElement>('#registration-error')!;
 root.querySelector('#registration-back')!.addEventListener('click',e=>{e.preventDefault();back();});
 try{
  const settings=await getSettings();if(!form.isConnected)return;
  if(settings.disableSignup){status.textContent='Registration is currently closed. Please contact your administrator for an account.';return;}
  status.textContent='';form.hidden=false;
 }catch{
  if(form.isConnected){status.textContent='Registration is unavailable. Please reload to try again.';}return;
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();const button=form.querySelector<HTMLButtonElement>('button')!;
  if(button.disabled||!form.reportValidity())return;
  const fields=new FormData(form),name=String(fields.get('name')).trim(),email=String(fields.get('email')).trim().toLowerCase(),password=String(fields.get('password'));
  error.textContent='';
  if(!name){error.textContent='Enter your name.';return;}
  if(password!==fields.get('confirm')){error.textContent='Your passwords do not match.';return;}
  button.disabled=true;button.textContent='Creating account…';
  let verified=false;
  try{
   const user=await signup(email,password,{full_name:name});verified=Boolean(user.confirmedAt);
  }catch(e){
   if(form.isConnected){error.textContent=(e as Error).message||'Unable to create your account. Please try again.';button.disabled=false;button.textContent='Create account';}return;
  }
  form.reset();form.hidden=true;
  if(!verified){status.textContent='Check your email to confirm your account, then sign in.';return;}
  status.textContent='Account created. Opening your workspace…';
  try{await login(email,password);await openWorkspace();}catch{
   // Registration has succeeded: never ask the user to submit it a second time.
   root.innerHTML='<section class="card login"><h1>Account created</h1><p>Your account is ready, but the workspace could not be opened. Reload to try again.</p><a class="auth-link" href="/workspace.html">Open workspace</a></section>';
  }
 });
}
