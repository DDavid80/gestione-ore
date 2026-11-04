(()=>{
  // Usa lo stesso calcolo del registro: ore registrate × tariffa della data.
  const formatEuro=value=>Number(value||0).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
  const SMART_KEY='gestione_ore_cover_smart_v1';
  const isSmart=()=>{try{return localStorage.getItem(SMART_KEY)==='1'}catch(e){return false}};
  const setSmart=on=>{try{localStorage.setItem(SMART_KEY,on?'1':'0')}catch(e){}};

  const style=document.createElement('style');
  style.id='cover-smart-style';
  style.textContent=`
    #coverStats>.cover-stat[data-total-euro-mese]:last-child:nth-child(odd){
      grid-column:1 / -1;width:calc((100% - 12px)/2);justify-self:center;
    }
    #agendaKpis>.agenda-kpi[data-total-euro-mese]:last-child:nth-child(odd){
      grid-column:1 / -1;width:calc((100% - 12px)/2);justify-self:center;
    }
    @media(max-width:760px){
      #coverStats>.cover-stat[data-total-euro-mese]:last-child:nth-child(odd),
      #agendaKpis>.agenda-kpi[data-total-euro-mese]:last-child:nth-child(odd){
        width:100%;grid-column:1 / -1;
      }
    }

    #coverSmartToggle{
      position:absolute;top:16px;right:16px;z-index:40;
      display:inline-flex;align-items:center;gap:8px;
      padding:8px 12px;border-radius:999px;cursor:pointer;
      border:1px solid rgba(255,255,255,.22);
      background:rgba(6,14,24,.82);color:#d7ecf7;
      font:700 11px/1 system-ui;letter-spacing:.07em;text-transform:uppercase;
      backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
      transition:.2s ease;user-select:none;
    }
    #coverSmartToggle:hover{transform:translateY(-1px);border-color:rgba(54,207,225,.55);box-shadow:0 8px 28px rgba(0,0,0,.3)}
    #coverSmartToggle .dot{width:8px;height:8px;border-radius:50%;background:#64748b;transition:.25s}
    #coverSmartToggle.on .dot{background:#36cfe1;box-shadow:0 0 14px #36cfe1cc}
    #coverSmartToggle.on{border-color:rgba(54,207,225,.5);color:#e8fbff}

    #coverSmartFx{display:none;pointer-events:none;position:fixed;inset:0;z-index:0;overflow:hidden}
    #coverScreen.smart-mode #coverSmartFx{display:block}
    #coverSmartFx .orb{
      position:absolute;border-radius:50%;filter:blur(52px);opacity:.6;
      animation:orbFloat 16s ease-in-out infinite alternate;
      will-change:transform;
    }
    #coverSmartFx .orb.o1{width:48vw;height:48vw;min-width:300px;min-height:300px;left:-14%;top:-20%;background:radial-gradient(circle,rgba(56,189,248,.6),transparent 68%);animation-duration:20s}
    #coverSmartFx .orb.o2{width:40vw;height:40vw;min-width:260px;min-height:260px;right:-12%;top:4%;background:radial-gradient(circle,rgba(168,85,247,.48),transparent 68%);animation-duration:24s;animation-delay:-3s}
    #coverSmartFx .orb.o3{width:42vw;height:42vw;min-width:240px;min-height:240px;left:16%;bottom:-26%;background:radial-gradient(circle,rgba(16,185,129,.38),transparent 68%);animation-duration:18s;animation-delay:-7s}
    #coverSmartFx .orb.o4{width:32vw;height:32vw;min-width:200px;min-height:200px;right:12%;bottom:6%;background:radial-gradient(circle,rgba(244,114,182,.34),transparent 68%);animation-duration:22s;animation-delay:-1s}
    #coverSmartFx .spark{
      position:absolute;width:2px;height:2px;border-radius:50%;
      background:#fff;box-shadow:0 0 6px 1px rgba(100,210,255,.8);
      animation:sparkDrift linear infinite;
      opacity:0;
    }
    @keyframes orbFloat{
      0%{transform:translate(0,0) scale(1)}
      50%{transform:translate(4%,5%) scale(1.1)}
      100%{transform:translate(-3%,-4%) scale(.94)}
    }
    @keyframes sparkDrift{
      0%{opacity:0;transform:translateY(20px) scale(.6)}
      15%{opacity:.9}
      85%{opacity:.5}
      100%{opacity:0;transform:translateY(-70vh) scale(1.2)}
    }

    #coverScreen.smart-mode .cover-bg{
      background:linear-gradient(155deg,#01060d 0%,#06101c 42%,#030910 100%)!important;
    }
    #coverScreen.smart-mode .cover-bg::before{
      opacity:.18!important;
      background-size:56px 56px!important;
      animation:gridPulse 12s linear infinite;
    }
    @keyframes gridPulse{
      from{background-position:0 0}
      to{background-position:56px 56px}
    }

    #coverSmartClockPill{
      display:none;
      align-items:center;gap:12px;
      margin:0 0 6px;
      padding:11px 18px;
      border-radius:999px;
      width:fit-content;
      max-width:100%;
      border:1px solid rgba(54,207,225,.32);
      background:linear-gradient(120deg,rgba(8,28,40,.78),rgba(10,16,28,.6));
      backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
      box-shadow:0 10px 36px rgba(0,0,0,.3),0 0 24px rgba(54,207,225,.08),inset 0 1px 0 rgba(255,255,255,.1);
    }
    #coverScreen.smart-mode #coverSmartClockPill{display:inline-flex}
    #coverSmartClockPill .time{
      font:800 clamp(1.2rem,3vw,1.65rem)/1 ui-monospace,SFMono-Regular,Menlo,monospace;
      color:#e8fbff;letter-spacing:.05em;
      text-shadow:0 0 28px rgba(54,207,225,.45);
    }
    #coverSmartClockPill .sep{width:1px;height:18px;background:rgba(255,255,255,.16)}
    #coverSmartClockPill .label{
      font:700 10px/1.2 system-ui;letter-spacing:.14em;text-transform:uppercase;color:#7dd3e8;
    }

    #coverScreen.smart-mode .cover-month-card{
      border:1px solid rgba(54,207,225,.36)!important;
      box-shadow:
        0 28px 70px rgba(0,0,0,.45),
        0 0 0 1px rgba(255,255,255,.05) inset,
        0 0 60px rgba(54,207,225,.1)!important;
      position:relative;
      overflow:hidden;
      animation:cardIn .75s cubic-bezier(.2,.85,.2,1) both;
    }
    #coverScreen.smart-mode .cover-month-card::after{
      content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;
      background:linear-gradient(135deg,rgba(54,207,225,.2),transparent 40%,transparent 60%,rgba(168,85,247,.14));
      opacity:.9;
    }
    @keyframes cardIn{
      from{opacity:0;transform:translateY(22px) scale(.97)}
      to{opacity:1;transform:none}
    }

    #coverScreen.smart-mode .cover-stat{
      transition:transform .22s cubic-bezier(.2,.8,.2,1),border-color .22s,box-shadow .22s!important;
    }
    #coverScreen.smart-mode .cover-stat:hover{
      transform:translateY(-3px) scale(1.025)!important;
      box-shadow:0 16px 36px rgba(0,0,0,.38),0 0 28px color-mix(in srgb,var(--cover-neon,#36cfe1) 24%,transparent)!important;
    }
    #coverScreen.smart-mode .cover-btn{
      position:relative;overflow:hidden;
      box-shadow:0 14px 40px rgba(244,140,60,.3)!important;
    }
    #coverScreen.smart-mode .cover-btn::after{
      content:"";position:absolute;inset:0;
      background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.25) 50%,transparent 80%);
      transform:translateX(-130%);
      animation:shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer{
      0%,40%{transform:translateX(-130%)}
      70%{transform:translateX(130%)}
      100%{transform:translateX(130%)}
    }
    #coverScreen.smart-mode .cover-hero,
    #coverScreen.smart-mode .cover-toprow{
      animation:heroIn .6s cubic-bezier(.2,.85,.2,1) both;
    }
    #coverScreen.smart-mode .cover-hero{animation-delay:.06s}
    @keyframes heroIn{
      from{opacity:0;transform:translateY(14px)}
      to{opacity:1;transform:none}
    }

    #coverSmartCta{
      display:none;
      position:fixed;
      left:12px;right:12px;
      bottom:max(12px,env(safe-area-inset-bottom));
      z-index:50;
      gap:8px;
      padding:0;
      pointer-events:none;
    }
    #coverScreen.smart-mode #coverSmartCta{display:flex;flex-direction:column;pointer-events:auto}
    #coverSmartCta button{
      width:100%;
      min-height:52px;
      border:0;border-radius:14px;
      font:800 15px/1.1 system-ui;
      letter-spacing:.02em;
      cursor:pointer;
      display:flex;align-items:center;justify-content:center;gap:10px;
      box-shadow:0 12px 36px rgba(0,0,0,.45);
      transition:transform .15s ease,filter .15s ease;
    }
    #coverSmartCta button:active{transform:scale(.98)}
    #coverSmartCta .cta-main{
      background:linear-gradient(105deg,#ffb341,#f48e3d);
      color:#16130e;
      box-shadow:0 12px 40px rgba(244,140,60,.4),0 0 24px rgba(255,179,65,.15);
    }
    #coverSmartCta .cta-year{
      background:rgba(12,22,34,.92);
      color:#d5e4f0;
      border:1px solid rgba(255,255,255,.16)!important;
      backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
      min-height:42px;
      font-size:13px;
      font-weight:700;
    }
    @media(max-width:900px){
      #coverScreen.smart-mode .cover-month-card > .cover-btn,
      #coverScreen.smart-mode .cover-month-card > .cover-year-btn{
        display:none!important;
      }
      #coverScreen.smart-mode .cover-inner{
        padding-bottom:calc(130px + env(safe-area-inset-bottom))!important;
      }
    }
    @media(min-width:901px){
      #coverSmartCta{display:none!important}
    }

    @media(max-width:900px){
      #coverSmartToggle{
        position:fixed!important;
        top:max(10px,env(safe-area-inset-top));
        right:12px;
        z-index:50;
        padding:7px 10px;font-size:10px;
      }
      #coverScreen.smart-mode .cover-inner{
        display:flex!important;
        flex-direction:column!important;
        align-items:stretch!important;
        justify-content:flex-start!important;
        gap:12px!important;
        padding:54px 14px 28px!important;
        min-height:100%!important;
        width:100%!important;
        max-width:100%!important;
        grid-template-columns:unset!important;
        grid-template-rows:unset!important;
        grid-auto-rows:unset!important;
      }
      #coverScreen.smart-mode .cover-toprow{
        order:1!important;
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px 12px!important;
        padding-bottom:10px!important;
        margin:0!important;
        border-bottom:1px solid rgba(255,255,255,.1)!important;
      }
      #coverScreen.smart-mode #coverSmartClockPill{
        order:2!important;
        margin:2px 0 0!important;
        width:100%;
        justify-content:center;
        box-sizing:border-box;
      }
      #coverScreen.smart-mode .cover-hero{
        order:3!important;
        margin:0!important;
        padding:0!important;
        max-width:100%!important;
      }
      #coverScreen.smart-mode .cover-hero .cover-overline,
      #coverScreen.smart-mode .cover-hero h1,
      #coverScreen.smart-mode .cover-hero > p{
        display:none!important;
      }
      #coverScreen.smart-mode .cover-hero .cover-shortcuts{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:8px!important;
        margin:0!important;
      }
      #coverScreen.smart-mode .cover-hero .cover-shortcuts button{
        min-height:46px;
      }
      #coverScreen.smart-mode .cover-month-card{
        order:4!important;
        width:100%!important;
        max-width:100%!important;
        margin:0!important;
        justify-self:stretch!important;
        position:relative!important;
        z-index:2!important;
        transform:none!important;
      }
      #coverScreen.smart-mode .cover-foot{
        order:5!important;
        margin:2px 0 0!important;
        opacity:.75;
      }
      #coverScreen.smart-mode .cover-stats{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }
    @media(max-width:420px){
      #coverSmartClockPill .time{font-size:1.2rem}
      #coverScreen.smart-mode .cover-inner{padding-left:12px!important;padding-right:12px!important;gap:10px!important}
      #coverSmartCta button.cta-main{min-height:50px;font-size:14px}
    }
    @media(prefers-reduced-motion:reduce){
      #coverSmartFx .orb,#coverSmartFx .spark,
      #coverScreen.smart-mode .cover-month-card,
      #coverScreen.smart-mode .cover-hero,
      #coverScreen.smart-mode .cover-toprow,
      #coverScreen.smart-mode .cover-btn::after,
      #coverScreen.smart-mode .cover-bg::before{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  const extraCover=()=>{
    const box=document.getElementById('coverStats');
    if(!box||typeof monthTotals!=='function'||typeof ensureYear!=='function')return;
    if([...box.children].filter(el=>el.classList.contains('cover-stat')&&!el.hasAttribute('data-total-euro-mese')).length<4)return;
    const today=new Date(),previous=currentYear;
    let total;
    try{currentYear=today.getFullYear();ensureYear(currentYear);total=monthTotals(today.getMonth()).euro;}
    finally{currentYear=previous;}
    let card=box.querySelector('[data-total-euro-mese]');
    if(!card){card=document.createElement('div');card.className='cover-stat';card.dataset.totalEuroMese='1';card.innerHTML='<div class="ci"><i class="fa-solid fa-euro-sign"></i></div><div class="cv"></div><div class="cl">Totale € mese</div>';box.appendChild(card);}
    const value=formatEuro(total),node=card.querySelector('.cv');if(node.textContent!==value)node.textContent=value;
  };
  const extraAgenda=()=>{
    const box=document.getElementById('agendaKpis');
    if(!box||typeof monthTotals!=='function'||typeof agendaMonthIndex!=='function'||!currentYear)return;
    const total=monthTotals(agendaMonthIndex()).euro;
    let card=box.querySelector('[data-total-euro-mese]');
    if(!card){card=document.createElement('div');card.className='agenda-kpi';card.dataset.totalEuroMese='1';card.style.setProperty('--k','var(--success)');card.innerHTML='<strong></strong><span>Totale € mese</span>';box.appendChild(card);}
    const value=formatEuro(total),node=card.querySelector('strong');if(node.textContent!==value)node.textContent=value;
  };
  if(typeof renderCoverStats==='function'){
    const original=renderCoverStats;
    renderCoverStats=function(){const result=original.apply(this,arguments);extraCover();return result;};
  }
  if(typeof renderAgendaHome==='function'){
    const original=renderAgendaHome;
    renderAgendaHome=function(){const result=original.apply(this,arguments);extraAgenda();return result;};
  }
  extraCover();extraAgenda();
  const observe=(id,refresh)=>{
    const host=document.getElementById(id);if(!host)return;
    let queued=false;
    const watcher=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;try{refresh();}catch(e){console.warn('Aggiornamento totale mese:',e);}});});
    watcher.observe(host,{childList:true,subtree:true});
  };
  observe('coverStats',extraCover);
  observe('agendaKpis',extraAgenda);

  const coverTitle=document.getElementById('coverTitle');
  const sidebarTitle=document.getElementById('brandTitle');
  if(coverTitle){
    coverTitle.contentEditable='true';coverTitle.spellcheck=false;
    coverTitle.setAttribute('role','textbox');
    coverTitle.setAttribute('aria-label','Modifica titolo della dashboard');
    coverTitle.setAttribute('title','Clicca per modificare il titolo · Invio per salvare');
    coverTitle.style.cssText+='cursor:text;outline-offset:5px;min-width:70px;';
    const saveTitle=()=>{
      const title=coverTitle.textContent.trim().replace(/\s+/g,' ').slice(0,80)||'Gestione Ore';
      const brand=typeof loadBrand==='function'?loadBrand():{};
      brand.name=title;
      if(typeof saveBrand==='function')saveBrand(brand);
      coverTitle.textContent=title;
      if(sidebarTitle)sidebarTitle.textContent=title;
      const pageTitle=document.getElementById('pageTitle');
      if(pageTitle)pageTitle.textContent=title+' '+(typeof currentYear!=='undefined'&&currentYear?currentYear:new Date().getFullYear());
    };
    coverTitle.addEventListener('blur',saveTitle);
    coverTitle.addEventListener('keydown',event=>{
      if(event.key==='Enter'){event.preventDefault();coverTitle.blur();}
      if(event.key==='Escape'){event.preventDefault();coverTitle.textContent=(typeof loadBrand==='function'?loadBrand().name:null)||'Gestione Ore';coverTitle.blur();}
    });
    if(sidebarTitle)sidebarTitle.addEventListener('blur',()=>{coverTitle.textContent=sidebarTitle.textContent.trim()||'Gestione Ore';});
  }
  const hero=document.querySelector('#coverScreen .cover-hero h1');
  const heroKey='gestione_ore_cover_hero_v1';
  if(hero){
    const read=()=>{try{return JSON.parse(localStorage.getItem(heroKey))}catch(e){return null}};
    const render=(lines)=>{const first=String(lines[0]||'Il mese,'),second=String(lines[1]||'giorno per giorno.');hero.replaceChildren(document.createTextNode(first),document.createElement('br'),document.createElement('em'));hero.querySelector('em').textContent=second;};
    const saved=read();if(Array.isArray(saved))render(saved);
    hero.setAttribute('title','Clicca per modificare il titolo grande');hero.style.cursor='text';
    hero.addEventListener('click',()=>{
      if(hero.dataset.editing==='1')return;hero.dataset.editing='1';
      const lines=[hero.childNodes[0]?.textContent||'Il mese,',hero.querySelector('em')?.textContent||'giorno per giorno.'];
      const first=document.createElement('input'),second=document.createElement('input');
      first.value=lines[0];second.value=lines[1];
      for(const input of [first,second]){input.maxLength=75;input.style.cssText='display:block;width:100%;box-sizing:border-box;font:inherit;letter-spacing:inherit;color:inherit;background:#0b1f2a;border:1px solid #36cfe1;border-radius:9px;padding:4px 8px;margin:6px 0;';}
      second.style.color='#37cde0';
      const wrap=document.createElement('div'),controls=document.createElement('div');
      controls.style.cssText='display:flex;gap:8px;margin-top:8px;';
      const save=document.createElement('button'),cancel=document.createElement('button');
      save.textContent='Salva';cancel.textContent='Annulla';
      for(const btn of [save,cancel])btn.style.cssText='font:600 14px system-ui;border:1px solid #37cde0;border-radius:8px;padding:8px 15px;cursor:pointer;color:#eafaff;background:#132c37;';
      const finish=shouldSave=>{const next=[first.value.trim(),second.value.trim()];if(shouldSave&&next.every(Boolean)){localStorage.setItem(heroKey,JSON.stringify(next));render(next);}else render(lines);hero.dataset.editing='0';};
      save.onclick=e=>{e.stopPropagation();finish(true)};cancel.onclick=e=>{e.stopPropagation();finish(false)};
      for(const input of [first,second])input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();finish(true)}if(e.key==='Escape'){e.preventDefault();finish(false)}});
      controls.append(save,cancel);wrap.append(first,second,controls);hero.replaceChildren(wrap);first.focus();
    });
  }

  function ensureSmartUI(){
    const screen=document.getElementById('coverScreen');
    if(!screen)return;

    let fx=document.getElementById('coverSmartFx');
    if(!fx){
      fx=document.createElement('div');
      fx.id='coverSmartFx';
      fx.innerHTML='<div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div><div class="orb o4"></div>';
      for(let i=0;i<14;i++){
        const s=document.createElement('div');
        s.className='spark';
        s.style.left=(5+Math.random()*90)+'%';
        s.style.bottom=(-5-Math.random()*15)+'%';
        s.style.animationDuration=(7+Math.random()*10)+'s';
        s.style.animationDelay=(-Math.random()*12)+'s';
        s.style.width=s.style.height=(1+Math.random()*2)+'px';
        fx.appendChild(s);
      }
      screen.insertBefore(fx, screen.firstChild);
    }

    let toggle=document.getElementById('coverSmartToggle');
    if(!toggle){
      toggle=document.createElement('button');
      toggle.id='coverSmartToggle';
      toggle.type='button';
      toggle.innerHTML='<span class="dot"></span><span class="lbl">Cover Smart</span>';
      toggle.title='Attiva/disattiva Cover Smart';
      screen.appendChild(toggle);
      toggle.addEventListener('click',e=>{
        e.stopPropagation();
        const next=!isSmart();
        setSmart(next);
        applySmartMode(next);
      });
    }

    let pill=document.getElementById('coverSmartClockPill');
    if(!pill){
      pill=document.createElement('div');
      pill.id='coverSmartClockPill';
      pill.innerHTML='<span class="time">--:--:--</span><span class="sep"></span><span class="label">Live</span>';
      const inner=screen.querySelector('.cover-inner');
      const heroSec=screen.querySelector('.cover-hero');
      if(inner && heroSec) inner.insertBefore(pill, heroSec);
      else if(inner) inner.prepend(pill);
    }

    let cta=document.getElementById('coverSmartCta');
    if(!cta){
      cta=document.createElement('div');
      cta.id='coverSmartCta';
      cta.innerHTML=
        '<button type="button" class="cta-main" id="coverSmartCtaMain"><span>Apri l\u2019agenda</span><i class="fa-solid fa-arrow-right"></i></button>'+
        '<button type="button" class="cta-year" id="coverSmartCtaYear">Vista annuale</button>';
      screen.appendChild(cta);
      cta.querySelector('#coverSmartCtaMain').addEventListener('click',e=>{
        e.stopPropagation();
        if(typeof enterDashboard==='function') enterDashboard('month');
      });
      cta.querySelector('#coverSmartCtaYear').addEventListener('click',e=>{
        e.stopPropagation();
        if(typeof enterDashboard==='function') enterDashboard('year');
      });
    }

    applySmartMode(isSmart());
    startClock();
  }

  function applySmartMode(on){
    const screen=document.getElementById('coverScreen');
    const toggle=document.getElementById('coverSmartToggle');
    if(screen) screen.classList.toggle('smart-mode', !!on);
    if(toggle){
      toggle.classList.toggle('on', !!on);
      const lbl=toggle.querySelector('.lbl');
      if(lbl) lbl.textContent=on?'Smart ON':'Cover Smart';
    }
  }

  let clockTimer=null;
  function startClock(){
    const tick=()=>{
      const el=document.querySelector('#coverSmartClockPill .time');
      if(!el)return;
      el.textContent=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    };
    tick();
    if(clockTimer) clearInterval(clockTimer);
    clockTimer=setInterval(tick,1000);
  }

  const boot=()=>{
    if(document.getElementById('coverScreen')) ensureSmartUI();
    else setTimeout(boot,120);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();

  if(typeof showCover==='function'){
    const _show=showCover;
    showCover=function(){const r=_show.apply(this,arguments);ensureSmartUI();return r;};
  }
  if(typeof initCover==='function'){
    const _init=initCover;
    initCover=function(){const r=_init.apply(this,arguments);ensureSmartUI();return r;};
  }
})();
