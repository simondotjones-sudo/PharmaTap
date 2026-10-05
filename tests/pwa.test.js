import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';

const source=await readFile('pwa.js','utf8');
function setup(installed=false){
 const window=new Window({url:'https://pharmatap.test/'});
 window.matchMedia=()=>({matches:installed,addEventListener(){}});
 window.eval(source);
 return window;
}
function offer(window,prompt=async()=>{}){
 const event=new window.Event('beforeinstallprompt',{cancelable:true});
 event.prompt=prompt;event.userChoice=Promise.resolve({outcome:'accepted'});
 window.dispatchEvent(event);return event;
}
test('installation appears when eligible and native prompt requires the Install click',async()=>{
 const window=setup();let prompts=0;
 try{
  const event=offer(window,async()=>{prompts++;});
  assert.equal(event.defaultPrevented,true);assert.equal(prompts,0);
  assert.ok(window.document.querySelector('#install-prompt'));
  window.document.querySelector('#install-app').click();
  await new Promise(r=>setTimeout(r,0));assert.equal(prompts,1);
  assert.equal(window.document.querySelector('#install-prompt'),null);
 }finally{await window.happyDOM.abort();}
});
test('Not now suppresses repeated prompts in the current session',async()=>{
 const window=setup();
 try{
  offer(window);window.document.querySelector('#install-later').click();offer(window);
  assert.equal(window.document.querySelector('#install-prompt'),null);
 }finally{await window.happyDOM.abort();}
});
test('installed app stays clear of the installation prompt',async()=>{
 const window=setup(true);
 try{offer(window);assert.equal(window.document.querySelector('#install-prompt'),null);}
 finally{await window.happyDOM.abort();}
});
