(()=>{
  // Usa lo stesso calcolo del registro: ore registrate × tariffa della data.
  const formatEuro=value=>Number(value||0).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
  const style=document.createElement('style');
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
  `;
  document.head.appendChild(style);
  const extraCover=()=>{
    const box=document.getElementById('coverStats');
    if(!box||typeof monthTotals!=='function'||typeof ensureYear!=='function')return;
    // Evita che il quinto riquadro appaia da solo prima del riepilogo principale.
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
  // Le funzioni originali potrebbero aver già disegnato le schede prima del caricamento di questo script.
  extraCover();extraAgenda();
  // La sincronizzazione dei dati ricrea i box via innerHTML: ripristina la scheda senza duplicarla.
  const observe=(id,refresh)=>{
    const host=document.getElementById(id);if(!host)return;
    let queued=false;
    const watcher=new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      queueMicrotask(()=>{queued=false;try{refresh();}catch(e){console.warn('Aggiornamento totale mese:',e);}});
    });
    watcher.observe(host,{childList:true,subtree:true});
  };
  observe('coverStats',extraCover);
  observe('agendaKpis',extraAgenda);

  // Titolo modificabile direttamente dalla copertina, usando il brand già salvato.
  const coverTitle=document.getElementById('coverTitle');
  const sidebarTitle=document.getElementById('brandTitle');
  if(coverTitle){
    coverTitle.contentEditable='true';
    coverTitle.spellcheck=false;
    coverTitle.setAttribute('role','textbox');
    coverTitle.setAttribute('aria-label','Modifica titolo della dashboard');
    coverTitle.setAttribute('title','Clicca per modificare il titolo · Invio per salvare');
    coverTitle.style.cssText+=';cursor:text;outline-offset:5px;min-width:70px;';
    const saveTitle=()=>{
      const title=coverTitle.textContent.trim().replace(/\\s+/g,' ').slice(0,80)||'Gestione Ore';
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
    if(sidebarTitle)sidebarTitle.addEventListener('blur',()=>{
      const name=sidebarTitle.textContent.trim()||'Gestione Ore';
      coverTitle.textContent=name;
    });
  }
})();