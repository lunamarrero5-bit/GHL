let editingId = null;
let activeLooks = [];
let lookIndex = 0;
let suggestionMessage = '';

function editPiece(item) {
  editingId = item.id; photoVersion++; photoBusy=false;
  $('#item-form').reset(); $('#item-name').value=item.name; $('#item-color').value=item.color;
  $('#item-category').value=item.category; $('#item-occasion').value=item.occasion;
  photoData=item.image.startsWith('data:image/svg')?'':item.image;
  let match; try { match = decodeURIComponent(item.image).match(/<g fill="(#[\da-f]{6})"/i); } catch { match = null; }
  $('#item-shade').value=match ? match[1] : '#c94040';
  $('#photo-preview').hidden=!photoData; if(photoData) $('#photo-preview').src=photoData;
  $('#submit-item').disabled=false; $('#submit-item').textContent='Save changes';
  $('#item-error').textContent=''; $('#dialog-title').textContent='Make it yours'; $('#item-dialog').showModal();
}

function button(text, action, className='button secondary') {
  const b=element('button',className,text); b.type='button'; b.addEventListener('click',action); return b;
}
function displayDate(date) { return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${date}T12:00:00`)); }
function wearOutfit(ids) {
  const pieces=ids.map(id=>state.items.find(i=>i.id===id));
  if(!pieces.length || pieces.some(i=>!i || i.availability==='laundry')) return notify('Some pieces are missing or in the laundry. Update your closet before wearing this look.');
  if(!confirm('Have you checked that every piece is clean, available and right for the conditions? Log this outfit as worn today?')) return;
  const today=FitCheck.day();
  if(pieces.every(i=>i.wears.includes(today))) return notify('This outfit is already logged for today.');
  if(commit({...state,items:state.items.map(i=>ids.includes(i.id)?{...i,availability:'ready',wears:[...new Set([...i.wears,today])]}:i)})) {
    renderSuggestions(); notify('Worn today. Your wear history is updated. Undo individual logs in Insights & backup.');
  }
}

function renderSuggestions() {
  const host=$('#suggestions'); if(!activeLooks.length) {
    if(suggestionMessage) { const box=element('div','welcome-card'); box.append(element('span','large-spark','✳'),element('h3','','Let’s work with what you have.'),element('p','',suggestionMessage),button('Go to my closet',()=>showView('closet'))); host.replaceChildren(box); }
    return;
  }
  const look=activeLooks[lookIndex]; const pieces=look.itemIds.map(id=>state.items.find(i=>i.id===id)).filter(Boolean);
  if(pieces.length!==look.itemIds.length || pieces.some(i=>i.availability==='laundry')) { activeLooks=[]; suggestionMessage='Your closet changed. Find outfit ideas again to use the latest pieces.'; return renderSuggestions(); }
  const card=element('article','look-card');
  const top=element('div','look-heading'); top.append(element('span','eyebrow',`${look.occasion.toUpperCase()} / FROM YOUR CATALOG`),element('span','pill',`${lookIndex+1} of ${activeLooks.length}`));
  const preview=element('div','look-preview');
  pieces.forEach(i=>{ const tile=element('div','look-piece'); tile.append(itemImage(i),element('span','',i.name)); preview.append(tile); });
  const forgotten=pieces.find(i=>FitCheck.underused(i));
  const reason=forgotten ? (FitCheck.lastWorn(forgotten)?`A fresh turn for ${forgotten.name}, last worn ${displayDate(FitCheck.lastWorn(forgotten))}.`:`Bring ${forgotten.name} into rotation — you haven’t logged a wear yet.`) : 'A combination of pieces you already have for this occasion.';
  const desc=element('div','look-description'); desc.append(element('h3','',look.occasion==='Work'?'Your next office rotation':look.occasion==='Going out'?'A little occasion, a lot of you':'Everyday, with a fresh perspective'),element('p','reason',`✳ ${reason}`));
  const weatherText={cold:'A layer is included for chilly conditions. Check fabric warmth and your actual forecast.',hot:'A lighter combination without an extra layer. Check fabric breathability.',rain:'Water resistance is not recorded. Check your shoes and outerwear before heading out.',mild:'For the mild or indoor conditions you selected.'};
  desc.append(element('p','weather-note',weatherText[look.weather]));
  if(pieces.some(i=>['Layers','Shoes'].includes(i.category)&&i.occasion!==look.occasion)) desc.append(element('p','field-hint','Shoes and layers can cross occasions. Check that these suit your venue’s dress code.'));
  desc.append(element('p','field-hint','Availability is self-reported. Check that every piece is clean and ready before wearing it.'));
  const swaps=element('div','swap-grid');
  pieces.forEach(piece=>{
    const label=element('label','',`Swap ${piece.category.toLowerCase()}`); const select=element('select'); select.setAttribute('aria-label',`Swap ${piece.name}`);
    state.items.filter(i=>i.category===piece.category && i.availability!=='laundry' && (i.id===piece.id || i.occasion===look.occasion || ['Shoes','Layers'].includes(i.category))).forEach(i=>{const opt=element('option','',i.name);opt.value=i.id;select.append(opt);});
    select.value=piece.id; select.addEventListener('change',()=>{look.itemIds=look.itemIds.map(id=>id===piece.id?select.value:id);renderSuggestions();}); label.append(select);swaps.append(label);
  });
  if(!pieces.some(i=>i.category==='Layers') && look.weather!=='hot') {
    const layers=state.items.filter(i=>i.category==='Layers'&&i.availability!=='laundry');
    if(layers.length) { const label=element('label','','Add a layer (optional)');const select=element('select');select.setAttribute('aria-label','Add a layer');const placeholder=element('option','','No extra layer');placeholder.value='';select.append(placeholder);layers.forEach(i=>{const opt=element('option','',i.name);opt.value=i.id;select.append(opt);});select.addEventListener('change',()=>{if(select.value) {look.itemIds.push(select.value);renderSuggestions();}});label.append(select);swaps.append(label); }
  } else if(look.weather!=='cold' && pieces.some(i=>i.category==='Layers')) swaps.append(button('Remove extra layer',()=>{look.itemIds=look.itemIds.filter(id=>state.items.find(i=>i.id===id)?.category!=='Layers');renderSuggestions();},'text-button'));
  const actions=element('div','look-actions');
  actions.append(button('Wear today ✓',()=>wearOutfit(look.itemIds),'button dark'),button('Name & save outfit ♡',()=>{selected=new Set(look.itemIds);$('#outfit-name').value=`${look.occasion} rotation`;$('#outfit-occasion').value=look.occasion;renderBuilder();showView('builder');}));
  if(activeLooks.length>1) actions.append(button('See another option →',()=>{lookIndex=(lookIndex+1)%activeLooks.length;renderSuggestions();}));
  card.append(top,preview,desc,swaps,actions,element('p','field-hint','Save keeps a look for later. Wear today records wear history. Planning is available after saving.'));
  host.replaceChildren(card,element('p','field-hint',suggestionMessage));
}

function renderExtras() {
  renderSuggestions();
  const select=$('#plan-outfit');const previous=select.value;select.replaceChildren();
  const placeholder=element('option','',state.outfits.length?'Choose an outfit':'Save an outfit first'); placeholder.value='';select.append(placeholder);
  state.outfits.forEach(o=>{const option=element('option','',o.name);option.value=o.id;select.append(option);}); if(state.outfits.some(o=>o.id===previous)) select.value=previous;
  const plans=state.plans.slice().sort((a,b)=>a.date.localeCompare(b.date));
  $('#plans').replaceChildren(...(plans.length?plans.map(p=>{const outfit=state.outfits.find(o=>o.id===p.outfitId);const row=element('article','agenda-row');const info=element('div');info.append(element('span','eyebrow',displayDate(p.date)),element('h3','',outfit.name),element('p','field-hint',`${outfit.occasion} · ${outfit.itemIds.length} pieces`));const actions=element('div','agenda-actions');if(p.date<=FitCheck.day())actions.append(button('Wear today',()=>wearOutfit(outfit.itemIds)));actions.append(button('Cancel plan',()=>{if(commit({...state,plans:state.plans.filter(x=>x.id!==p.id)}))notify('Plan cancelled. Your outfit is still saved.');},'text-button'));row.append(info,actions);return row;}):[element('p','empty','Room for something good. Save an outfit, then choose a date above.')]));
  const worn=state.items.filter(i=>i.wears.length).length;
  const stats=[[state.items.length,'pieces in your closet'],[state.items.filter(i=>FitCheck.underused(i)).length,'not worn in 30 days'],[`${state.items.length?Math.round(worn/state.items.length*100):0}%`,'of pieces ever logged as worn'],[state.outfits.length,'saved combinations']];
  $('#wardrobe-stats').replaceChildren(...stats.map(([value,label])=>{const card=element('div','stat-card');card.append(element('strong','',String(value)),element('span','',label));return card;}));
  const history=state.items.flatMap(i=>i.wears.map(date=>({item:i,date}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);
  $('#wear-history').replaceChildren(element('h3','','Recent wear history'),element('p','field-hint','Logged wears only. No wear history is invented for sample items.'),...(history.length?history.map(({item,date})=>{const row=element('div','history-row');row.append(element('span','',`${item.name} · ${displayDate(date)}`),button(`Undo wear: ${item.name}, ${date}`,()=>{if(commit({...state,items:state.items.map(i=>i.id===item.id?{...i,wears:i.wears.filter(d=>d!==date)}:i)})){renderSuggestions();notify('Wear log removed.');}},'text-button'));return row;}):[element('p','section-intro','Wear an outfit to start seeing your wardrobe story here.')]));
}

$('#style-form').addEventListener('submit',event=>{
  event.preventDefault();let weather=$('#style-weather').value;
  const temp=$('#style-temp').value;if(temp!==''){const c=$('#temp-unit').value==='F'?(Number(temp)-32)*5/9:Number(temp);if(c < -50 || c > 60)return notify('Please check the temperature and unit.');if(weather!=='rain')weather=c<16?'cold':c>27?'hot':'mild';}
  const result=FitCheck.suggest(state.items,{occasion:$('#style-occasion').value,weather,rediscover:$('#favor-unworn').checked});activeLooks=result.looks;lookIndex=0;suggestionMessage=result.message;renderSuggestions();
});
$('#undo-change').addEventListener('click',()=>{if(undoState && commit(undoState)){selected.clear();activeLooks=[];suggestionMessage='Change undone. Find ideas again to use the current closet.';renderSuggestions();notify('Last change undone. Click Undo again to redo it. Available until you reload this page.');}});
$('#temp-unit').addEventListener('change',()=>{const input=$('#style-temp');if(input.value!=='')input.value=Math.round($('#temp-unit').value==='C'?(Number(input.value)-32)*5/9:Number(input.value)*9/5+32);});
$('#closet-search').addEventListener('input',renderCloset);$('#unworn-filter').addEventListener('change',renderCloset);
$('#reset-filters').addEventListener('click',()=>{categoryFilter='All';$('#closet-search').value='';$('#unworn-filter').checked=false;$('#occasion-filter').value='All';document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category==='All');b.setAttribute('aria-pressed',String(b.dataset.category==='All'));});renderCloset();});
$('#plan-date').value=FitCheck.day();
$('#plan-form').addEventListener('submit',event=>{event.preventDefault();const date=$('#plan-date').value;const outfitId=$('#plan-outfit').value;if(!FitCheck.dateOK(date)||date<FitCheck.day())return notify('Choose today or a future date.');if(!outfitId)return notify('Save and choose an outfit first.');if(state.plans.some(p=>p.date===date&&p.outfitId===outfitId))return notify('That outfit is already planned for this date.');if(commit({...state,plans:[...state.plans,{id:makeId(),date,outfitId}]}))notify('Outfit planned. Wear history will update only when you wear it.');});
$('#export-backup').addEventListener('click',()=>{try {const data=recoveryMode?localStorage.getItem(STORAGE_KEY):JSON.stringify({...state,version:2},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=element('a');a.href=url;a.download=`fitcheck-${recoveryMode?'recovery-':''}${FitCheck.day()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{notify('The browser prevented access to your saved data.');}});
$('#import-backup').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;$('#backup-error').textContent='';
  try{if(file.size>8*1024*1024)throw Error('Backup must be smaller than 8 MB.');const restored=FitCheck.validate(JSON.parse(await file.text()));if(!confirm(`Replace this browser’s closet with ${restored.items.length} pieces, ${restored.outfits.length} outfits and ${restored.plans.length} plans? Download your current backup first if you need it.`))return;
    // Write before changing in-memory state, so a full store cannot erase the current closet.
    localStorage.setItem(STORAGE_KEY,JSON.stringify(restored));undoState=state;$('#undo-change').hidden=recoveryMode;state=restored;recoveryMode=false;selected.clear();activeLooks=[];suggestionMessage='Your backup is restored. Find new ideas using your restored closet.';render();renderSuggestions();notify('Backup restored successfully.');
  }catch(error){$('#backup-error').textContent=error instanceof SyntaxError?'This file is not valid JSON. Your current closet is unchanged.':`${error.message} Your current closet is unchanged.`;}finally{event.target.value='';}
});
// Never leave stale edits in a second tab after another tab updates the closet.
window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY || event.key===null){recoveryMode=false;state=loadState();undoState=null;$('#undo-change').hidden=true;selected.clear();activeLooks=[];suggestionMessage='Your closet changed in another tab. Find outfit ideas again.';render();renderSuggestions();notify(recoveryMode?storageWarning:'Closet updated from another tab.');}});
renderExtras();showView('today',false);
if(recoveryMode){const warning=element('p','recovery-banner',storageWarning);warning.setAttribute('role','alert');$('#main').prepend(warning);}
