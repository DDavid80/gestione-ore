/* Task-oriented mobile views. Persistence and arithmetic use the existing dashboard. */
(()=>{
'use strict';
const mq=matchMedia('(max-width:760px)'),names=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
let view='ore',month=new Date().getMonth(),panel,dialog;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const field=(name,label,type,value,attrs='')=>`<label class="mw-field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
const flag=(name,label,on,disabled=false)=>`<label class="mw-flag"><input name="${name}" type="checkbox" ${on?'checked':''} ${disabled?'disabled':''}>${label}</label>`;
function show(v){
 view=v;document.body.classList.remove('ore-app-menu');document.querySelector('.ore-app-shade').hidden=true;
 document.querySelector('#coverScreen').classList.add('hidden');document.body.classList.add('mw-active');
 document.querySelector('#oreMobilePageName').textContent=({ore:'Ore',rep:'Reperibilità',ferie:'Ferie e permessi',ticket:'Ticket'})[v];
 document.querySelectorAll('.ore-app-nav [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
 render();window.scrollTo(0,0);
}
function render(){const keep=window.scrollY;renderInner();window.scrollTo(0,keep)}
function renderInner(){
 if(!panel)return;
 const y=ensureYear(currentYear);
 panel.innerHTML=`<div class="mw-period"><label>Anno<select id="mwYear">${Object.keys(DATA).filter(k=>/^\d{4}$/.test(k)).sort().map(k=>`<option ${+k===+currentYear?'selected':''}>${k}</option>`).join('')}</select></label><label>Mese<select id="mwMonth">${names.map((n,i)=>`<option value="${i}" ${i===month?'selected':''}>${n}</option>`).join('')}</select></label></div><div id="mwContent"></div>`;
 panel.querySelector('#mwYear').onchange=e=>{selectYear(+e.target.value);render()};
 panel.querySelector('#mwMonth').onchange=e=>{month=+e.target.value;render()};
 const content=panel.querySelector('#mwContent');
 if(view==='ore'||view==='rep'){
  const entries=view==='rep'?y.reperibilitaDays[month].entries:y.months[month].entries;
  const count=entries.filter(e=>view==='rep'?e.rep:e.lavorato).length;
  content.innerHTML=`<p class="mw-summary">${view==='rep'?`${count} giorni selezionati · tocca per attivare o togliere`:`${count} giorni lavorati · tocca un giorno per modificarlo`}</p><div class="mw-calendar">${['L','M','M','G','V','S','D'].map(n=>`<span class="mw-week">${n}</span>`).join('')}${Array.from({length:(new Date(currentYear,month,1).getDay()+6)%7},()=>'<span></span>').join('')}${Array.from({length:new Date(currentYear,month+1,0).getDate()},(_,i)=>{
   const date=`${currentYear}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`,idx=entries.findIndex(e=>e.date===date),e=entries[idx]||{};
   return `<button type="button" data-day="${idx}" ${idx<0?'disabled':''} class="mw-day ${e.rep&&view==='rep'?'selected':''} ${e.lavorato&&view==='ore'?'worked':''} ${e.ferie&&view==='ore'?'leave':''}" aria-label="${i+1} ${names[month]}" ${view==='rep'?`aria-pressed="${!!e.rep}"`:''}><b>${i+1}</b><small>${view==='ore'?(e.ore?esc(e.ore)+'h':e.ferie?'Ferie':e.lavorato?'Lavoro':''):e.rep?'✓':''}</small></button>`;
  }).join('')}</div>`;
  content.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{const i=+b.dataset.day;if(view==='rep'){toggleRepDay(month,i,!entries[i].rep);render()}else editDay(i)});
 }else if(view==='ferie'){
  setMonthFilter(String(month));renderFerie();const cells=document.querySelector('#ferieHeadRows tr.saldo').cells;
  content.innerHTML=`<h2>Saldi attuali</h2><div class="mw-balances">${['Ferie · gg','Permessi','Semifestività','Recupero · ore'].map((n,i)=>`<div><small>${n}</small><strong>${esc(cells[i+1].textContent)}</strong></div>`).join('')}</div><p class="mw-summary">Saldi fino a ${names[month]}. Tocca un mese per modificare ferie e permessi.</p><div class="mw-ticket-list">${names.map((n,i)=>`<button type="button" data-leave="${i}" class="mw-ticket mw-leave${leaveSummary(y.ferie.usufruitoMonths[i])==='Nessun utilizzo'?' mw-empty':''}"><span>${n}${i===month?' · selezionato':''}</span><strong>${leaveTotal(y.ferie.usufruitoMonths[i])}</strong><small>${leaveSummary(y.ferie.usufruitoMonths[i])}</small></button>`).join('')}</div><details><summary>Residui e spettanza</summary><div id="mwBase"></div></details>`;
  content.querySelectorAll('[data-leave]').forEach(b=>b.onclick=()=>editLeave(+b.dataset.leave));
  const base=content.querySelector('#mwBase');
  for(const kind of ['residuoPrec','spettanza']){const form=document.createElement('form');form.innerHTML=`<h3>${kind==='residuoPrec'?'Residuo precedente':'Spettanza'}</h3>`+['ferie','per','semifestivita','rechh'].map((k,i)=>field(k,['Ferie','Permessi','Semifestività','Recupero ore'][i],'number',y.ferie[kind][k]||0,'step="0.5" inputmode="decimal"')).join('')+'<button class="mw-save">Salva</button>';form.onsubmit=e=>{e.preventDefault();for(const [k,v] of new FormData(form))updateFerieBase(kind,k,v);showToast('Valori salvati');render()};base.append(form)}
 }else{
  renderTicket();content.innerHTML=`<p class="mw-summary">${esc(document.querySelector('#ticketTotalBox').textContent)}</p><div class="mw-ticket-list">${[...document.querySelector('#ticketRows').rows].map((r,i)=>`<button type="button" data-ticket="${i}" class="mw-ticket"><span>${names[i]}${i===month?' · selezionato':''}</span><strong>${esc(r.cells[3].textContent)}</strong><small>${esc(ticketLine(r))}</small></button>`).join('')}</div><details><summary>Valore ticket da oggi</summary><form id="mwRate">${field('rate','Nuovo valore (€)','number',document.querySelector('#ticketRateInput').value,'min="0" step="0.01"')}<button class="mw-save">Applica da oggi</button></form></details>`;
  content.querySelectorAll('[data-ticket]').forEach(b=>b.onclick=()=>editTicket(+b.dataset.ticket));
  content.querySelector('#mwRate').onsubmit=e=>{e.preventDefault();document.querySelector('#ticketRateInput').value=e.target.elements.rate.value;updateTicketRate();render()};
 }
}
const num=v=>String(+(+v||0).toFixed(2));
const LEAVE=[['ferie','Ferie','gg'],['per','Permessi',''],['semifestivita','Semifestività',''],['rechh','Recupero','h']];
function leaveSummary(m){const parts=LEAVE.filter(([k])=>+(m||{})[k]).map(([k,l,u])=>l+' '+num(m[k])+(u?' '+u:''));return parts.length?parts.join(' · '):'Nessun utilizzo'}
function leaveTotal(){return ''}
function ticketLine(r){const d=r.cells[1].querySelector('input')?.value||'0',v=r.cells[2].querySelector('input')?.value||'0';return d+' gg × €'+v}
function editLeave(i){
 const m=ensureYear(currentYear).ferie.usufruitoMonths[i];
 openForm('Ferie e permessi · '+names[i],LEAVE.map(([k,l],j)=>field(k,['Ferie (giorni)','Permessi','Semifestività','Recupero ore / DIR.VI'][j],'number',m[k]||0,'step="0.5" inputmode="decimal"')).join(''),f=>{for(const [k] of LEAVE)updateFerieMonth(i,k,f.elements[k].value);showToast('Ferie e permessi salvati')});
}
function fitEditor(){
 if(!dialog)return;
 const vv=window.visualViewport;
 for(const [key,value] of Object.entries({vw:vv?.width||window.innerWidth,vh:vv?.height||window.innerHeight,vtop:vv?.offsetTop||0,vleft:vv?.offsetLeft||0}))dialog.style.setProperty('--mw-'+key,value+'px');
}
function openForm(title,html,save){
 dialog.innerHTML=`<form><header><h2>${esc(title)}</h2><button type="button" class="mw-cancel" aria-label="Chiudi">✕</button></header><div class="mw-dialog-body">${html}</div><footer><button type="button" class="mw-cancel">Annulla</button><button class="mw-save">Salva</button></footer></form>`;
 dialog.querySelectorAll('.mw-cancel').forEach(b=>b.onclick=()=>dialog.close());
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();save(e.target);dialog.close();render()};fitEditor();dialog.showModal();
}
function editDay(i){
 const e=ensureYear(currentYear).months[month].entries[i],closed=ensureYear(currentYear).months[month].closed;
 openForm(e.date,`<div class="mw-flags">${flag('lavorato','Lavorato',e.lavorato,closed)}${flag('ferie','Ferie',e.ferie,closed)}</div>${field('uscita','Ora di uscita','time',e.uscita||'')}${field('ore','Ore straordinarie','number',e.ore,'step="0.01" inputmode="decimal"')}<div class="mw-flags">${flag('rep','Reperibilità',e.rep)}${flag('recup','Recupero',e.recup)}</div>${field('note','Nota','text',e.note||'')}`,form=>{
  for(const k of ['lavorato','ferie','rep','recup'])if(!form.elements[k].disabled)updateEntry(month,i,k,form.elements[k].checked);
  setExitTime(month,i,form.elements.uscita.value);updateEntry(month,i,'ore',form.elements.ore.value);updateEntry(month,i,'note',form.elements.note.value);showToast('Giornata salvata');
 });
 const form=dialog.querySelector('form');form.elements.uscita.onchange=()=>form.elements.ore.value=exitExtraHours(form.elements.uscita.value);
 for(const [a,b] of [['lavorato','ferie'],['ferie','lavorato'],['rep','recup'],['recup','rep']])form.elements[a].onchange=()=>{if(form.elements[a].checked)form.elements[b].checked=false};
}
function editTicket(i){
 const row=document.querySelector('#ticketRows').rows[i];
 openForm('Ticket · '+names[i],field('days','Giorni presenza','number',row.cells[1].querySelector('input').value,'min="0" step="1"')+field('rate','Valore ticket (€)','number',row.cells[2].querySelector('input').value,'min="0" step="0.01"'),f=>{if(f.elements.days.value!==row.cells[1].querySelector('input').value)updateTicketMonth(i,f.elements.days.value);if(f.elements.rate.value!==row.cells[2].querySelector('input').value)updateTicketRateForMonth(i,f.elements.rate.value);showToast('Ticket salvati')});
}
function boot(){
 panel=document.createElement('section');panel.id='oreWorkspace';dialog=document.createElement('dialog');dialog.className='mw-dialog';document.body.append(panel,dialog);
 window.visualViewport?.addEventListener('resize',fitEditor);window.visualViewport?.addEventListener('scroll',fitEditor);window.addEventListener('resize',fitEditor);
 const nav=document.querySelector('.ore-app-nav');if(!nav)return;
 nav.innerHTML=[['home','fa-house','Home'],['ore','fa-clock','Ore'],['rep','fa-phone-volume','Rep.'],['ferie','fa-umbrella-beach','Ferie'],['ticket','fa-ticket','Ticket'],['more','fa-bars','Altro']].map(([id,icon,n])=>`<button type="button" data-view="${id}"><i class="fa-solid ${icon}"></i><span>${n}</span></button>`).join('');
 document.addEventListener('click',ev=>{
  if(!mq.matches)return;
  const b=ev.target.closest('[data-view],#oreMobileHomeButton,.cover-shortcuts button,#coverSmartCtaMain,#coverSmartCtaYear,#repPageBtn');if(!b)return;
  let id=b.dataset.view;if(!id){const code=b.getAttribute('onclick')||'';id=b.id==='oreMobileHomeButton'?'home':b.id==='repPageBtn'||code.includes('repPage')?'rep':code.includes('secFerie')?'ferie':code.includes('secTicket')?'ticket':'ore'}
  if(id==='home'||id==='more'){document.body.classList.remove('mw-active');return}
  ev.preventDefault();ev.stopImmediatePropagation();show(id==='agenda'?'ore':id);
 },true);
 mq.addEventListener('change',()=>{if(!mq.matches){dialog.close();document.body.classList.remove('mw-active')}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
