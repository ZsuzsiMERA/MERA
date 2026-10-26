const portals = [
 {name:'Instagram',url:'https://www.instagram.com/its_merababy/',x:174,y:318,w:156,h:523,hinge:'left'},
 {name:'Facebook',url:'https://www.facebook.com/itsmerababy',x:511,y:397,w:246,h:444,double:true},
 {name:'TikTok',url:'https://www.tiktok.com/@its_merababy',x:872,y:364,w:178,h:477,hinge:'right',shape:'polygon(0 10%,12% 9%,25% 6%,38% 1%,50% 0,62% 1%,75% 6%,88% 9%,100% 10%,100% 100%,0 100%)'},
 {name:'Pinterest',url:'https://www.pinterest.com/itsmerababy/',x:1245,y:337,w:160,h:496,hinge:'right'}
];
const svgCrop = (asset,x,y,w,h) => `<svg viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><image href="assets/${asset}" width="1536" height="1024"/></svg>`;
const container = document.querySelector('.gates');
portals.forEach(p => {
 const gate = document.createElement('article'); gate.className = 'gate';
 Object.assign(gate.style,{left:`${p.x/1536*100}%`,top:`${p.y/1024*100}%`,width:`${p.w/1536*100}%`,height:`${p.h/1024*100}%`});
 if(p.shape) gate.style.setProperty('--aperture',p.shape);
 gate.style.setProperty('--hinge',`${p.hinge || 'left'} center`);
 gate.style.setProperty('--angle',p.hinge==='right'?'105deg':'-105deg');
 let leaves;
 if(p.double){leaves = `<div class="leaf left-half">${svgCrop('palace-closed.png',p.x,p.y,p.w/2,p.h)}</div><div class="leaf right-half">${svgCrop('palace-closed.png',p.x+p.w/2,p.y,p.w/2,p.h)}</div>`;}
 else{leaves = `<div class="leaf">${svgCrop('palace-closed.png',p.x,p.y,p.w,p.h)}</div>`;}
 gate.innerHTML = `<div class="interior">${svgCrop('palace-open.png',p.x,p.y,p.w,p.h)}</div>${leaves}<a class="gate-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-expanded="false" aria-label="${p.name} kapu kinyitása"></a>`;
 container.append(gate);
 const link = gate.querySelector('.gate-link'); let pinned = false;
 const open = value => {gate.classList.toggle('open',value);link.setAttribute('aria-expanded',String(value));link.setAttribute('aria-label',value?`${p.name} – MERA profil megnyitása új lapon`:`${p.name} kapu kinyitása`);};
 gate.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')open(true)});
 gate.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pinned)open(false)});
 link.addEventListener('click',e=>{if(!gate.classList.contains('open')){e.preventDefault();pinned=true;open(true)}});
 link.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;open(false)}if(e.key===' '){e.preventDefault();pinned=!gate.classList.contains('open');open(pinned)}});
});
