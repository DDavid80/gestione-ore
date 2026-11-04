(()=>{
  // Prefill / update riga di oggi: uscita 16:30 vs base 15:21 = 1h09m = 1.15h
  const FLAG='gestione_ore_prefill_2026-11-04_v2';
  const TARGET='2026-11-04';
  const ORE_STRAORD=1.15;
  const NOTE='Uscita 16:30 · str. 1h09m';

  const apply=()=>{
    try{
      if(typeof DATA==='undefined'||typeof ensureYear!=='function'||typeof saveData!=='function')return false;
      if(typeof renderAll!=='function')return false;

      const y=ensureYear(2026);
      const m=y.months[10]; // novembre
      if(!m||!Array.isArray(m.entries))return false;

      let entry=m.entries.find(e=>e&&e.date===TARGET);
      if(entry){
        // Aggiorna sempre ore/nota del giorno (anche se la riga esisteva già)
        entry.lavorato=true;
        entry.ferie=false;
        entry.ore=ORE_STRAORD;
        entry.note=NOTE;
      }else{
        m.entries.push({date:TARGET,lavorato:true,ferie:false,ore:ORE_STRAORD,rep:false,recup:false,note:NOTE});
        m.entries.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      }

      saveData();
      renderAll();
      try{localStorage.setItem(FLAG,'1');}catch(e){}
      if(typeof showToast==='function')showToast('Oggi 4/11: 1,15 h straordinarie (uscita 16:30).');
      return true;
    }catch(e){
      console.warn('prefill-today',e);
      return false;
    }
  };

  // Se già applicato in questa sessione browser, non ripetere all'infinito
  // ma al primo load utile sì (anche se FLAG vecchio).
  let done=false;
  const tryRun=()=>{
    if(done)return;
    if(apply()){done=true;}
  };

  // Vari tentativi: DATA può non essere pronto subito dopo document.write
  [600,1200,2000,3500,5000].forEach(ms=>setTimeout(tryRun,ms));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tryRun,400));
  else setTimeout(tryRun,400);
})();
