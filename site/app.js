'use strict';
(() => {
 const $ = s => document.querySelector(s);
 const facebook = 'https://www.facebook.com/FindTheCashNz/';
 const menu=$('#menu-toggle'),nav=$('#primary-menu');
 if(menu&&nav){
   menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
   nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
 }
 if($('#year')) $('#year').textContent=String(new Date().getFullYear());
 const key='find-the-cash-nz-checklist-v1';
 const checks=[...document.querySelectorAll('[data-kit]')];
 let saved={};
 try {saved=JSON.parse(localStorage.getItem(key)||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={}} catch {saved={}}
 const render=()=>{const ready=checks.filter(c=>c.checked).length;if($('#kit-progress'))$('#kit-progress').textContent=ready+' / '+checks.length+' READY';if($('#progress-fill'))$('#progress-fill').style.width=(100*ready/Math.max(1,checks.length))+'%'};
 for(const c of checks){c.checked=saved[c.dataset.kit]===true;c.addEventListener('change',()=>{const value={};checks.forEach(x=>value[x.dataset.kit]=x.checked);try{localStorage.setItem(key,JSON.stringify(value))}catch{}render()})}
 $('#reset-kit')?.addEventListener('click',()=>{checks.forEach(c=>c.checked=false);try{localStorage.removeItem(key)}catch{}render()});render();
 const safeUrl=input=>{try{const u=new URL(input);return u.protocol==='https:'&&['facebook.com','www.facebook.com','m.facebook.com'].includes(u.hostname)?u.href:null}catch{return null}};
 const elt=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x};
 async function syncUpdates(){
  const grid=$('#post-grid'),status=$('#sync-status');if(!grid||!status)return;
  try{
   const control=new AbortController(),timeout=setTimeout(()=>control.abort(),6500);let res;
   try{res=await fetch('./updates.json',{cache:'no-store',signal:control.signal})}finally{clearTimeout(timeout)}
   if(!res.ok)return;const data=await res.json();if(data.connected!==true||!Array.isArray(data.posts))return;
   const cards=[];
   for(const p of data.posts.slice(0,6)){if(typeof p.message!=='string')continue;const link=safeUrl(p.url);const msg=p.message.trim().slice(0,1000);if(!link||!msg)continue;
    const card=elt('article','post-card'),image=elt('div','post-art art-green','💚'),body=elt('div','post-body');
    body.append(elt('span','tag','OFFICIAL FACEBOOK UPDATE'));
    if(typeof p.created_at==='string'&&!Number.isNaN(Date.parse(p.created_at)))body.append(elt('time','',new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',day:'numeric',month:'short',year:'numeric'}).format(new Date(p.created_at))));
    body.append(elt('h3','',msg.length>90?msg.slice(0,87)+'…':msg),elt('p','',msg));const a=elt('a','','Read original post ↗');a.href=link;a.target='_blank';a.rel='noopener noreferrer';body.append(a);card.append(image,body);cards.push(card)
   }
   if(cards.length){grid.replaceChildren(...cards);status.textContent='Verified Page posts; always follow original Facebook links for live details.'}
  }catch{status.textContent='For the latest verified clues, visit the official Facebook Page.'}
 }
 syncUpdates();
 let installEvent=null;const strip=$('#install-strip');window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();installEvent=ev;if(strip)strip.hidden=false});
 $('#install-button')?.addEventListener('click',async()=>{if(!installEvent)return;installEvent.prompt();try{await installEvent.userChoice}catch{}installEvent=null;if(strip)strip.hidden=true});
 $('#dismiss-install')?.addEventListener('click',()=>{if(strip)strip.hidden=true});window.addEventListener('appinstalled',()=>{if(strip)strip.hidden=true});
 if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
 window.FindTheCashNZ=Object.freeze({facebook});
})();