/* engine3d.js — Three.js 3D side-scrolling engine for Find My Heart (uses LV, A, modal, toast, save from game.js) */
const U=40,rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const PAL=[{g:0xff8fc0,gr:0xff6fa8,fog:0xffb7a0,mt:[0xf59ac0,0xd96fa6],tr:[0xff8fb0,0xffb27a],lt:0xffd2b0,hi:1},
{g:0x6a4fc0,gr:0x9b7bff,fog:0x2a1a5c,mt:[0x3d2a7a,0x2a1a5c],tr:[0x2c2170,0x5b3fb0],lt:0x9a8cff,hi:.6},
{g:0xd24a8a,gr:0xff6fa8,fog:0x4a2060,mt:[0x7a4aa0,0x52307f],tr:[0xffb3d1,0xffd9e8],lt:0xffc0e0,hi:.75}];
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const glow=(col,s)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));m.scale.set(s,s,1);return m};
const OG={g:1,hair:0x1b1117,skin:0xf6d3bd,top:0xfff3f8,arm:0xf6d3bd,leg:0xf6d3bd,shoe:0xff9ec4},OB={hair:0x241a18,skin:0xf1c9ac,top:0xffffff,arm:0xffffff,leg:0xe9e2d6,shoe:0x7a6a8a};
function mkChar(o){const g=new THREE.Group(),n=new THREE.Group();g.add(n);
const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.65}),S=r=>new THREE.SphereGeometry(r,14,10),C=(a,b,h)=>new THREE.CylinderGeometry(a,b,h,12),
mesh=(geo,c,x,y,z,p)=>{const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.castShadow=true;(p||n).add(m);return m},
limb=(x,y,len,r,c,hd)=>{const p=new THREE.Group();p.position.set(x,y,0);n.add(p);mesh(C(r,r*.9,len),c,0,-len/2,0,p);mesh(S(r*1.3),hd,0,-len,0,p);return p};
const legL=limb(-.1,.55,.5,.065,o.leg,o.shoe),legR=limb(.1,.55,.5,.065,o.leg,o.shoe),armL=limb(-.3,1.08,.38,.05,o.arm,o.skin),armR=limb(.3,1.08,.38,.05,o.arm,o.skin);
if(o.g)mesh(new THREE.ConeGeometry(.4,.62,18),o.top,0,.86,0);else mesh(C(.2,.23,.55),o.top,0,.86,0);
const h=new THREE.Group();h.position.y=1.32;n.add(h);mesh(S(.24),o.skin,0,0,0,h);mesh(S(.265),o.hair,0,.04,-.07,h);
if(o.g){mesh(S(.13),o.hair,0,-.1,-.3,h).scale.set(1,1.9,.8);mesh(S(.07),0xff3d7f,.17,.2,-.02,h);mesh(S(.07),0xff3d7f,.04,.27,-.02,h)}
const eyes=[-.085,.085].map(x=>mesh(S(.035),0x222222,x,.02,.225,h));
const mo=mesh(new THREE.TorusGeometry(.05,.01,6,12,Math.PI),0xb0405e,0,-.07,.225,h);mo.rotation.z=Math.PI;
return{g,n,legL,legR,armL,armR,eyes}}
function posec(c,st,t,dt){const w=Math.sin(t*13),k=Math.min(1,dt*16),T={idle:[0,0,.1,-.1],walk:[w*.85,-w*.85,-w*.75,w*.75],jump:[.7,-.3,-2.7,-2.7],fall:[.3,-.3,-2.2,-2.2],land:[.8,.8,-.3,-.3],happy:[0,0,-2.8+Math.sin(t*11)*.35,-2.8-Math.sin(t*11)*.35],hug:[0,0,-1.5,-1.5]}[st];
[c.legL,c.legR,c.armL,c.armR].forEach((p,i)=>p.rotation.x+=(T[i]-p.rotation.x)*k);
const bob=st=='walk'?Math.abs(w)*.05:st=='happy'?Math.abs(Math.sin(t*11))*.12:Math.sin(t*2)*.012,sx=st=='land'?1.15:1,sy=st=='land'?.82:1;
c.n.position.y+=(bob-c.n.position.y)*k;c.n.scale.x+=(sx-c.n.scale.x)*k;c.n.scale.z=c.n.scale.x;c.n.scale.y+=(sy-c.n.scale.y)*k;
const bl=(t%3.2)<.12?.1:1;c.eyes.forEach(e=>e.scale.y=bl)}
const HG=(()=>{const s=new THREE.Shape();s.moveTo(0,-.5);s.bezierCurveTo(-.9,.2,-.5,.9,0,.45);s.bezierCurveTo(.5,.9,.9,.2,0,-.5);const g=new THREE.ExtrudeGeometry(s,{depth:.25,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:2});g.center();g.scale(.5,.5,.5);return g})();

