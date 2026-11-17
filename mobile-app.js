/* Gestione Ore - navigazione PWA mobile. Si applica solo al layout, non ai dati. */
(function(){
  'use strict';
  const mq=window.matchMedia('(max-width:760px)');
  const buttons=[
    ['home','fa-house','Home'],
    ['agenda','fa-calendar-days','Agenda'],
    ['ore','fa-clock','Ore'],
    ['rep','fa-phone-volume','Rep.'],
    ['more','fa-bars','Altro']
  ];
  let current='home',queued=false,observer;
  const $=s=>document.querySelector(s);
  function setActive(id){
    current=id;
    document.querySelectorAll('.ore-app-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
    const title=$('#oreMobilePageName');
    if(title)title.textContent=({home:'Gestione Ore',agenda:'Agenda',ore:'Ore e ticket',rep:'Reperibilità',more:'Impostazioni'})[id]||'Gestione Ore';
  }
  function menu(open){
    document.body.classList.toggle('ore-app-menu',!!open);
    const shade=$('.ore-app-shade');
    if(shade)shade.hidden=!open;
    const btn=$('#oreMobileMenuButton');if(btn)btn.setAttribute('aria-expanded',String(!!open));
  }
  function goto(id){
    if(!mq.matches)return;
    if(id==='more'){menu(!document.body.classList.contains('ore-app-menu'));return;}
    menu(false);
    const cover=$('#coverScreen');if(cover)cover.classList.add('hidden');
    if(typeof window.closeStats==='function')window.closeStats();
    if(id==='home'){
      if(typeof window.showCover==='function')window.showCover();
      window.scrollTo({top:0,behavior:'smooth'});
    }else if(id==='rep'){
      if(typeof window.showRepPage==='function')window.showRepPage();
      window.scrollTo({top:0,behavior:'smooth'});
    }else{
      if(typeof window.hideRepPage==='function')window.hideRepPage();
      const target=id==='agenda'?$('#agendaHome'):$('#secOre');
      if(id==='ore'&&target&&!target.classList.contains('open')){
        const header=target.previousElementSibling;
        if(header&&header.click)header.click();
      }
      if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'smooth'}));
    }
    setActive(id);
  }
  function prepareRows(){
    const cells=['Data','Lavorato','Ferie','Uscita e ore','Reperibilità','Recupero','Note','Azioni'];
    document.querySelectorAll('.month-card table tbody tr').forEach(tr=>{
      [...tr.children].forEach((td,i)=>{
        if(td.tagName!=='TD')return;
        const label=cells[i]||'';
        if(td.dataset.appLabel!==label)td.dataset.appLabel=label;
      });
    });
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(mq.matches)prepareRows();});}
  function start(){
    if(!$('.main')||$('.ore-app-nav'))return;
    const header=document.createElement('header');
    header.className='ore-app-top';
    header.innerHTML='<div class="ore-app-title"><strong id="oreMobilePageName">Gestione Ore</strong><small>DaFragu · App mobile</small></div><div class="ore-app-actions"><button id="oreMobileHomeButton" type="button" aria-label="Torna alla copertina"><i class="fa-solid fa-house"></i></button><button id="oreMobileMenuButton" type="button" aria-label="Apri impostazioni" aria-expanded="false"><i class="fa-solid fa-sliders"></i></button></div>';
    const shade=document.createElement('div');shade.className='ore-app-shade';shade.hidden=true;
    const nav=document.createElement('nav');nav.className='ore-app-nav';nav.setAttribute('aria-label','Navigazione mobile');
    nav.innerHTML=buttons.map(([id,icon,label])=>'<button type="button" data-view="'+id+'" aria-label="'+label+'"><i class="fa-solid '+icon+'"></i><span>'+label+'</span></button>').join('');
    document.body.append(header,shade,nav);
    nav.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)goto(b.dataset.view);});
    $('#oreMobileMenuButton').addEventListener('click',()=>goto('more'));
    $('#oreMobileHomeButton').addEventListener('click',()=>goto('home'));
    shade.addEventListener('click',()=>menu(false));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false);});
    const side=$('.side');
    if(side)side.addEventListener('click',e=>{
      if(e.target.closest('#coverBtn')){menu(false);setActive('home');}
      else if(e.target.closest('#repPageBtn')){menu(false);setActive('rep');}
      else if(e.target.closest('[onclick*="openStats"]')){menu(false);setActive('more');}
    });
    let startY=null;
    if(side){
      side.addEventListener('touchstart',e=>{startY=side.scrollTop<=0?e.touches[0].clientY:null;},{passive:true});
      side.addEventListener('touchmove',e=>{if(startY!==null&&e.touches[0].clientY-startY>100){startY=null;menu(false);}},{passive:true});
      side.addEventListener('touchend',()=>{startY=null;},{passive:true});
    }
    const grid=$('#monthsGrid');
    if(grid){observer=new MutationObserver(schedule);observer.observe(grid,{childList:true,subtree:true});}
    mq.addEventListener?.('change',()=>{menu(false);schedule();});
    setActive('home');schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();