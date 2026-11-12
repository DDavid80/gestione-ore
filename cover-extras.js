(()=>{
  const formatEuro=value=>Number(value||0).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
  const SMART_KEY='gestione_ore_cover_smart_v1';
  const isSmart=()=>{try{return localStorage.getItem(SMART_KEY)==='1'}catch(e){return false}};
  const setSmart=on=>{try{localStorage.setItem(SMART_KEY,on?'1':'0')}catch(e){}};

  const style=document.createElement('style');
  style.id='cover-smart-style';
  style.textContent=`
    #coverStats>.cover-stat[data-total-euro-mese]:last-child:nth-child(odd){grid-column:1/-1;width:calc((100% - 12px)/2);justify-self:center}
    #agendaKpis>.agenda-kpi[data-total-euro-mese]:last-child:nth-child(odd){grid-column:1/-1;width:calc((100% - 12px)/2);justify-self:center}
    @media(max-width:760px){
      #coverStats>.cover-stat[data-total-euro-mese]:last-child:nth-child(odd),
      #agendaKpis>.agenda-kpi[data-total-euro-mese]:last-child:nth-child(odd){width:100%;grid-column:1/-1}
    }
    #coverSmartToggle{position:absolute;top:16px;right:16px;z-index:60;display:inline-flex;align-items:center;gap:8px;padding:9px 13px;border-radius:999px;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:rgba(4,10,18,.88);color:#e8f6ff;font:800 11px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:.2s ease;user-select:none;box-shadow:0 8px 28px rgba(0,0,0,.35);}
    #coverSmartToggle:hover{transform:translateY(-1px);border-color:rgba(80,220,255,.6)}
    #coverSmartToggle .dot{width:9px;height:9px;border-radius:50%;background:#64748b;transition:.25s}
    #coverSmartToggle.on .dot{background:#4df0ff;box-shadow:0 0 16px #4df0ff}
    #coverSmartToggle.on{border-color:rgba(77,240,255,.55);color:#eaffff}
    #coverSmartToggle .ver{opacity:.4;font-size:9px;letter-spacing:0;margin-left:2px;font-weight:600;text-transform:none}
    #coverSmartFx{display:none;pointer-events:none;position:fixed;inset:0;z-index:0;overflow:hidden}
    #coverScreen.smart-mode #coverSmartFx{display:block}
    #coverSmartFx .aurora{position:absolute;inset:-20%;background:radial-gradient(ellipse 55% 40% at 15% 20%,rgba(0,200,255,.45),transparent 55%),radial-gradient(ellipse 50% 45% at 85% 15%,rgba(168,85,247,.4),transparent 55%),radial-gradient(ellipse 60% 50% at 50% 90%,rgba(16,185,129,.28),transparent 55%),radial-gradient(ellipse 40% 35% at 70% 60%,rgba(255,100,180,.22),transparent 55%);filter:blur(8px);animation:auroraShift 14s ease-in-out infinite alternate;}
    #coverSmartFx .orb{position:absolute;border-radius:50%;filter:blur(40px);opacity:.7;animation:orbFloat 12s ease-in-out infinite alternate;will-change:transform;}
    #coverSmartFx .orb.o1{width:55vw;height:55vw;min-width:340px;min-height:340px;left:-18%;top:-25%;background:radial-gradient(circle,rgba(0,220,255,.75),transparent 68%);animation-duration:16s}
    #coverSmartFx .orb.o2{width:48vw;height:48vw;min-width:300px;min-height:300px;right:-16%;top:0;background:radial-gradient(circle,rgba(180,70,255,.55),transparent 68%);animation-duration:19s;animation-delay:-2s}
    #coverSmartFx .orb.o3{width:50vw;height:50vw;min-width:280px;min-height:280px;left:10%;bottom:-30%;background:radial-gradient(circle,rgba(20,220,140,.4),transparent 68%);animation-duration:15s;animation-delay:-5s}
    #coverSmartFx .orb.o4{width:36vw;height:36vw;min-width:220px;min-height:220px;right:8%;bottom:5%;background:radial-gradient(circle,rgba(255,90,160,.4),transparent 68%);animation-duration:17s;animation-delay:-1s}
    #coverSmartFx .beam{position:absolute;width:2px;height:140%;top:-20%;left:50%;background:linear-gradient(180deg,transparent,rgba(120,230,255,.35),transparent);transform-origin:center top;opacity:.35;animation:beamSpin 22s linear infinite;}
    #coverSmartFx .spark{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 10px 2px rgba(120,230,255,.95);animation:sparkDrift linear infinite;opacity:0;}
    @keyframes auroraShift{0%{transform:translate(0,0) scale(1) rotate(0deg)}100%{transform:translate(-3%,2%) scale(1.08) rotate(3deg)}}
    @keyframes orbFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(5%,6%) scale(1.14)}100%{transform:translate(-4%,-5%) scale(.92)}}
    @keyframes beamSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes sparkDrift{0%{opacity:0;transform:translateY(10px) scale(.5)}12%{opacity:1}80%{opacity:.4}100%{opacity:0;transform:translateY(-80vh) scale(1.4)}}
    #coverScreen.smart-mode .cover-bg{background:#000!important;}
    #coverScreen.smart-mode .cover-bg::before{opacity:.22!important;background-size:48px 48px!important;animation:gridPulse 10s linear infinite;mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%)!important;}
    @keyframes gridPulse{from{background-position:0 0}to{background-position:48px 48px}}
    #coverSmartClockPill{display:none;align-items:center;gap:14px;margin:0 0 8px;padding:12px 20px;border-radius:999px;width:fit-content;max-width:100%;border:1px solid rgba(80,230,255,.4);background:linear-gradient(120deg,rgba(0,30,45,.85),rgba(8,12,24,.75));backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(0,0,0,.4),0 0 40px rgba(0,200,255,.15),inset 0 1px 0 rgba(255,255,255,.12);animation:clockIn .7s cubic-bezier(.2,.9,.2,1) .15s both;}
    #coverScreen.smart-mode #coverSmartClockPill{display:inline-flex}
    #coverSmartClockPill .time{font:900 clamp(1.35rem,3.4vw,1.9rem)/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#f0fbff;letter-spacing:.06em;text-shadow:0 0 32px rgba(0,220,255,.7),0 0 60px rgba(0,180,255,.35);}
    #coverSmartClockPill .sep{width:1px;height:20px;background:rgba(255,255,255,.2)}
    #coverSmartClockPill .label{font:800 10px/1.2 system-ui;letter-spacing:.16em;text-transform:uppercase;color:#7aefff}
    @keyframes clockIn{from{opacity:0;transform:translateY(-12px) scale(.96)}to{opacity:1;transform:none}}
    #coverScreen.smart-mode .cover-month-card{border:1px solid rgba(80,230,255,.45)!important;background:linear-gradient(160deg,rgba(8,24,40,.82),rgba(4,10,20,.88))!important;box-shadow:0 32px 80px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.06) inset,0 0 80px rgba(0,200,255,.18),0 0 120px rgba(168,85,247,.08)!important;position:relative;overflow:hidden;animation:cardIn .85s cubic-bezier(.2,.9,.2,1) .12s both;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;}
    #coverScreen.smart-mode .cover-month-card::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;background:linear-gradient(125deg,rgba(80,230,255,.2),transparent 35%,transparent 65%,rgba(180,80,255,.15));}
    #coverScreen.smart-mode .cover-month-card::after{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;pointer-events:none;background:conic-gradient(from 0deg,transparent,rgba(80,230,255,.12),transparent 30%);animation:cardSpin 8s linear infinite;opacity:.7;}
    @keyframes cardSpin{to{transform:rotate(360deg)}}
    @keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(.96)}to{opacity:1;transform:none}}
    #coverScreen.smart-mode .cover-stat{transition:transform .2s cubic-bezier(.2,.9,.2,1),box-shadow .2s,border-color .2s!important;position:relative;z-index:1;}
    #coverScreen.smart-mode .cover-stat:hover,#coverScreen.smart-mode .cover-stat:active{transform:translateY(-4px) scale(1.03)!important;box-shadow:0 18px 40px rgba(0,0,0,.45),0 0 32px rgba(0,200,255,.25)!important;}
    #coverScreen.smart-mode .cover-btn{position:relative;overflow:hidden;z-index:1;box-shadow:0 16px 48px rgba(244,140,60,.4)!important;}
    #coverScreen.smart-mode .cover-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 15%,rgba(255,255,255,.35) 50%,transparent 85%);transform:translateX(-130%);animation:shimmer 2.6s ease-in-out infinite;}
    @keyframes shimmer{0%,35%{transform:translateX(-130%)}65%{transform:translateX(130%)}100%{transform:translateX(130%)}}
    #coverSmartCta{display:none;position:fixed;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:70;gap:8px;padding:0;pointer-events:none}
    #coverScreen.smart-mode #coverSmartCta{display:flex!important;flex-direction:column!important;pointer-events:auto!important}
    #coverSmartCta button{width:100%;min-height:54px;border:0;border-radius:16px;font:900 16px/1.1 system-ui;letter-spacing:.02em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .15s ease;}
    #coverSmartCta button:active{transform:scale(.97)}
    #coverSmartCta .cta-main{background:linear-gradient(105deg,#ffc857,#f48e3d 55%,#ff6b35);color:#1a1208;box-shadow:0 14px 44px rgba(244,140,60,.5),0 0 40px rgba(255,180,60,.2);animation:ctaPulse 2.8s ease-in-out infinite;}
    #coverSmartCta .cta-year{background:rgba(6,14,24,.94);color:#d8eaf8;border:1px solid rgba(255,255,255,.18)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);min-height:44px;font-size:13px;font-weight:800;}
    @keyframes ctaPulse{0%,100%{box-shadow:0 14px 44px rgba(244,140,60,.5),0 0 30px rgba(255,180,60,.15)}50%{box-shadow:0 14px 44px rgba(244,140,60,.65),0 0 50px rgba(255,180,60,.3)}}
    @media(max-width:900px){
      #coverScreen.smart-mode .cover-month-card>.cover-btn,#coverScreen.smart-mode .cover-month-card>.cover-year-btn{display:none!important}
      #coverScreen.smart-mode .cover-inner{padding-bottom:calc(140px + env(safe-area-inset-bottom))!important}
      #coverSmartToggle{position:fixed!important;top:max(10px,env(safe-area-inset-top));right:12px;z-index:70;padding:8px 11px;font-size:10px}
      #coverScreen.smart-mode .cover-inner{display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:12px!important;padding:54px 14px 28px!important;min-height:100%!important;width:100%!important;max-width:100%!important;grid-template-columns:unset!important;grid-template-rows:unset!important;grid-auto-rows:unset!important;}
      #coverScreen.smart-mode .cover-toprow{order:1!important;display:flex!important;flex-wrap:wrap!important;gap:8px 12px!important;padding-bottom:10px!important;margin:0!important;border-bottom:1px solid rgba(255,255,255,.12)!important;}
      #coverScreen.smart-mode #coverSmartClockPill{order:2!important;margin:4px 0 0!important;width:100%;justify-content:center;box-sizing:border-box}
      #coverScreen.smart-mode .cover-hero{order:3!important;margin:0!important;padding:0!important;max-width:100%!important}
      #coverScreen.smart-mode .cover-hero .cover-overline,#coverScreen.smart-mode .cover-hero h1,#coverScreen.smart-mode .cover-hero > p{display:none!important}
      #coverScreen.smart-mode .cover-hero .cover-shortcuts{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:0!important}
      #coverScreen.smart-mode .cover-hero .cover-shortcuts button{min-height:48px}
      #coverScreen.smart-mode .cover-month-card{order:4!important;width:100%!important;max-width:100%!important;margin:0!important;justify-self:stretch!important;position:relative!important;z-index:2!important;transform:none!important;}
      #coverScreen.smart-mode .cover-foot{order:5!important;margin:2px 0 0!important;opacity:.7}
      #coverScreen.smart-mode .cover-stats{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    }
    @media(max-width:420px){#coverSmartClockPill .time{font-size:1.3rem}#coverScreen.smart-mode .cover-inner{padding-left:12px!important;padding-right:12px!important;gap:10px!important}#coverSmartCta button.cta-main{min-height:52px;font-size:15px}}
    @media(prefers-reduced-motion:reduce){#coverSmartFx .orb,#coverSmartFx .spark,#coverSmartFx .aurora,#coverSmartFx .beam,#coverScreen.smart-mode .cover-month-card,#coverScreen.smart-mode .cover-month-card::after,#coverScreen.smart-mode .cover-hero,#coverScreen.smart-mode .cover-toprow,#coverScreen.smart-mode .cover-btn::after,#coverScreen.smart-mode .cover-bg::before,#coverSmartCta .cta-main,#coverSmartClockPill{animation:none!important}}
  `;
  document.head.appendChild(style);

  const extraCover=()=>{const box=document.getElementById('coverStats');if(!box||typeof monthTotals!=='function'||typeof ensureYear!=='function')return;if([...box.children].filter(el=>el.classList.contains('cover-stat')&&!el.hasAttribute('data-total-euro-mese')).length<4)return;const today=new Date(),previous=currentYear;let total;try{currentYear=today.getFullYear();ensureYear(currentYear);total=monthTotals(today.getMonth()).euro;}finally{currentYear=previous;}let card=box.querySelector('[data-total-euro-mese]');if(!card){card=document.createElement('div');card.className='cover-stat';card.dataset.totalEuroMese='1';card.innerHTML='<div class="ci"><i class="fa-solid fa-euro-sign"></i></div><div class="cv"></div><div class="cl">Totale € mese</div>';box.appendChild(card);}const value=formatEuro(total),node=card.querySelector('.cv');if(node.textContent!==value)node.textContent=value;};
  const extraAgenda=()=>{const box=document.getElementById('agendaKpis');if(!box||typeof monthTotals!=='function'||typeof agendaMonthIndex!=='function'||!currentYear)return;const total=monthTotals(agendaMonthIndex()).euro;let card=box.querySelector('[data-total-euro-mese]');if(!card){card=document.createElement('div');card.className='agenda-kpi';card.dataset.totalEuroMese='1';card.style.setProperty('--k','var(--success)');card.innerHTML='<strong></strong><span>Totale € mese</span>';box.appendChild(card);}const value=formatEuro(total),node=card.querySelector('strong');if(node.textContent!==value)node.textContent=value;};
  if(typeof renderCoverStats==='function'){const o=renderCoverStats;renderCoverStats=function(){const r=o.apply(this,arguments);extraCover();return r;};}
  if(typeof renderAgendaHome==='function'){const o=renderAgendaHome;renderAgendaHome=function(){const r=o.apply(this,arguments);extraAgenda();return r;};}
  extraCover();extraAgenda();
  const observe=(id,refresh)=>{const host=document.getElementById(id);if(!host)return;let q=false;const w=new MutationObserver(()=>{if(q)return;q=true;queueMicrotask(()=>{q=false;try{refresh();}catch(e){}});});w.observe(host,{childList:true,subtree:true});};
  observe('coverStats',extraCover);observe('agendaKpis',extraAgenda);

  function ensureSmartUI(){
    const screen=document.getElementById('coverScreen');if(!screen)return;
    let fx=document.getElementById('coverSmartFx');
    if(!fx){fx=document.createElement('div');fx.id='coverSmartFx';fx.innerHTML='<div class="aurora"></div><div class="beam"></div><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div><div class="orb o4"></div>';for(let i=0;i<18;i++){const s=document.createElement('div');s.className='spark';s.style.left=(3+Math.random()*94)+'%';s.style.bottom=(-8-Math.random()*20)+'%';s.style.animationDuration=(6+Math.random()*9)+'s';s.style.animationDelay=(-Math.random()*14)+'s';s.style.width=s.style.height=(2+Math.random()*2.5)+'px';fx.appendChild(s);}screen.insertBefore(fx,screen.firstChild);}
    let toggle=document.getElementById('coverSmartToggle');
    if(!toggle){toggle=document.createElement('button');toggle.id='coverSmartToggle';toggle.type='button';toggle.innerHTML='<span class="dot"></span><span class="lbl">Cover Smart</span>';toggle.title='Attiva/disattiva Cover Smart';screen.appendChild(toggle);toggle.addEventListener('click',e=>{e.stopPropagation();const next=!isSmart();setSmart(next);applySmartMode(next);});}
    let pill=document.getElementById('coverSmartClockPill');
    if(!pill){pill=document.createElement('div');pill.id='coverSmartClockPill';pill.innerHTML='<span class="time">--:--:--</span><span class="sep"></span><span class="label">Live</span>';const inner=screen.querySelector('.cover-inner'),heroSec=screen.querySelector('.cover-hero');if(inner&&heroSec)inner.insertBefore(pill,heroSec);else if(inner)inner.prepend(pill);}
    let cta=document.getElementById('coverSmartCta');
    if(!cta){cta=document.createElement('div');cta.id='coverSmartCta';cta.innerHTML='<button type="button" class="cta-main" id="coverSmartCtaMain"><span>Apri l\u2019agenda</span><i class="fa-solid fa-arrow-right"></i></button><button type="button" class="cta-year" id="coverSmartCtaYear">Vista annuale</button>';screen.appendChild(cta);cta.querySelector('#coverSmartCtaMain').addEventListener('click',e=>{e.stopPropagation();if(typeof enterDashboard==='function')enterDashboard('month');});cta.querySelector('#coverSmartCtaYear').addEventListener('click',e=>{e.stopPropagation();if(typeof enterDashboard==='function')enterDashboard('year');});}
    const header=screen.querySelector('.cover-toprow');
    let bar=header.querySelector('.cover-tools');
    if(!bar){bar=document.createElement('div');bar.className='cover-tools';header.prepend(bar);bar.append(pill,toggle);
      const dial=document.createElement('span');dial.className='live-dial';dial.setAttribute('aria-hidden','true');dial.innerHTML='<i class="hh"></i><i class="mm"></i><i class="ss"></i>';pill.prepend(dial);
      const mode=document.createElement('button');mode.type='button';pill.append(mode);
      function format(analog){pill.classList.toggle('analog',analog);mode.textContent=analog?'Digitale':'Analogico';mode.setAttribute('aria-label','Passa al formato '+mode.textContent.toLowerCase());}
      format(localStorage.getItem('ore-clock-format')==='analog');
      mode.onclick=()=>{const a=!pill.classList.contains('analog');format(a);localStorage.setItem('ore-clock-format',a?'analog':'digital')};
    }
    applySmartMode(isSmart());startClock();
  }
  function applySmartMode(on){const screen=document.getElementById('coverScreen'),toggle=document.getElementById('coverSmartToggle');if(screen)screen.classList.toggle('smart-mode',!!on);if(toggle){toggle.classList.toggle('on',!!on);const lbl=toggle.querySelector('.lbl');if(lbl)lbl.textContent=on?'Smart ON':'Cover Smart';}}
  let clockTimer=null;
  function startClock(){const tick=()=>{const el=document.querySelector('#coverSmartClockPill .time');if(!el)return;const now=new Date(),p=el.parentElement,m=now.getMinutes()+now.getSeconds()/60;p.style.setProperty('--hh',((now.getHours()%12+m/60)*30)+'deg');p.style.setProperty('--mm',(m*6)+'deg');p.style.setProperty('--ss',(now.getSeconds()*6)+'deg');el.textContent=now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});};tick();if(clockTimer)clearInterval(clockTimer);clockTimer=setInterval(tick,1000);}
  const boot=()=>{if(document.getElementById('coverScreen'))ensureSmartUI();else setTimeout(boot,120);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  if(typeof showCover==='function'){const _s=showCover;showCover=function(){const r=_s.apply(this,arguments);ensureSmartUI();return r;};}
  if(typeof initCover==='function'){const _i=initCover;initCover=function(){const r=_i.apply(this,arguments);ensureSmartUI();return r;};}
})();



