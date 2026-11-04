(()=>{
  const KEY='strao_data_v3';
  const FLAG='gestione_ore_prefill_2026-11-04';
  const TARGET='2026-11-04';
  const ORE_STRAORD=1.15; // uscita 16:30 - base 15:21 = 1h09m

  const run=()=>{
    try{
      if(localStorage.getItem(FLAG)==='1')return;
      if(typeof DATA==='undefined'||typeof saveData!=='function'||typeof renderAll!=='function')return;

      const y=ensureYear(2026);
      const m=y.months[10];
      if(!m)return;

      const exists=m.entries.some(e=>e&&e.date===TARGET);
      if(exists){localStorage.setItem(FLAG,'1');return;}

      m.entries.push({date:TARGET,lavorato:true,ferie:false,ore:ORE_STRAORD,rep:false,recup:false,note:'Uscita 16:30 · str. 1h09m'});
      m.entries.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      saveData();
      renderAll();
      localStorage.setItem(FLAG,'1');
      if(typeof showToast==='function')showToast('Riga di oggi: 1,15 h straordinarie (uscita 16:30).');
    }catch(e){console.warn('prefill-today',e);}
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,800));
  else setTimeout(run,800);
  setTimeout(run,2500);
})();