class Eng{
constructor(){const r=this.r=new THREE.WebGLRenderer({antialias:!FX.low});r.setPixelRatio(Math.min(devicePixelRatio||1,FX.low?1:1.75));r.shadowMap.enabled=!FX.low;$('game').appendChild(r.domElement);
this.clk=new THREE.Clock();this.k={};this.paused=true;this.frozen=false;
addEventListener('keydown',e=>{this.k[e.code]=1;if(/Space|Arrow/.test(e.code))e.preventDefault()});addEventListener('keyup',e=>this.k[e.code]=0);
addEventListener('resize',()=>this.rs());this.rs();this.loop=this.loop.bind(this);this.loop()}
rs(){this.r.setSize(innerWidth,innerHeight);if(this.cam){this.cam.aspect=innerWidth/innerHeight;this.cam.updateProjectionMatrix()}}
loop(){requestAnimationFrame(this.loop);const dt=Math.min(this.clk.getDelta(),.05);if(!this.s||this.paused)return;this.step(dt);this.r.render(this.s,this.cam)}
pts(n,sz,col,fog){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));const p=new THREE.Points(g,new THREE.PointsMaterial({size:sz,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:fog!==false,fog:false}));p.frustumCulled=false;return p}
tree(x,y,z,s,P){const g=new THREE.Group(),m=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9}),tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,2.4,7),m(0x6b3a4a));tr.position.y=1.2;tr.castShadow=true;g.add(tr);
for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(.9,1.4),1),m(P.tr[i%2]));c.position.set(rnd(-.9,.9),2.9+rnd(-.3,.9),rnd(-.5,.5));c.castShadow=true;g.add(c)}
g.position.set(x,y,z);g.scale.setScalar(s);this.s.add(g);const ph=rnd(0,6);this.U.push(t=>g.rotation.z=Math.sin(t*.8+ph)*.025)}
start(l){const L=this.L=LV[l],P=PAL[l],S=this.s=new THREE.Scene(),W=L.W/U;this.li=l;this.cnt=0;this.frozen=this.over=this.cine=this.hug=this.cw=false;this.paused=false;this.gateOn=false;this.inv=0;this.t=0;this.hT=0;this.lT=0;this.shk=0;this.U=[];this.gl=null;
$('fade').style.opacity=0;A.setMode(0);
const cam=this.cam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,400);cam.position.set(2,4,12.5);this.cz=12.5;
const sc=document.createElement('canvas');sc.width=2;sc.height=256;const cx=sc.getContext('2d'),gd=cx.createLinearGradient(0,0,0,256);L.sky.forEach((c,i)=>gd.addColorStop(i/(L.sky.length-1),c));cx.fillStyle=gd;cx.fillRect(0,0,2,256);S.background=new THREE.CanvasTexture(sc);S.fog=new THREE.Fog(P.fog,35,130);
this.hl=new THREE.HemisphereLight(P.lt,0x554466,P.hi);S.add(this.hl);const dl=this.dl=new THREE.DirectionalLight(0xffffff,P.hi*.9);dl.castShadow=!FX.low;dl.shadow.mapSize.set(1024,1024);Object.assign(dl.shadow.camera,{left:-18,right:18,top:14,bottom:-10,near:1,far:70});dl.shadow.camera.updateProjectionMatrix();S.add(dl,dl.target);
const M=(c,e)=>new THREE.MeshStandardMaterial({color:c,roughness:.85,emissive:e||0}),em=c=>l?new THREE.Color(c).multiplyScalar(.22):0;
// far scenery
const bg=new THREE.Mesh(new THREE.BoxGeometry(W+120,2,40),M(new THREE.Color(P.mt[1]).multiplyScalar(.7)));bg.position.set(W/2,-1.2,-22);S.add(bg);
for(let i=-4;i<W/9+6;i++){const h=rnd(10,20),m=new THREE.Mesh(new THREE.ConeGeometry(rnd(7,12),h,5),new THREE.MeshBasicMaterial({color:P.mt[0]}));m.position.set(i*10+rnd(-3,3),h/2-2,-55);S.add(m)}
for(let i=-2;i<W/6+4;i++){const h=rnd(4,8),m=new THREE.Mesh(new THREE.SphereGeometry(rnd(5,8),12,8),new THREE.MeshBasicMaterial({color:P.mt[1]}));m.scale.y=h/7;m.position.set(i*7+rnd(-2,2),-3,-32);S.add(m)}
for(let x=2;x<W;x+=5)this.tree(x+rnd(-1,1),0,rnd(-10,-6),rnd(1.5,2.2),P);
// platforms
this.P=[];const fl=[];
L.P.forEach(p=>{const w=p[2]/U,top=(500-p[1])/U,h=p[1]>=500?3:.6,x0=p[0]/U,m=new THREE.Mesh(new THREE.BoxGeometry(w,h,3.4),M(P.g,em(P.g))),gr=new THREE.Mesh(new THREE.BoxGeometry(w+.1,.2,3.5),M(P.gr,em(P.gr)));
m.position.set(x0+w/2,top-h/2,0);gr.position.set(x0+w/2,top-.08,0);[m,gr].forEach(o=>{o.castShadow=o.receiveShadow=true;S.add(o)});this.P.push({x0,x1:x0+w,top,bot:top-h});
if(p[1]>=500){for(let fx=x0+.8;fx<x0+w-.5;fx+=.55)fl.push([fx+rnd(-.2,.2),top,rnd(-1.5,1.6)]);for(let tx=x0+5;tx<x0+w-2;tx+=9.5)this.tree(tx,top,rnd(-1.4,-.8),1,P)}});
L.M.forEach(q=>{const w=q[2]/U,x0=q[0]/U,top=(500-q[1])/U,m=new THREE.Mesh(new THREE.BoxGeometry(w,.5,2.6),M(0xffffff,P.gr));m.position.set(x0+w/2,top-.25,0);m.castShadow=true;S.add(m);this.P.push({x0,x1:x0+w,top,bot:top-.5,mv:1,a:x0,b:x0+q[3]/U,s:q[4]/U,d:1,dx:0,m,w})});
// flowers (instanced, swaying)
const hd=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,8,6),M(0xffffff,l?0x331133:0),fl.length),st=new THREE.InstancedMesh(new THREE.CylinderGeometry(.015,.015,.4,4),M(0x4f9a5a),fl.length),pal=[[0xff6fa8,0xffd27a,0xffffff],[0xb48cff,0x7fd8ff,0xff9ec4],[0xff3d6f,0xff9ec4,0xffffff]][l],d=new THREE.Object3D();
fl.forEach((f,i)=>{hd.setColorAt(i,new THREE.Color(pal[i%3]));d.position.set(f[0],f[1]+.2,f[2]);d.updateMatrix();st.setMatrixAt(i,d.matrix)});S.add(hd,st);
this.U.push(t=>{fl.forEach((f,i)=>{const s=Math.sin(t*1.6+i);d.position.set(f[0]+s*.05,f[1]+.4,f[2]);d.rotation.z=s*.2;d.updateMatrix();hd.setMatrixAt(i,d.matrix)});hd.instanceMatrix.needsUpdate=true});
// sky rig: sun/moon, stars, petals, fireflies (follows camera)
const rig=this.rig=new THREE.Group();S.add(rig);
const sm=new THREE.Mesh(new THREE.SphereGeometry(l?5:7,24,16),new THREE.MeshBasicMaterial({color:l?0xfff2c2:0xffd27a,fog:false}));sm.position.set(16,l?22:9,-90);rig.add(sm);const sg=glow(l?0xfff2c2:0xffb070,l?45:60);sg.position.copy(sm.position);rig.add(sg);
if(l){const n=FX.low?120:320,s=this.pts(n,2,0xffffff,false),a=s.geometry.attributes.position;for(let i=0;i<n;i++)a.setXYZ(i,rnd(-90,90),rnd(0,60),-85);rig.add(s);this.U.push(t=>s.material.opacity=.6+Math.sin(t*3)*.4);
if(!FX.low){const ss=new THREE.Mesh(new THREE.BoxGeometry(5,.06,.06),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));ss.visible=false;rig.add(ss);let nx=3;this.U.push(t=>{if(t>nx){nx=t+rnd(4,7);ss.visible=true;ss.userData.t0=t;ss.position.set(rnd(-30,10),rnd(25,45),-80);ss.rotation.z=-.5}if(ss.visible){const q=t-ss.userData.t0;ss.position.x+=.9;ss.position.y-=.5;if(q>.8)ss.visible=false}})}}
if(l!=1){const n=FX.low?30:90,p=this.pts(n,.18,0xffc2dc),a=p.geometry.attributes.position,v=[];for(let i=0;i<n;i++){a.setXYZ(i,rnd(-16,16),rnd(-1,12),rnd(-5,5));v.push(rnd(.4,1))}rig.add(p);this.U.push((t,dt)=>{for(let i=0;i<n;i++){let y=a.getY(i)-v[i]*dt;if(y<-1)y=12;a.setXYZ(i,a.getX(i)+Math.sin(t+i)*dt*.8,y,a.getZ(i))}a.needsUpdate=true})}
if(l==1&&!FX.low){const n=50,p=this.pts(n,.25,0xfff3a0),a=p.geometry.attributes.position,s=[];for(let i=0;i<n;i++){a.setXYZ(i,rnd(-14,14),rnd(.5,5),rnd(-3,4));s.push(rnd(0,9))}rig.add(p);this.U.push(t=>{for(let i=0;i<n;i++)a.setXYZ(i,a.getX(i)+Math.sin(t*.7+s[i])*.01,a.getY(i)+Math.cos(t*.9+s[i])*.008,a.getZ(i));a.needsUpdate=true;p.material.opacity=.6+Math.sin(t*4)*.3})}
// clouds
if(l!=1)for(let i=0;i<9;i++){const g=new THREE.Group(),mt=new THREE.MeshBasicMaterial({color:l?0xcdb8ff:0xffe0ee,transparent:true,opacity:l?.3:.85,fog:false});for(let j=0;j<5;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(rnd(1.5,2.6),10,8),mt);c.position.set(j*2-4,rnd(-.4,.4),0);c.scale.y=.6;g.add(c)}g.position.set(rnd(-20,W+20),rnd(12,22),rnd(-60,-35));S.add(g);this.U.push((t,dt)=>{g.position.x+=dt*.6;if(g.position.x>W+30)g.position.x=-30})}
// butterflies (level 1)
if(l==0)for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.35,.25),new THREE.MeshBasicMaterial({color:[0xff9ec4,0xffd27a,0xffffff][i%3],side:THREE.DoubleSide})),bx=rnd(6,W-6);S.add(m);this.U.push(t=>{m.position.set(bx+Math.sin(t*.5+i)*3,1.8+Math.sin(t*.8+i*2)*.8,Math.cos(t*.6+i)*1.5+.8);m.rotation.y=Math.sin(t*20+i)*1.1;m.rotation.z=Math.sin(t*.5+i)*.4})}
// lanterns + fountain (level 3)
if(l==2){for(let x=6;x<W;x+=8){const y=rnd(4.5,6.5),g=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),new THREE.MeshBasicMaterial({color:0xffc060})),h=glow(0xffc060,3);g.position.set(x,y,-.8);h.position.copy(g.position);S.add(g,h);this.U.push(t=>{const o=Math.sin(t+x)*.15;g.position.y=y+o;h.position.y=y+o})}
const fx=1770/U,b=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.4,.6,16),M(0xcdbbe0));b.position.set(fx,.3,-.3);S.add(b);const n=70,p=this.pts(n,.14,0x9fd8ff),a=p.geometry.attributes.position,vx=[],vz=[];for(let i=0;i<n;i++){vx.push(rnd(-1,1));vz.push(rnd(-.6,.6))}S.add(p);this.U.push(t=>{for(let i=0;i<n;i++){const q=(t*1.1+i/n)%1;a.setXYZ(i,fx+vx[i]*q*1.3,.6+q*3.6*(1-q)*2.2,-.3+vz[i]*q)}a.needsUpdate=true})}
// thorns, orbs
(L.T||[]).forEach(x=>{const g=new THREE.Group();[-.18,0,.18].forEach((o,i)=>{const c=new THREE.Mesh(new THREE.ConeGeometry(.13,.55-i%2*.12,6),M(0x9b2d5e,0x330011));c.position.set(o,.28,0);g.add(c)});g.position.set(x/U,0,0);S.add(g)});
this.orbs=(L.B||[]).map(b=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.38,0),M(0x7a3cc9,0x5b2aa0)),h=glow(0xb48cff,2);m.castShadow=true;S.add(m,h);return{m,h,x:b[0]/U,a:b[0]/U,b:(b[0]+b[2])/U,y:(500-b[1])/U,d:1}});
// hearts
this.hearts=[];const np=L.P.length,per=Math.ceil(L.H/np);
for(let i=0;i<L.H;i++){const p=L.P[i%np],j=Math.floor(i/np)+1,x=(p[0]+p[2]*j/(per+1))/U,y=(500-p[1])/U+1.25,m=new THREE.Mesh(HG,M(0xff3d7f,0xff1e66)),h=glow(0xff4d8d,1.8);S.add(m,h);this.hearts.push({m,h,x,y,i})}
// photos
this.phs=L.ph.map(p=>{const g=new THREE.Group(),f=new THREE.Mesh(new THREE.BoxGeometry(.7,.85,.06),M(0xffffff,0x888888)),im=new THREE.Mesh(new THREE.PlaneGeometry(.55,.55),new THREE.MeshBasicMaterial({color:0xff9ec4}));im.position.set(0,.06,.04);g.add(f,im);const h=glow(0xffe9a8,2.2);S.add(g,h);return{g,h,x:p[0]/U,y:(500-p[1])/U,d:p}});
// goal
const gx=L.e/U;this.gx=gx;
if(L.boy){this.boy=mkChar(OB);this.boy.g.position.set(gx,0,0);this.boy.g.rotation.y=-Math.PI/2;S.add(this.boy.g)}
else{const r=new THREE.Mesh(new THREE.TorusGeometry(1.1,.1,10,32),new THREE.MeshBasicMaterial({color:0xffe9a8})),h=glow(0xffe9a8,5);r.position.set(gx,1.6,0);h.position.copy(r.position);S.add(r,h);this.gate=[r,h];this.U.push(t=>{const k=this.gateOn?1:.3;r.material.opacity=1;h.material.opacity=k*(.7+Math.sin(t*3)*.3);h.visible=true;r.rotation.y=t})}
// player
this.p={x:60/U,y:1.2,vx:0,vy:0,face:1,g:false,coy:0,jh:false,ride:null,wasAir:false};this.safe={x:this.p.x,y:.3,t:0};this.pc=mkChar(OG);S.add(this.pc.g);this.pc.g.rotation.y=Math.PI/2;
// burst particle pool
const N=500;this.N=N;this.pp=this.pts(N,.28,0xffffff);this.pp.material.vertexColors=true;this.pp.material.color.set(0xffffff);this.pp.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*3),3));this.pv=new Float32Array(N*4);this.pl=new Float32Array(N);this.pc3=new Float32Array(N*3);S.add(this.pp);
this.upd();toast(L.n)}
burst(x,y,n,r,g,b,up,sp){const a=this.pp.geometry.attributes.position;let c=0;for(let i=0;i<this.N&&c<n;i++)if(this.pl[i]<=0){a.setXYZ(i,x,y,rnd(-.3,.3));const an=rnd(0,6.283),s=rnd(.5,1)*(sp||4);this.pv[i*4]=Math.cos(an)*s;this.pv[i*4+1]=Math.sin(an)*s+(up||0);this.pv[i*4+2]=rnd(-1,1);this.pv[i*4+3]=up?-1:5;this.pl[i]=rnd(.6,1.2);this.pc3.set([r,g,b],i*3);c++}}
upd(){$('lv').textContent=this.L.n;$('hc').textContent=`❤️ ${this.cnt}/${this.L.H}`}
plus(x,y){const v=new THREE.Vector3(x,y,0).project(this.cam),e=document.createElement('div');e.className='plus';e.textContent='+1';e.style.left=(v.x*.5+.5)*innerWidth+'px';e.style.top=(-v.y*.5+.5)*innerHeight+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),900)}
freeze(f){this.frozen=f}
photo(i,msg,b,cb){this.freeze(true);A.fx('win');modal(polHtml(i,msg),b,()=>{this.freeze(false);cb&&cb()})}
collect(h){this.s.remove(h.m,h.h);this.hearts.splice(this.hearts.indexOf(h),1);this.burst(h.x,h.y,36,1,.3,.6,0,5);this.burst(h.x,h.y,14,1,1,.7,0,3);this.plus(h.x,h.y+.5);this.shk=.25;this.hT=.5;this.cnt++;A.fx('heart');this.upd();{const e=$('hc');e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
if(this.cnt>=this.L.H){this.gateOn=true;
if(this.li==0)this.photo(1,'Every beautiful story has a beginning. And I\'m so happy ours started.','CONTINUE',()=>toast('Walk to the glowing heart ➜'));
else toast(this.L.boy?'All hearts! Go find him ❤️':'All hearts! Reach the glowing heart ➜')}}
hurt(){if(this.t<this.inv||this.over)return;this.inv=this.t+1.3;A.fx('hurt');toast('Oops! Try again 💕');const p=this.p;p.x=this.safe.x;p.y=this.safe.y+.1;p.vx=p.vy=0;p.ride=null}
finish(){this.over=true;this.p.vx=0;
if(this.li==2)return this.photo(5,'You are my favorite person, today and always.','CONTINUE',()=>this.doCine());
A.fx('win');this.cz=8.5;this.burst(this.p.x,this.p.y+1,60,1,.5,.8,3,5);save.u=Math.max(save.u,this.li+2);store();this.frozen=true;
modal(`<h2>Level complete! ✨</h2><p class="note">${this.li==0?'Our story is just getting started…':'Almost there, my love…'}</p>`,'NEXT LEVEL →',()=>{$('fade').style.opacity=1;setTimeout(()=>this.start(this.li+1),700)})}
doCine(){this.frozen=true;this.over=true;this.cine=true;A.setMode(1);const p=this.p,b=this.boy;p.x=this.gx-1.6;p.y=0;p.vx=p.vy=0;p.ride=null;const mx=(p.x+this.gx)/2;this.cf=mx;this.cz=5.4;
const gl=this.gl=glow(0xffc2dc,0.01);gl.position.set(mx,1.4,-.6);this.s.add(gl);
(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));p.face=1;await W(1500);this.cw=true;await W(1100);this.cw=false;this.hug=true;A.fx('win');
await W(7000);$('fade').style.opacity=1;await W(1300);save.u=3;store();hide('hud');hide('touch');showEnd();this.paused=true;$('fade').style.opacity=0})()}
phys(dt){const p=this.p,k=this.k,l=k.ArrowLeft||k.KeyA||T.l,r=k.ArrowRight||k.KeyD||T.r,j=k.ArrowUp||k.KeyW||k.Space||T.j;
p.vx=l?-5.8:r?5.8:0;if(l)p.face=-1;else if(r)p.face=1;
this.P.forEach(q=>{if(q.mv){q.dx=q.s*q.d*dt;q.x0+=q.dx;q.x1+=q.dx;if(q.x0>=q.b)q.d=-1;if(q.x0<=q.a)q.d=1;q.m.position.x=q.x0+q.w/2}});
if(p.ride)p.x+=p.ride.dx||0;p.x=cl(p.x+p.vx*dt,.3,this.L.W/U-.3);
for(const q of this.P)if(p.y<q.top-.12&&p.y+1.4>q.bot&&p.x+.3>q.x0&&p.x-.3<q.x1)p.x=p.x<(q.x0+q.x1)/2?q.x0-.3:q.x1+.3;
const pv=p.y;p.vy-=27.5*dt;p.y+=p.vy*dt;p.g=false;p.ride=null;
for(const q of this.P)if(p.x+.3>q.x0&&p.x-.3<q.x1){if(p.vy<=0&&pv>=q.top-.08&&p.y<=q.top){p.y=q.top;p.vy=0;p.g=true;p.ride=q}else if(p.vy>0&&pv+1.4<=q.bot+.08&&p.y+1.4>q.bot){p.y=q.bot-1.4;p.vy=0}}
p.coy=p.g?.12:p.coy-dt;
if(j&&!p.jh&&p.coy>0){p.vy=14.8;p.coy=0;p.g=false;A.fx('jump');this.pc.n.scale.set(.8,1.25,.8);this.burst(p.x,p.y+.1,8,1,.7,.9,0,2)}p.jh=j;if(!j&&p.vy>5)p.vy-=60*dt;
if(p.g&&p.wasAir){this.lT=.14;this.burst(p.x,p.y+.1,10,1,.8,.9,0,2)}p.wasAir=!p.g;
if(p.g&&!p.ride.mv&&this.t-this.safe.t>.3){this.safe={x:p.x-p.face*.4,y:p.y,t:this.t}}
if(p.y<-9)this.hurt();
for(const x of this.L.T)if(Math.abs(p.x-x/U)<.5&&p.y<.6)this.hurt();
this.orbs.forEach(o=>{o.x+=o.d*1.75*dt;if(o.x>=o.b)o.d=-1;if(o.x<=o.a)o.d=1;if(Math.hypot(p.x-o.x,p.y+.7-o.y)<.8)this.hurt()});
for(const h of this.hearts.slice())if(Math.hypot(p.x-h.x,p.y+.7-h.y)<.95)this.collect(h);
for(const q of this.phs.slice())if(Math.hypot(p.x-q.x,p.y+.7-q.y)<1){this.phs.splice(this.phs.indexOf(q),1);this.s.remove(q.g,q.h);this.photo(q.d[2],q.d[3],'CONTINUE')}
if(Math.abs(p.x-this.gx)<1.75){if(this.gateOn)this.finish();else if(this.t-(this.ht||0)>3){this.ht=this.t;toast('Collect all the hearts first! ❤️')}}}
step(dt){this.t+=dt;const t=this.t,p=this.p,pc=this.pc;if(!this.frozen&&!this.over)this.phys(dt);
this.U.forEach(f=>f(t,dt));this.hT-=dt;this.lT-=dt;
const sp=(c,a)=>c.g.rotation.y+=(a-c.g.rotation.y)*Math.min(1,dt*12);
if(this.cine){const b=this.boy,bx=b.g.position.x,mx=this.cf;if(this.cw){p.x+=.5*dt;b.g.position.x=Math.max(mx+.3,bx-.5*dt)}
const st=this.hug?'hug':this.cw?'walk':'idle';
pc.g.position.set(this.hug?mx-.25:p.x,p.y,0);if(this.hug)b.g.position.x+=(mx+.25-b.g.position.x)*Math.min(1,dt*3);sp(pc,Math.PI/2);sp(b,-Math.PI/2);
posec(pc,st,t,dt);posec(b,this.hug?'hug':this.cw?'walk':'happy',t,dt);
if(this.hug){this.burst(mx+rnd(-1.5,1.5),rnd(.2,2.5),6,1,.4,.7,1.8,1.2);this.burst(mx+rnd(-3,3),rnd(3,5),3,1,.8,.9,-.4,.4);if(this.gl){const s=this.gl.scale.x;this.gl.scale.setScalar(s+(16-s)*dt*.6);this.gl.material.opacity=.9}this.hl.intensity+=(1.3-this.hl.intensity)*dt*.8}}
else{const st=this.hT>0?'happy':!p.g?(p.vy>0?'jump':'fall'):this.lT>0?'land':p.vx?'walk':'idle';pc.g.position.set(p.x,p.y,0);sp(pc,p.face>0?Math.PI/2:-Math.PI/2);posec(pc,st,t,dt);pc.g.visible=this.t>=this.inv||Math.floor(t*14)%2==0;
if(this.boy){sp(this.boy,-Math.PI/2);posec(this.boy,this.gateOn?'happy':'idle',t,dt)}}
// objects
this.hearts.forEach(h=>{h.m.position.set(h.x,h.y+Math.sin(t*2+h.i)*.12,0);h.m.rotation.y=t*2+h.i;h.h.position.copy(h.m.position)});
this.phs.forEach(q=>{q.g.position.set(q.x,q.y+Math.sin(t*2)*.12,0);q.g.rotation.y=Math.sin(t*1.5)*.5;q.h.position.copy(q.g.position)});
this.orbs.forEach(o=>{o.m.position.set(o.x,o.y,0);o.m.rotation.x=t*2;o.m.rotation.y=t*1.5;o.h.position.copy(o.m.position)});
// particles
const a=this.pp.geometry.attributes.position,c=this.pp.geometry.attributes.color;for(let i=0;i<this.N;i++){if(this.pl[i]>0){this.pl[i]-=dt;const v=this.pv;a.setXYZ(i,a.getX(i)+v[i*4]*dt,a.getY(i)+v[i*4+1]*dt,a.getZ(i)+v[i*4+2]*dt);v[i*4+1]-=v[i*4+3]*dt;const f=Math.max(0,this.pl[i]);c.setXYZ(i,this.pc3[i*3]*f,this.pc3[i*3+1]*f,this.pc3[i*3+2]*f)}else c.setXYZ(i,0,0,0)}a.needsUpdate=c.needsUpdate=true;
// camera
const cam=this.cam,fx=this.cine?this.cf:p.x+p.face*1.6,fy=this.cine?1.6:2.9+Math.max(0,p.y*.4),k=Math.min(1,dt*(this.cine?1.3:4));this.cz+=((this.cine?5.4:12.5)-this.cz)*(this.cine?Math.min(1,dt*1.1):Math.min(1,dt*3));
cam.position.x+=(fx-cam.position.x)*k;cam.position.y+=(fy+(this.cine?0:1)-cam.position.y)*k;cam.position.z=this.cz;this.shk=Math.max(0,this.shk-dt);const sh=this.shk*.5;
cam.position.x+=rnd(-sh,sh)*.2;cam.lookAt(cam.position.x,cam.position.y-(this.cine?.2:1.4),0);
this.rig.position.x=cam.position.x;this.dl.position.set(cam.position.x+8,18,14);this.dl.target.position.set(cam.position.x,0,0)}}
