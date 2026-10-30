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
})();