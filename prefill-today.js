(()=>{
  const KEY='strao_data_v3';
  const FLAG='gestione_ore_prefill_2026-11-04';
  const TARGET='2026-11-04';

  const run=()=>{
    try{
      if(localStorage.getItem(FLAG)==='1')return;
      if(typeof DATA==='undefined'||typeof saveData!=='function'||typeof renderAll!=='function')return;

      const y=ensureYear(2026);
      const m=y.months[10];
      if(!m)return;

      const exists=m.entries.some(e=>e&&e.date===TARGET);
      if(exists){localStorage.setItem(FLAG,'1');return;}

      m.entries.push({date:TARGET,lavorato:true,ferie:false,ore:0,rep:false,recup:false,note:'Uscita 16:30'});
      m.entries.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      saveData();
      renderAll();
      localStorage.setItem(FLAG,'1);
      if(typeof showToast==='function')showToast('Riga di oggi precompilata: uscita 16:30. Controlla le ore e salva.');
    }catch(e){console.warn('prefill-today',e);}
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,800));
  else setTimeout(run,800);
  setTimeout(run,2500);
})();