(()=>{
const css=document.createElement('style');css.textContent=`
.register-scroll,.leave-scroll{overflow:auto!important;max-height:clamp(155px,35dvh,360px);scrollbar-gutter:stable}
.leave-scroll{max-height:clamp(130px,29dvh,280px)}
.register-scroll,.leave-scroll{position:relative;isolation:isolate;background:var(--card)}
.register-scroll table,.leave-scroll table{border-collapse:separate!important;border-spacing:0}
.register-scroll thead,.leave-scroll thead{position:relative;z-index:20}
.register-scroll th,.leave-scroll th{position:sticky!important;top:0;z-index:30!important;background:var(--side)!important;color:var(--txt)!important;opacity:1!important;box-shadow:0 2px 0 var(--line),0 9px 14px color-mix(in srgb,var(--bg) 44%,transparent)}
.register-scroll td,.leave-scroll td{position:relative;z-index:1}
.register-scroll tr:first-child td,.leave-scroll tr:first-child td{border-top:0}
/* Fasce fisse: sempre opache, anche con lo stile iOS */
#monthsGrid .month-head{background:color-mix(in srgb,var(--bg) 84%,var(--acc))!important;opacity:1!important}
.register-scroll th,.leave-scroll th{background:color-mix(in srgb,var(--bg) 78%,var(--acc))!important;opacity:1!important}
.register-scroll th:first-child,.leave-scroll th:first-child{background:color-mix(in srgb,var(--bg) 73%,var(--acc))!important}
html[data-graphic-style=ios] #monthsGrid .month-head{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-graphic-style=ios] .register-scroll th,html[data-graphic-style=ios] .leave-scroll th{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-graphic-style=ios] #monthFilter,html[data-graphic-style=ios] #monthFilter option{color:#fff!important;background:#202d40!important;color-scheme:dark;border-color:#8397b1!important}
#coverScreen .cover-toprow{flex-wrap:wrap}
.cover-tools{flex:0 0 100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;min-width:0}
#coverScreen .cover-tools #coverSmartToggle{position:static!important;inset:auto!important}
#coverScreen .cover-tools #coverSmartClockPill{display:inline-flex!important;order:0!important;width:auto!important;max-width:100%;padding:7px 10px;margin:0!important;gap:8px;flex-wrap:wrap;background:#102537}
#coverSmartClockPill button{border:1px solid #607889;color:white;background:#263c4a;border-radius:16px;padding:6px 9px;cursor:pointer}
.live-dial{display:none;position:relative;width:42px;height:42px;border-radius:50%;border:2px solid #71e6eb;background:radial-gradient(circle,#112737 64%,transparent 65%),repeating-conic-gradient(#ace0eb 0deg 2deg,#112737 2deg 30deg)}
.analog .live-dial{display:block}.analog .time,.analog .sep{display:none}
.live-dial i{position:absolute;bottom:50%;left:50%;width:2px;background:white;transform-origin:bottom center}.live-dial .hh{height:24%;transform:rotate(var(--hh))}.live-dial .mm{height:37%;transform:rotate(var(--mm))}.live-dial .ss{height:41%;width:1px;background:#ffb44d;transform:rotate(var(--ss))}
#cvAgenda{margin-top:16px;padding:14px;border-radius:14px;background:var(--card,#172130);border:1px solid var(--card-border);position:relative;z-index:1}
#cvAgenda h3{margin:0 0 10px;font-size:1rem}#cvAgenda .agenda-day{min-height:27px;height:29px;padding:2px;font-size:12px}#cvAgenda .agenda-calendar{gap:3px}
#coverScreen.smart-mode #coverSmartCta{display:none!important}
#coverScreen.smart-mode .cover-month-card>.cover-btn,#coverScreen.smart-mode .cover-month-card>.cover-year-btn{display:flex!important;width:100%;justify-content:center}
#coverScreen.smart-mode .cover-month-card{overflow:hidden;box-sizing:border-box}
@media(min-width:901px){#coverScreen.smart-mode .cover-inner{grid-template-areas:"header header" "hero stats" "footer footer";align-content:center}#coverScreen.smart-mode .cover-toprow{grid-area:header}#coverScreen.smart-mode .cover-hero{grid-area:hero}#coverScreen.smart-mode .cover-month-card{grid-area:stats}#coverScreen.smart-mode .cover-foot{grid-area:footer}}
@media(max-width:900px){#coverScreen.smart-mode .cover-inner{padding-bottom:max(22px,env(safe-area-inset-bottom))!important}#coverScreen.smart-mode .cover-toprow{align-items:center}#coverScreen.smart-mode .cover-month-card{min-width:0}}
`;document.head.append(css);
const hero=document.querySelector('#coverScreen .cover-hero');
const box=document.createElement('section');box.id='cvAgenda';hero.append(box);
function paint(){const now=new Date(),y=now.getFullYear(),m=now.getMonth(),rows=DATA[y]?.months?.[m]?.entries||[],start=(new Date(y,m,1).getDay()+6)%7;
let cells='<span></span>'.repeat(start);
for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),e=rows.find(x=>x.date===iso)||{};
cells+='<div class="memo-day"><button type="button" data-day="'+iso+'" class="agenda-day '+[e.lavorato?'worked':'',e.ferie?'ferie':'',+e.ore?'has-hours':'',agendaIsOnCall(iso)?'oncall':'',d===now.getDate()?'today':''].join(' ')+'"><span class="n">'+d+'</span>'+(agendaIsOnCall(iso)?'<i class="fa-solid fa-phone-volume oc" aria-hidden="true"></i>':'')+'<span class="mark"></span></button>'+dayMemoButton(iso)+'</div>'}
box.innerHTML='<h3>Agenda · '+now.toLocaleDateString('it-IT',{month:'long',year:'numeric'})+'</h3><div class="agenda-weekdays">'+['L','M','M','G','V','S','D'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="agenda-calendar">'+cells+'</div>'}
box.onclick=e=>{const day=e.target.closest('[data-day]')?.dataset.day;if(!day)return;enterDashboard('month','secOre');const m=Number(day.slice(5,7))-1,i=DATA[day.slice(0,4)].months[m].entries.findIndex(x=>x.date===day);if(i>=0)openAgendaDay(m,i)};
paint();new MutationObserver(paint).observe(document.getElementById('coverStats'),{childList:true});
})();
