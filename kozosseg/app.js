const portals=[['Instagram',0,'https://www.instagram.com/its_merababy/'],['Facebook',390,'https://www.facebook.com/itsmerababy'],['TikTok',775,'https://www.tiktok.com/@its_merababy'],['Pinterest',1146,'https://www.pinterest.com/itsmerababy/']];
const section=document.querySelector('.portals');
portals.forEach(([name,x,url],i)=>{
 const card=document.createElement('article');card.className='portal'; const dx=[130,510,870,1210][i],dw=[215,205,200,210][i],dy=388,dh=375; const arch='M '+dx+' 763 L '+dx+' 487 Q '+dx+' 388 '+(dx+dw/2)+' 388 Q '+(dx+dw)+' 388 '+(dx+dw)+' 487 L '+(dx+dw)+' 763 Z'; card.style.setProperty('--door-left',((dx-x)/390*100)+'%');card.style.setProperty('--door-width',(dw/390*100)+'%');
 card.innerHTML=`<div class="art"><svg class="scene" viewBox="${x} 285 390 600" role="img" aria-label="${name}: arany virágokkal díszített antik kapu, mögötte meleg fényű mesebeli világ"><image href="assets/mera-portals.png" width="1536" height="1024"/></svg><div class="glow"></div><svg class="closed-scene" viewBox="${x} 285 390 600" aria-hidden="true"><defs><mask id="closed-mask-${i}" maskUnits="userSpaceOnUse" x="${x}" y="285" width="390" height="600"><rect x="${x}" y="285" width="390" height="600" fill="white"/><path d="${arch}" fill="black"/></mask></defs><image href="assets/mera-closed.png" width="1536" height="1024" mask="url(#closed-mask-${i})"/></svg><div class="door" aria-hidden="true"><svg viewBox="${dx} ${dy} ${dw} ${dh}" preserveAspectRatio="none"><defs><clipPath id="door-clip-${i}"><path d="${arch}"/></clipPath></defs><image href="assets/mera-closed.png" width="1536" height="1024" clip-path="url(#door-clip-${i})"/></svg></div><a class="trigger" href="${url}" target="_blank" rel="noopener noreferrer" aria-expanded="false" aria-label="${name} kapu kinyitása"></a></div><p class="caption">0${i+1} · EGY ÚJABB APRÓ CSODA</p><a class="visit" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name} – MERA profil megnyitása új lapon">${name} <span aria-hidden="true">↗</span></a>`;
 section.append(card);
 const trigger=card.querySelector('.trigger');let pinned=false;
 const setOpen=value=>{card.classList.toggle('open',value);trigger.setAttribute('aria-expanded',value);trigger.setAttribute('aria-label',value ? `${name} – MERA profil megnyitása új lapon` : `${name} kapu kinyitása`)};
 card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setOpen(true)});
 card.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pinned)setOpen(false)});
 trigger.addEventListener('click',e=>{if(!card.classList.contains('open')){e.preventDefault();pinned=true;setOpen(true)}});
 trigger.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;setOpen(false)}});
 card.openGate=value=>{pinned=value;setOpen(value)};
});
let allOpen=false;document.querySelector('#all').addEventListener('click',e=>{allOpen=!allOpen;document.querySelectorAll('.portal').forEach(c=>c.openGate(allOpen));e.currentTarget.innerHTML=allOpen?'Csukd be az összes kaput <span aria-hidden="true">↙</span>':'Nyisd ki az összes kaput <span aria-hidden="true">↗</span>';e.currentTarget.setAttribute('aria-pressed',allOpen)});




