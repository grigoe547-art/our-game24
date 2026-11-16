/* FIND MY HEART — photos: assets/images/photo1.jpg … photo6.jpg */
const $=id=>document.getElementById(id),show=id=>$(id).classList.remove('hide'),hide=id=>$(id).classList.add('hide');
const FB='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#ffc2dc"/><stop offset="1" stop-color="#c9b3ff"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><text x="150" y="190" font-size="120" text-anchor="middle">❤️</text></svg>');
const IM=i=>`<img src="assets/images/photo${i}.jpg" onerror="this.onerror=null;this.src=FB" alt="">`;
const CAP=['Where it all began','Every memory with you','My favorite moment','A thousand more to come','Always you','Together forever'];
let save={u:1};try{save=JSON.parse(localStorage.getItem('fmh'))||save}catch(e){}
const store=()=>{try{localStorage.setItem('fmh',JSON.stringify(save))}catch(e){}};
const FX={low:false};try{FX.low=localStorage.getItem('fmhfx')=='1'}catch(e){}
const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
function goFS(){const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;try{if(f&&!document.fullscreenElement&&!document.webkitFullscreenElement)Promise.resolve(f.call(d)).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{})}catch(e){}}
document.addEventListener('pointerdown',()=>{if(isTouch)goFS()});
const T={l:0,r:0,j:0};
function showErr(m){let d=$('err');if(!d){d=document.createElement('div');d.id='err';d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:999;background:#400;color:#fff;font:12px monospace;padding:8px;max-height:40%;overflow:auto;user-select:text';document.body.appendChild(d)}d.textContent+=m+'\n'}
addEventListener('error',ev=>showErr('Error: '+ev.message+' ('+(ev.filename||'').split('/').pop()+':'+ev.lineno+')'));
addEventListener('unhandledrejection',ev=>showErr('Promise: '+ev.reason));let SC=null,tt;
function toast(s){const e=$('toast');e.textContent=s;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2600)}
function modal(h,b,cb){const m=$('modal');m.innerHTML=`<div class="card">${h}<button class="big">${b}</button></div>`;show('modal');m.querySelector('button').onclick=()=>{hide('modal');cb&&cb()}}
const polHtml=(i,msg)=>`<figure class="pol">${IM(i)}<figcaption>${CAP[i-1]}</figcaption></figure><p class="note">${msg}</p>`;

/* ---------- AUDIO (synthesised, starts only after first click) ---------- */
const A={ctx:null,music:true,sf:true,mode:0,step:0,timer:null,
init(){if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.loop()}if(this.ctx.state=='suspended')this.ctx.resume()},
tone(f,d,v,t='triangle',at=0){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),s=c.currentTime+at;o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+d)},
loop(){clearInterval(this.timer);const ch=[[261,329,392,523],[220,261,329,440],[174,220,261,349],[196,246,293,392]];
this.timer=setInterval(()=>{if(!this.music)return;const c=ch[Math.floor(this.step/4)%4];this.tone(c[this.step%4]*(this.mode?2:1),1.8,.07);if(this.step%4==0)this.tone(c[0]/2,2.4,.06);this.step++},this.mode?700:430)},
setMode(m){this.mode=m;if(this.ctx)this.loop()},
fx(n){if(!this.sf||!this.ctx)return;const t=this.tone.bind(this);
if(n=='heart'){t(880,.2,.14,'sine');t(1320,.25,.1,'sine',.08)}
else if(n=='jump')t(420,.18,.08,'square');
else if(n=='hurt'){t(200,.3,.12,'sawtooth')}
else{[523,659,784,1047].forEach((f,i)=>t(f,.5,.12,'sine',i*.12))}}};
document.addEventListener('pointerdown',()=>A.init());
document.querySelectorAll('.bm').forEach(b=>b.onclick=()=>{A.init();A.music=!A.music;document.querySelectorAll('.bm').forEach(x=>x.style.opacity=A.music?1:.4)});
document.querySelectorAll('.bs').forEach(b=>b.onclick=()=>{A.sf=!A.sf;document.querySelectorAll('.bs').forEach(x=>x.style.opacity=A.sf?1:.4)});

