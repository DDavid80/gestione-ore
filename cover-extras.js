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
      position:absolute;top:16px;right:16px;z-index:20;
      display:inline-flex;align-items:center;gap:8px;
      padding:8px 12px;border-radius:999px;cursor:pointer;
      border:1px solid rgba(255,255,255,.2);
      background:rgba(6,14,24,.78);color:#d7ecf7;
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
      position:absolute;border-radius:50%;filter:blur(48px);opacity:.55;
      animation:orbFloat 18s ease-in-out infinite alternate;
    }
    #coverSmartFx .orb.o1{width:42vw;height:42vw;min-width:280px;min-height:280px;left:-12%;top:-18%;background:radial-gradient(circle,rgba(56,189,248,.55),transparent 70%);animation-duration:22s}
    #coverSmartFx .orb.o2{width:36vw;height:36vw;min-width:240px;min-height:240px;right:-10%;top:8%;background:radial-gradient(circle,rgba(168,85,247,.4),transparent 70%);animation-duration:26s;animation-delay:-4s}
    #coverSmartFx .orb.o3{width:38vw;height:38vw;min-width:220px;min-height:220px;left:20%;bottom:-22%;background:radial-gradient(circle,rgba(16,185,129,.32),transparent 70%);animation-duration:20s;animation-delay:-8s}
    #coverSmartFx .orb.o4{width:28vw;height:28vw;min-width:180px;min-height:180px;right:18%;bottom:10%;background:radial-gradient(circle,rgba(244,114,182,.28),transparent 70%);animation-duration:24s;animation-delay:-2s}
    @keyframes orbFloat{
      0%{transform:translate(0,0) scale(1)}
      50%{transform:translate(3%,4%) scale(1.08)}
      100%{transform:translate(-2%,-3%) scale(.96)}
    }

    #coverScreen.smart-mode .cover-bg{
      background:linear-gradient(145deg,#020812 0%,#06101c 45%,#040a12 100%)!important;
    }
    #coverScreen.smart-mode .cover-bg::before{opacity:.12!important}

    #coverSmartClockPill{
      display:none;
      align-items:center;gap:12px;
      margin:0 0 8px;
      padding:10px 16px;
      border-radius:999px;
      width:fit-content;
      max-width:100%;
      border:1px solid rgba(54,207,225,.28);
      background:linear-gradient(120deg,rgba(8,24,36,.72),rgba(12,18,30,.55));
      backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
      box-shadow:0 8px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08);
    }
    #coverScreen.smart-mode #coverSmartClockPill{display:inline-flex}
    #coverSmartClockPill .time{
      font:800 clamp(1.15rem,2.8vw,1.55rem)/1 ui-monospace,SFMono-Regular,Menlo,monospace;
      color:#e8fbff;letter-spacing:.04em;
      text-shadow:0 0 24px rgba(54,207,225,.35);
    }
    #coverSmartClockPill .sep{
      width:1px;height:18px;background:rgba(255,255,255,.15);
    }
    #coverSmartClockPill .label{
      font:700 10px/1.2 system-ui;letter-spacing:.12em;text-transform:uppercase;color:#7dd3e8;
    }

    #coverScreen.smart-mode .cover-month-card{
      border:1px solid rgba(54,207,225,.32)!important;
      box-shadow:
        0 24px 64px rgba(0,0,0,.4),
        0 0 0 1px rgba(255,255,255,.04) inset,
        0 0 48px rgba(54,207,225,.08)!important;
      position:relative;
      overflow:hidden;
      animation:cardIn .7s cubic-bezier(.2,.8,.2,1) both;
    }
    #coverScreen.smart-mode .cover-month-card::after{
      content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;
      background:linear-gradient(135deg,rgba(54,207,225,.18),transparent 42%,transparent 58%,rgba(168,85,247,.12));
      opacity:.85;
    }
    @keyframes cardIn{
      from{opacity:0;transform:translateY(18px) scale(.98)}
      to{opacity:1;transform:none}
    }

    #coverScreen.smart-mode .cover-stat{
      transition:transform .22s cubic-bezier(.2,.8,.2,1),border-color .22s,box-shadow .22s!important;
    }
    #coverScreen.smart-mode .cover-stat:hover{
      transform:translateY(-3px) scale(1.02)!important;
      box-shadow:0 14px 32px rgba(0,0,0,.35),0 0 24px color-mix(in srgb,var(--cover-neon,#36cfe1) 20%,transparent)!important;
    }
    #coverScreen.smart-mode .cover-btn{
      position:relative;overflow:hidden;
      box-shadow:0 12px 36px rgba(244,140,60,.25)!important;
    }
    #coverScreen.smart-mode .cover-btn::after{
      content:"";position:absolute;inset:0;
      background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.22) 50%,transparent 75%);
      transform:translateX(-130%);
      animation:shimmer 3.4s ease-in-out infinite;
    }
    @keyframes shimmer{
      0%,45%{transform:translateX(-130%)}
      70%{transform:translateX(130%)}
      100%{transform:translateX(130%)}
    }
    #coverScreen.smart-mode .cover-hero{
      animation:heroIn .65s cubic-bezier(.2,.8,.2,1) .05s both;
    }
    @keyframes heroIn{
      from{opacity:0;transform:translateY(12px)}
      to{opacity:1;transform:none}
    }
    #coverScreen.smart-mode .cover-toprow{
      animation:heroIn .5s cubic-bezier(.2,.8,.2,1) both;
    }

    @media(max-width:900px){
      #coverSmartToggle{
        position:fixed!important;
        top:max(10px,env(safe-area-inset-top));
        right:12px;
        z-index:30;
        padding:7px 10px;font-size:10px;
      }
      #coverScreen.smart-mode .cover-inner{
        display:flex!important;
        flex-direction:column!important;
        align-items:stretch!important;
        justify-content:flex-start!important;
        gap:14px!important;
        padding:56px 14px 28px!important;
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
        padding-bottom:12px!important;
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
        min-height:44px;
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
        margin:4px 0 0!important;
      }
      #coverScreen.smart-mode .cover-stats{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }
    @media(max-width:420px){
      #coverSmartClockPill .time{font-size:1.2rem}
      #coverScreen.smart-mode .cover-inner{padding:52px 12px 24px!important;gap:12px!important}
    }
    @media(prefers-reduced-motion:reduce){
      #coverSmartFx .orb,
      #coverScreen.smart-mode .cover-month-card,
      #coverScreen.smart-mode .cover-hero,
      #coverScreen.smart-mode .cover-toprow,
      #coverScreen.smart-mode .cover-btn::after{animation:none!important}
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
