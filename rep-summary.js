(()=>{
 const grid=document.querySelector('#repMonthsGrid'),tile=document.querySelector('#repYearTotal').parentElement;
 const style=document.createElement('style');style.textContent=`
 #coverScreen .cover-brandblock #coverLogo{position:static!important;inset:auto;transform:none;flex:none;margin:0}
 #ticketRows td:last-child{color:#087c43!important;font-weight:850;background:#d5f7e5;border-radius:6px;font-variant-numeric:tabular-nums}
 .ferie-table input[type=number].recorded{color:#defff0!important;background:#164636!important;border:1px solid #69d6a1!important;box-shadow:inset 3px 0 #69d6a1;font-weight:850}
 #repMonthsGrid .month-body.open{max-height:clamp(160px,36dvh,370px);overflow-y:auto;scrollbar-gutter:stable}
 #repTrend,.rep-dialog{padding:16px;border-radius:16px;background:var(--card,#202936);color:var(--text,inherit);border:1px solid var(--card-border);margin-bottom:16px}
 #repTrend h3,.rep-dialog h2{margin:0 0 12px}.rep-bars{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px}.rep-bar{display:flex;align-items:center;flex-direction:column;justify-content:flex-end;height:110px;font-size:clamp(9px,2vw,13px)}.rep-bar i{width:65%;background:#18af94;border-radius:4px 4px 0 0;min-height:1px}
 .rep-dialog{margin:auto;background:#192330;color:#f5f8fa;width:min(500px,92vw);max-height:78dvh;overflow:auto;box-sizing:border-box}.rep-dialog::backdrop{background:#0009}.rep-dialog header{position:sticky;top:-16px;background:#192330;display:flex;justify-content:space-between;align-items:center;padding:8px 0}.rep-dialog p{border-bottom:1px solid #46515a;padding-bottom:8px}.rep-dialog small{display:block;margin-top:4px}.rep-detail-link{font-size:.75rem;text-decoration:underline}
 `;document.head.append(style);
 function mark(el){el.classList.toggle('recorded',Number(el.value)!==0&&Number.isFinite(Number(el.value)))}
 function tint(){document.querySelectorAll('.ferie-table input[type=number]').forEach(mark)}
 tint();for(const id of ['ferieMonthRows','ferieHeadRows'])new MutationObserver(tint).observe(document.getElementById(id),{childList:true});
 document.addEventListener('input',e=>{if(e.target.matches('.ferie-table input[type=number]'))mark(e.target)});
 const trend=document.createElement('section');trend.id='repTrend';grid.before(trend);
 const dialog=document.createElement('dialog');dialog.className='rep-dialog';dialog.setAttribute('aria-labelledby','repModalTitle');document.body.append(dialog);
 const data=yr=>MONTHS.map((_,i)=>(DATA[yr]?.reperibilitaDays?.[i]?.entries||[]).filter(e=>e.rep));
 const total=a=>a.reduce((n,m)=>n+m.length,0);
 function paint(){const rows=data(currentYear),max=Math.max(1,...rows.map(m=>m.length));
 trend.innerHTML='<h3>Andamento reperibilità · '+currentYear+'</h3><div class="rep-bars">'+rows.map((m,i)=>'<div class="rep-bar" title="'+MONTHS[i]+': '+m.length+' giorni"><b>'+m.length+'</b><i style="height:'+Math.round(72*m.length/max)+'px"></i><span>'+MONTHS[i].slice(0,3)+'</span></div>').join('')+'</div><p>Giorni registrati per anno: '+Object.keys(DATA).filter(k=>/^\d{4}$/.test(k)).sort().map(y=>y+' · <b>'+total(data(y))+' gg</b>').join('　')+'</p>'}
 tile.tabIndex=0;tile.setAttribute('role','button');tile.setAttribute('aria-haspopup','dialog');tile.style.cursor='pointer';tile.insertAdjacentHTML('beforeend','<small class="rep-detail-link">Vedi mesi e date ›</small>');
 function show(){const rows=data(currentYear);dialog.innerHTML='<header><h2 id="repModalTitle">Reperibilità · '+currentYear+'</h2><button class="btn" autofocus>Chiudi</button></header><b>'+total(rows)+' giorni nell’anno</b>'+rows.map((m,i)=>'<p><b>'+MONTHS[i]+'</b> · '+m.length+' gg'+(m.length?'<small>'+m.map(e=>formatDateIT(e.date)).join(' · ')+'</small>':'')+'</p>').join('');dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal()}
 tile.onclick=show;tile.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();show()}};
 const old=renderRepPage;renderRepPage=function(){const scroll={};grid.querySelectorAll('.open').forEach(b=>scroll[b.id]=b.scrollTop);old();for(const id in scroll){const b=document.getElementById(id);if(b)b.scrollTop=scroll[id]}paint()};paint()
})();
