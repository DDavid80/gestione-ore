(()=>{
  const formatEuro=value=>Number(value||0).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
  const SMART_KEY='gestione_ore_cover_smart_v1';
  const isSmart=()=>{try{return localStorage.getItem(SMART_KEY)==='1'}catch(e){return false}};
  const setSmart=on=>{try{localStorage.setItem(SMART_KEY,on?'1':'0')}catch(e){}};

  const style=document.createElement('style');
  style.textContent=`
    #coverStats>.cover-stat[data-total-euro-mese]:last-child:nth-child(odd){grid-column:1 / -1;width:calc((100% - 12px)/2);justify-self:center;}
    #agendaKpis>.agenda-kpi[data-total-euro-mese]:last-child:nth-child(odd){grid-column:1 / -1;width:calc((100% - 12px)/2);justify-self:center;}
    @media(max-width:760px){
      #coverStats>.cover-stat[data-total-euro-mese]:last-child:nth-child(odd),
      #agendaKpis>.agenda-kpi[data-total-euro-mese]:last-child:nth-child(odd){width:100%;grid-column:1 / -1;}
    }
    #coverSmartToggle{position:absolute;top:18px;right:18px;z-index:5;display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;cursor:pointer;border:1px solid rgba(255,255,255,.18);background:rgba(8,18,28,.72);color:#d7ecf7;font:700 11px/1 system-ui;letter-spacing:.06em;text-transform:uppercase;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;user-select:none;}
    #coverSmartToggle:hover{transform:translateY(-1px);border-color:rgba(54,207,225,.55);box-shadow:0 8px 24px rgba(0,0,0,.25)}
    #coverSmartToggle .dot{width:8px;height:8px;border-radius:50%;background:#64748b;transition:.25s}
    #coverSmartToggle.on .dot{background:#36cfe1;box-shadow:0 0 12px #36cfe1aa}
    #coverSmartToggle.on{border-color:rgba(54,207,225,.45);color:#e8fbff}
    #coverScreen.smart-mode .cover-bg{background:radial-gradient(ellipse 80% 60% at 12% 18%,rgba(56,189,248,.22),transparent 55%),radial-gradient(ellipse 70% 50% at 88% 12%,rgba(168,85,247,.18),transparent 50%),radial-gradient(ellipse 60% 45% at 70% 88%,rgba(16,185,129,.14),transparent 48%),radial-gradient(ellipse 50% 40% at 20% 80%,rgba(244,114,182,.10),transparent 45%),linear-gradient(145deg,#020812 0%,#071423 50%,#050b15 100%)!important;animation:smartAurora 14s ease-in-out infinite alternate;}
    #coverScreen.smart-mode .cover-bg::before{opacity:.22!important;animation:smartGrid 22s linear infinite;}
    @keyframes smartAurora{0%{filter:hue-rotate(0deg) saturate(1)}50%{filter:hue-rotate(12deg) saturate(1.15)}100%{filter:hue-rotate(-8deg) saturate(1.05)}}
    @keyframes smartGrid{from{background-position:0 0,0 0}to{background-position:84px 84px,84px 84px}}
    #coverScreen.smart-mode .cover-month-card{border:1px solid rgba(54,207,225,.28)!important;box-shadow:0 20px 60px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12),0 0 40px rgba(54,207,225,.06)!important;position:relative;overflow:hidden;}
    #coverScreen.smart-mode .cover-month-card::before{content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(54,207,225,.15),transparent 40%,transparent 60%,rgba(168,85,247,.12));opacity:.7;}
    #coverScreen.smart-mode .cover-stat{transition:transform .22s cubic-bezier(.2,.8,.2,1),border-color .22s,box-shadow .22s!important;}
    #coverScreen.smart-mode .cover-stat:hover{transform:translateY(-4px) scale(1.02)!important;border-color:color-mix(in srgb,var(--cover-neon,#36cfe1) 90%,transparent)!important;box-shadow:0 16px 36px rgba(0,0,0,.35),0 0 28px color-mix(in srgb,var(--cover-neon,#36cfe1) 22%,transparent)!important;}
    #coverScreen.smart-mode .cover-shortcuts button{transition:transform .18s ease,box-shadow .18s!important;}
    #coverScreen.smart-mode .cover-shortcuts button:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.28);}
    #coverScreen.smart-mode .cover-btn{position:relative;overflow:hidden;}
    #coverScreen.smart-mode .cover-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);transform:translateX(-120%);animation:smartShimmer 3.2s ease-in-out infinite;}
    @keyframes smartShimmer{0%,40%{transform:translateX(-120%)}70%{transform:translateX(120%)}100%{transform:translateX(120%)}}
    #coverSmartBar{display:none;grid-column:1 / -1;margin:0 0 4px;padding:12px 14px;border-radius:14px;border:1px solid rgba(54,207,225,.22);background:linear-gradient(120deg,rgba(8,24,36,.85),rgba(12,18,30,.75));gap:14px;align-items:center;}
    #coverScreen.smart-mode #coverSmartBar{display:grid;grid-template-columns:auto 1fr auto;gap:12px 16px}
    #coverSmartClock{font:800 clamp(1.1rem,2.4vw,1.55rem)/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#e8fbff;letter-spacing:.02em;min-width:5.2ch;}
    #coverSmartClock small{display:block;font:700 9px system-ui;letter-spacing:.14em;color:#7dd3e8;text-transform:uppercase;margin-bottom:3px}
    #coverSmartInsight{font-size:.78rem;color:#b8cddc;line-height:1.35}
    #coverSmartInsight strong{color:#eafaff}
    #coverSmartProgress{display:flex;flex-direction:column;gap:5px;min-width:120px}
    #coverSmartProgress .lbl{font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:#8aa3b6;font-weight:700}
    #coverSmartProgress .track{height:7px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
    #coverSmartProgress .fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#36cfe1,#a855f7);width:0%;transition:width .6s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 12px rgba(54,207,225,.4)}
    #coverSmartProgress .val{font-size:.72rem;font-weight:800;color:#c8e9f5}
    @media(max-width:720px){#coverSmartToggle{top:12px;right:12px;padding:7px 10px;font-size:10px}#coverScreen.smart-mode #coverSmartBar{grid-template-columns:1fr 1fr;grid-template-rows:auto auto}#coverSmartProgress{grid-column:1 / -1}}
    @media(prefers-reduced-motion:reduce){#coverScreen.smart-mode .cover-bg,#coverScreen.smart-mode .cover-bg::before,#coverScreen.smart-mode .cover-btn::after{animation:none!important}}
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
    updateSmartBar();
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
    const screen=document.getElementById('coverScreen');if(!screen)return;
    let toggle=document.getElementById('coverSmartToggle');
    if(!toggle){
      toggle=document.createElement('button');toggle.id='coverSmartToggle';toggle.type='button';
      toggle.innerHTML='<span class="dot"></span><span class="lbl">Cover Smart</span>';
      toggle.title='Attiva/disattiva Cover Smart (animazioni + insight)';
      screen.appendChild(toggle);
      toggle.addEventListener('click',e=>{e.stopPropagation();const next=!isSmart();setSmart(next);applySmartMode(next);});
    }
    let bar=document.getElementById('coverSmartBar');
    if(!bar){
      bar=document.createElement('div');bar.id='coverSmartBar';
      bar.innerHTML='<div id="coverSmartClock"><small>Ora locale</small><span class="time">--:--:--</span></div><div id="coverSmartInsight">Caricamento insight…</div><div id="coverSmartProgress"><div class="lbl">Progresso mese</div><div class="track"><div class="fill" id="coverSmartFill"></div></div><div class="val" id="coverSmartProgVal">—</div></div>';
      const inner=screen.querySelector('.cover-inner'),heroSec=screen.querySelector('.cover-hero');
      if(inner&&heroSec)inner.insertBefore(bar,heroSec);else if(inner)inner.prepend(bar);
    }
    applySmartMode(isSmart());startClock();updateSmartBar();
  }

  function applySmartMode(on){
    const screen=document.getElementById('coverScreen'),toggle=document.getElementById('coverSmartToggle');
    if(screen)screen.classList.toggle('smart-mode',!!on);
    if(toggle){toggle.classList.toggle('on',!!on);const lbl=toggle.querySelector('.lbl');if(lbl)lbl.textContent=on?'Smart ON':'Cover Smart';}
  }

  let clockTimer=null;
  function startClock(){
    const tick=()=>{const el=document.querySelector('#coverSmartClock .time');if(!el)return;el.textContent=new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});};
    tick();if(clockTimer)clearInterval(clockTimer);clockTimer=setInterval(tick,1000);
  }

  function updateSmartBar(){
    const insight=document.getElementById('coverSmartInsight'),fill=document.getElementById('coverSmartFill'),progVal=document.getElementById('coverSmartProgVal');
    if(!insight)return;
    if(typeof monthTotals!=='function'||typeof ensureYear!=='function'){insight.textContent='Insight disponibili dopo il caricamento dati.';return;}
    const today=new Date(),year=today.getFullYear(),mIdx=today.getMonth();
    const previous=typeof currentYear!=='undefined'?currentYear:year;
    let t={ore:0,euro:0},worked=0;
    try{if(typeof currentYear!=='undefined')currentYear=year;ensureYear(year);t=monthTotals(mIdx);worked=typeof workedDays==='function'?workedDays(mIdx):0;}catch(e){}
    finally{if(typeof currentYear!=='undefined')currentYear=previous;}
    const dayOfMonth=today.getDate(),daysInMonth=new Date(year,mIdx+1,0).getDate();
    const remainingWorkApprox=Math.max(0,Math.round(Math.max(0,daysInMonth-dayOfMonth)*5/7));
    const avgH=worked>0?(t.ore/worked):0,projected=t.ore+(avgH*remainingWorkApprox);
    const progressPct=Math.min(100,Math.round((dayOfMonth/daysInMonth)*100));
    if(fill)fill.style.width=progressPct+'%';
    if(progVal)progVal.textContent='Giorno '+dayOfMonth+'/'+daysInMonth+' · '+progressPct+'%';
    const parts=[];
    parts.push('<strong>'+t.ore.toFixed(1)+' h</strong> registrate');
    if(worked>0)parts.push('media <strong>'+avgH.toFixed(1)+' h/gg</strong> su '+worked+' gg');
    if(avgH>0&&remainingWorkApprox>0)parts.push('proiezione mese ~ <strong>'+projected.toFixed(0)+' h</strong>');
    if(t.euro>0)parts.push('guadagno <strong>'+formatEuro(t.euro)+'</strong>');
    insight.innerHTML=parts.join(' · ')||'Inizia a registrare le ore per vedere gli insight.';
  }

  const boot=()=>{if(document.getElementById('coverScreen'))ensureSmartUI();else setTimeout(boot,120);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  if(typeof showCover==='function'){const _show=showCover;showCover=function(){const r=_show.apply(this,arguments);ensureSmartUI();updateSmartBar();return r;};}
  if(typeof initCover==='function'){const _init=initCover;initCover=function(){const r=_init.apply(this,arguments);ensureSmartUI();updateSmartBar();return r;};}
})();