/* ---------- LEVELS ---------- */
// P platforms [x,top,w]; T thorns [x] on ground; M moving [x,y,w,range,speed]; B orbs [x,y,range]; photos [x,y,idx,msg]
const LV=[
{n:'Level 1 · The Beginning 🌸',sky:['#ff9ec4','#ffcf9a'],gt:0xff8fc0,sun:1,H:10,W:2500,e:2380,dec:['🌸','🌷','🌼'],tree:1,
P:[[0,500,700],[800,500,500],[1400,500,600],[2100,500,400],[1000,400,150],[1700,390,150]],T:[500,1150,1900],M:[],B:[],ph:[]},
{n:'Level 2 · Our Memories 💕',sky:['#1a1040','#5b2a86','#c76db0'],gt:0x9b7bff,H:15,W:3000,e:2900,dec:['✨','🌷','🌺'],tree:1,
P:[[0,500,500],[650,430,160],[900,360,160],[1150,430,160],[1400,500,300],[1800,420,150],[2050,340,150],[2300,420,150],[2550,500,500]],T:[300,1500,2750],M:[[1700,430,90,100,70]],B:[[1450,470,150]],
ph:[[980,320,2,'One of my favorite moments with you.'],[2125,300,3,'I wish I could relive this moment a thousand times.'],[2620,460,4,'Every memory with you is special.']]},
{n:'Level 3 · Together Forever ❤️',sky:['#0d0828','#3b1a66','#ff7fb5'],gt:0xff6fa8,H:20,W:3400,e:3320,dec:['🌹','🌹','💗'],tree:1,boy:1,
P:[[0,500,400],[520,440,140],[740,380,140],[960,320,140],[1180,380,140],[1400,440,140],[1620,500,300],[2000,430,130],[2200,360,130],[2400,430,130],[2600,500,800]],T:[300,1800,2900,3100],M:[],B:[[1650,470,250],[2750,470,350]],ph:[]}];

/* ---------- UI ---------- */
function pols(el){el.innerHTML=CAP.map((c,i)=>`<figure class="pol" onclick="zoom(${i+1})">${IM(i+1)}<figcaption>${c}</figcaption></figure>`).join('')}
function zoom(i){$('lb').innerHTML=`${IM(i)}<p class="note">${CAP[i-1]}</p>`;show('lb')}
$('lb').onclick=()=>hide('lb');
function showEnd(){pols($('egrid'));hide('gal');show('end');$('end').scrollTop=0;A.setMode(1)}
function play(l){hide('menu');hide('end');hide('gal');show('hud');if(isTouch)show('touch');goFS();if(typeof THREE=='undefined'){showErr('Three.js did not load - check your internet connection.');return}try{if(!SC)SC=new Eng();SC.start(l)}catch(e){showErr('Start failed: '+e.message+' '+(e.stack||'').split('\n')[1])}}
$('start').onclick=()=>{A.init();play(Math.min(save.u,3)-1)};
$('mem').onclick=()=>{pols($('grid'));hide('menu');show('gal')};
$('gback').onclick=()=>{hide('gal');show('menu')};
$('again').onclick=()=>{save.u=1;store();play(0)};
$('bp').onclick=()=>{if(SC&&!SC.frozen&&!SC.paused){SC.paused=true;show('pause')}};
$('res').onclick=()=>{hide('pause');SC.paused=false};
$('br').onclick=()=>{if(SC&&!SC.paused)SC.start(SC.li)};
$('rst').onclick=()=>{hide('pause');SC.start(SC.li)};
$('home').onclick=()=>{hide('pause');SC.paused=true;hide('hud');hide('touch');show('menu')};
[['tl','l'],['tr','r'],['tj','j']].forEach(([id,f])=>{const e=$(id);e.addEventListener('pointerdown',ev=>{ev.preventDefault();T[f]=1});['pointerup','pointerleave','pointercancel'].forEach(n=>e.addEventListener(n,()=>T[f]=0))});
for(let i=0;i<18;i++){const s=document.createElement('span');s.textContent='❤';s.style.cssText=`left:${Math.random()*100}%;font-size:${14+Math.random()*26}px;animation-duration:${6+Math.random()*8}s;animation-delay:-${Math.random()*10}s`;$('fl').appendChild(s)}
window.addEventListener('load',()=>setTimeout(()=>$('load').classList.add('off'),900));

document.querySelectorAll('.bf').forEach(b=>{b.style.opacity=FX.low?.4:1;b.onclick=()=>{FX.low=!FX.low;try{localStorage.setItem('fmhfx',FX.low?1:0)}catch(e){}document.querySelectorAll('.bf').forEach(x=>x.style.opacity=FX.low?.4:1);toast(FX.low?'Reduced effects — restart level to apply':'Full effects — restart level to apply')}});
