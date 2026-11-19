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
  // Un solo giorno aperto alla volta. Il registro originale e gli handler
  // onchange restano nel DOM: nessuna modifica a salvataggi o calcoli.
  let selectedDay=null;
  // Entry identity survives render/sort without adding fields to persisted data.
  const entryKeys=new WeakMap();let entrySequence=0;
  function dayKey(tr){
    const match=/^dayrow-(\d+)-(\d+)$/.exec(tr.id);
    if(match&&typeof ensureYear==='function'&&typeof currentYear!=='undefined'){
      const entry=ensureYear(currentYear).months[Number(match[1])]?.entries[Number(match[2])];
      if(entry){if(!entryKeys.has(entry))entryKeys.set(entry,++entrySequence);return entryKeys.get(entry);}
    }
    return tr.id;
  }
  const weekday=['dom','lun','mar','mer','gio','ven','sab'];
  function dateText(raw){
    if(!raw||!/^\d{4}-\d{2}-\d{2}$/.test(raw))return 'Data da impostare';
    const [year,month,day]=raw.split('-').map(Number);
    const d=new Date(year,month-1,day);
    return weekday[d.getDay()]+' '+day+' '+d.toLocaleDateString('it-IT',{month:'short'});
  }
  function prepareRows(){
    const labels=['Data','Lavorato','Ferie','Uscita / ore','Reperibilità','Recupero','Note','Elimina'];
    const rows=document.querySelectorAll('.month-card table tbody tr');
    rows.forEach(tr=>{
      const dateInput=tr.querySelector('td:first-child input[type=date]');
      if(!dateInput)return;
      const cells=[...tr.children].filter(el=>el.tagName==='TD');
      const key=dayKey(tr);
      cells.forEach((td,i)=>{
        if(td.dataset.appLabel!==labels[i])td.dataset.appLabel=labels[i];
        td.querySelectorAll('input,button.row-del').forEach((input,j)=>{
          input.setAttribute('aria-label',i===3?(j===0?'Ora di uscita':'Ore straordinarie'):labels[i]);
          if(i===3&&j===1)input.setAttribute('inputmode','decimal');
        });
        if(i===3&&!td.querySelector('.ore-field-label')){
          td.querySelectorAll('input').forEach((input,j)=>{
            const label=document.createElement('label');label.className='ore-field-label';
            const text=document.createElement('span');text.textContent=j===0?'Ora di uscita':'Ore straordinarie';
            input.before(label);label.append(text,input);
          });
        }
      });
      tr.classList.add('ore-day-collapsed');
      const open=key===selectedDay;
      tr.classList.toggle('ore-day-open',open);
      tr.classList.toggle('ore-day-collapsed',!open);
      const first=cells[0];
      let btn=first.querySelector('.ore-day-toggle');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';btn.className='ore-day-toggle';
        first.prepend(btn);
      }
      const state=[];
      const checked=i=>!!cells[i]?.querySelector('input[type=checkbox]')?.checked;
      if(checked(1))state.push('Lavorato');
      if(checked(2))state.push('Ferie');
      if(checked(4))state.push('Rep.');
      if(checked(5))state.push('Recup.');
      const hour=cells[3]?.querySelector('input[type=number]')?.value;
      const exit=cells[3]?.querySelector('input[type=time]')?.value;
      if(exit)state.push('Uscita '+exit);
      else if(hour&&Number(hour))state.push(hour+' h');
      btn.innerHTML='<span class="ore-day-info"><strong>'+dateText(dateInput.value)+'</strong><small>'+(state.join(' · ')||'Nessuna registrazione')+'</small></span><span class="ore-day-chevron"><i class="fa-solid fa-chevron-'+(open?'up':'down')+'"></i></span>';
      btn.setAttribute('aria-expanded',String(open));
      btn.setAttribute('aria-label',(open?'Chiudi':'Modifica')+' '+dateText(dateInput.value));
    });
  }
  function toggleDay(tr){
    if(!tr)return;
    const key=dayKey(tr);
    selectedDay=selectedDay===key?null:key;
    prepareRows();
    if(selectedDay)requestAnimationFrame(()=>tr.scrollIntoView({block:'start',behavior:'smooth'}));
  }
  function openMobileDay(mIdx,eIdx){
    menu(false);
    const cover=$('#coverScreen');if(cover)cover.classList.add('hidden');
    if(typeof window.closeStats==='function')window.closeStats();
    if(typeof window.hideRepPage==='function')window.hideRepPage();
    window.setMonthFilter(String(mIdx));
    const section=$('#secOre');if(section?.classList.contains('closed'))window.toggleSection('secOre');
    const body=$('#mbody-'+mIdx);if(body)body.classList.add('open');
    const row=$('#dayrow-'+mIdx+'-'+eIdx);
    if(row){selectedDay=dayKey(row);prepareRows();requestAnimationFrame(()=>row.scrollIntoView({block:'start',behavior:'smooth'}));}
    setActive('ore');
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(mq.matches)prepareRows();});}
  // Annotate the existing controls; keep their original onchange handlers.
  function prepareLedgers(){
    for(const [id,labels] of [
      ['ferieHeadRows',['','Ferie (giorni)','Permessi','Semifestività','Recupero ore / DIR.VI']],
      ['ferieMonthRows',['Mese','Ferie (giorni)','Permessi','Semifestività','Recupero ore / DIR.VI']],
      ['ticketRows',['Mese','Giorni presenza','Valore ticket (€)','Totale']]
    ]){
      const body=document.getElementById(id);if(!body)continue;
      body.closest('table').classList.add('ore-mobile-ledger');
      body.closest('table').parentElement.classList.add('ore-ledger-wrap');
      for(const row of body.rows){
        const c0=row.cells[0];
        if(c0&&!c0.dataset.name)c0.dataset.name=(c0.childNodes[0]?.textContent||c0.textContent).trim();
        const heading=c0?.dataset.name||'';
        [...row.cells].forEach((cell,i)=>{
          cell.dataset.mobileLabel=labels[i];
          cell.querySelectorAll('input').forEach(input=>{
            input.setAttribute('aria-label',heading+' · '+labels[i]);
            input.setAttribute('inputmode',id==='ticketRows'&&i===1?'numeric':'decimal');
          });
        });
        if(id!=='ferieHeadRows')collapseLedgerRow(id,row,heading);
      }
    }
  }
  // Ogni mese di Ferie e Ticket resta chiuso con il riepilogo; si apre toccando il titolo.
  const openLedger=new Set();
  const nz=v=>String(+(+v||0).toFixed(2));
  function ledgerSummary(id,row){
    const val=i=>row.cells[i]?.querySelector('input')?.value;
    if(id==='ticketRows'){
      const rate=(+String(val(2)||0).replace(',','.')||0).toFixed(2);
      return {tot:(row.cells[3]?.textContent||'').trim(),line:(val(1)||0)+' gg × €'+rate,empty:false};
    }
    const parts=[['Ferie','gg',1],['Permessi','',2],['Semifestività','',3],['Recupero','h',4]].filter(([,,i])=>+String(val(i)||0).replace(',','.')).map(([n,u,i])=>n+' '+nz(String(val(i)).replace(',','.'))+(u?' '+u:''));
    return {tot:'',line:parts.length?parts.join(' · '):'Nessun utilizzo',empty:!parts.length};
  }
  function collapseLedgerRow(id,row,heading){
    const c0=row.cells[0];if(!c0)return;
    const key=id+':'+heading;
    row.classList.add('ledger-collapsible');
    row.classList.toggle('ledger-open',openLedger.has(key));
    let sum=c0.querySelector('.ledger-sum');
    if(!sum){sum=document.createElement('span');sum.className='ledger-sum';c0.append(sum);}
    const paint=()=>{
      const r=ledgerSummary(id,row);
      sum.innerHTML='<strong class="ledger-tot">'+(r.tot?r.tot+' ':'')+'<i class="ledger-chev" aria-hidden="true">▾</i></strong><small class="ledger-line'+(r.empty?' empty':'')+'">'+r.line+'</small>';
      c0.setAttribute('aria-expanded',String(row.classList.contains('ledger-open')));
    };
    paint();
    c0.setAttribute('role','button');c0.tabIndex=0;
    const toggle=()=>{const on=!row.classList.contains('ledger-open');row.classList.toggle('ledger-open',on);on?openLedger.add(key):openLedger.delete(key);c0.setAttribute('aria-expanded',String(on));};
    c0.onclick=toggle;
    c0.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}};
    row.addEventListener('change',()=>setTimeout(paint,50));
  }
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
    document.addEventListener('click',e=>{if(!mq.matches)return;const btn=e.target.closest('.ore-day-toggle');if(btn)toggleDay(btn.closest('tr'));});
    document.addEventListener('change',e=>{if(mq.matches&&e.target.closest('#monthsGrid'))schedule();});
    // The original desktop entry point stays intact outside the mobile breakpoint.
    const originalOpenDay=window.openAgendaDay;
    window.openAgendaDay=function(mIdx,eIdx){
      if(!mq.matches)return originalOpenDay.apply(this,arguments);
      openMobileDay(mIdx,eIdx);
    };
    const grid=$('#monthsGrid');
    if(grid){observer=new MutationObserver(schedule);observer.observe(grid,{childList:true,subtree:false});}
    mq.addEventListener?.('change',()=>{menu(false);schedule();});
    prepareLedgers();
    for(const id of ['ferieHeadRows','ferieMonthRows','ticketRows']){
      const body=document.getElementById(id);
      if(body)new MutationObserver(prepareLedgers).observe(body,{childList:true});
    }
    setActive('home');schedule();
  }
  // Spuntare Lavorato/Ferie o cambiare data ricostruisce tutti i mesi: su telefono la pagina
  // risaliva e gli altri mesi si richiudevano. Qui si ripristinano mesi aperti e posizione.
  const baseUpdateEntry=window.updateEntry;
  if(typeof baseUpdateEntry==='function')window.updateEntry=function(m,e,field){
    if(!mq.matches||!['lavorato','ferie','date'].includes(field))return baseUpdateEntry.apply(this,arguments);
    const y=window.scrollY,open=[...document.querySelectorAll('.month-body.open')].map(x=>x.id);
    const out=baseUpdateEntry.apply(this,arguments);
    const restore=()=>{open.forEach(id=>document.getElementById(id)?.classList.add('open'));window.scrollTo(0,y);};
    restore();requestAnimationFrame(()=>{restore();requestAnimationFrame(restore);});setTimeout(restore,250);
    return out;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();