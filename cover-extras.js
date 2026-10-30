(()=>{
  // Usa lo stesso calcolo del registro: ore registrate × tariffa della data.
  const formatEuro=value=>Number(value||0).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
  const extraCover=()=>{
    const box=document.getElementById('coverStats');
    if(!box||typeof monthTotals!=='function'||typeof ensureYear!=='function')return;
    const today=new Date(),previous=currentYear;
    let total;
    try{currentYear=today.getFullYear();ensureYear(currentYear);total=monthTotals(today.getMonth()).euro;}
    finally{currentYear=previous;}
    let card=box.querySelector('[data-total-euro-mese]');
    if(!card){card=document.createElement('div');card.className='cover-stat';card.dataset.totalEuroMese='1';card.innerHTML='<div class="ci"><i class="fa-solid fa-euro-sign"></i></div><div class="cv"></div><div class="cl">Totale € mese</div>';box.appendChild(card);}
    card.querySelector('.cv').textContent=formatEuro(total);
  };
  const extraAgenda=()=>{
    const box=document.getElementById('agendaKpis');
    if(!box||typeof monthTotals!=='function'||typeof agendaMonthIndex!=='function'||!currentYear)return;
    const total=monthTotals(agendaMonthIndex()).euro;
    let card=box.querySelector('[data-total-euro-mese]');
    if(!card){card=document.createElement('div');card.className='agenda-kpi';card.dataset.totalEuroMese='1';card.style.setProperty('--k','var(--success)');card.innerHTML='<strong></strong><span>Totale € mese</span>';box.appendChild(card);}
    card.querySelector('strong').textContent=formatEuro(total);
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
})();