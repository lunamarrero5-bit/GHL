// FitCheck uses plain JavaScript. No account, server, or installation is needed.
const OWN_STORAGE_KEY='fitcheck-v1', DEMO_STORAGE_KEY='fitcheck-demo-v1';
let isDemoMode=true;
try { isDemoMode=localStorage.getItem('fitcheck-mode')!=='own'; } catch { /* Demo remains usable for this visit. */ }
let STORAGE_KEY=isDemoMode?DEMO_STORAGE_KEY:OWN_STORAGE_KEY;
function canUseItem(item) { return FitCheck.isOwned(item) || (isDemoMode && item?.origin==='demo' && FitCheck.demoPhotoOK(item.image)); }
const categories = ['Tops', 'Bottoms', 'Layers', 'Shoes', 'Dresses'];
let builderCategory = 'All';
const occasions = ['Casual', 'Work', 'Going out'];
const $ = (selector) => document.querySelector(selector);
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Every new sample is a photograph of a real garment.
function starterWardrobe() { return isDemoMode ? FitCheckDemo.wardrobe() : []; }

let storageWarning = '';
let recoveryMode = false;
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return FitCheck.validate({ items: starterWardrobe(), outfits: [] });
    const data = JSON.parse(raw);
    const validItem = (item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.color === 'string' && categories.includes(item.category) && occasions.includes(item.occasion) && FitCheck.imageOK(item.image);
    if (!data || !Array.isArray(data.items) || !data.items.every(validItem) || !Array.isArray(data.outfits) || !data.outfits.every((outfit) => outfit && typeof outfit.id === 'string' && typeof outfit.name === 'string' && occasions.includes(outfit.occasion) && Array.isArray(outfit.itemIds) && outfit.itemIds.every((id) => data.items.some((item) => item.id === id)))) throw new Error('Invalid saved data');
    return FitCheck.validate(data);
  } catch {
    recoveryMode = true;
    storageWarning = 'Your saved closet could not be read. It has not been overwritten. Download the original data in Insights & backup, then restore a valid backup.';
    return FitCheck.validate({ items: starterWardrobe(), outfits: [] });
  }
}
let state = loadState();
let selected = new Set(isDemoMode?FitCheckDemo.initialSelection:[]);
let categoryFilter = 'All';
let photoData = '';
let photoVersion = 0;
let photoBusy = false;
let toastTimer;
let undoState = null;

function notify(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 6000);
}

// Persist before updating the screen so a full browser store never loses an edit silently.
function commit(nextState) {
  if (recoveryMode) { notify(storageWarning); return false; }
  try { nextState = FitCheck.validate(nextState); }
  catch (error) { notify(error.message); return false; }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)); }
  catch { notify('Could not save. Browser storage may be full or disabled. Try removing an unused piece.'); return false; }
  undoState = state;
  state = nextState;
  $('#undo-change').hidden = false;
  render();
  return true;
}

function switchWardrobeMode(demo) {
  if($('#garment-dialog').open)$('#garment-dialog').close();
  isDemoMode=demo;STORAGE_KEY=demo?DEMO_STORAGE_KEY:OWN_STORAGE_KEY;
  recoveryMode=false;state=loadState();undoState=null;$('#undo-change').hidden=true;
  selected=new Set(demo?FitCheckDemo.initialSelection:[]);activeLooks=[];suggestionMessage=demo?'Choose an occasion to find combinations from the sample wardrobe.':'Choose an occasion to find combinations from your own wardrobe.';
  $('#suggestions').replaceChildren();$('#review-examples').checked=false;categoryFilter='All';
  $('#closet-search').value='';$('#occasion-filter').value='All';$('#unworn-filter').checked=false;
  document.querySelectorAll('[data-category]').forEach(chip=>{const active=chip.dataset.category==='All';chip.classList.toggle('active',active);chip.setAttribute('aria-pressed',String(active));});
  try {localStorage.setItem('fitcheck-mode',demo?'demo':'own');} catch {notify('Workspace switched for this visit. The browser could not remember the mode.');}
  render();showView(demo?'builder':'closet');
}

function showView(view, scroll = true) {
  ['today', 'closet', 'builder', 'saved', 'planner', 'insights'].forEach((name) => { $(`#${name}-view`).hidden = name !== view; });
  $('.hero').hidden = view !== 'today';
  document.querySelectorAll('[data-view]').forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (scroll) $(`#${view}-view`).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function itemImage(item) {
  const frame = element('span', 'garment-photo');
  const message = element('span', 'photo-unavailable', 'Add a photo of this piece');
  // Old custom illustrations can still be restored from a backup, but never displayed.
  if (!canUseItem(item)) { frame.append(message); return frame; }
  const img = element('img');
  img.alt = item.name; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
  message.hidden = true;
  img.addEventListener('error', () => {
    img.hidden = true; message.hidden = false; message.textContent = 'Photo unavailable';
  });
  img.src = item.image;
  frame.append(img, message); return frame;
}
function itemCard(item, selectable = false) {
  const card = element('article', 'clothing-card');
  const image = element(selectable ? 'button' : 'div', `piece-image${selectable ? ' pick-button' : ''}`);
  image.append(itemImage(item));
  image.append(element('span', 'badge', item.occasion));
  if (selectable) {
    image.type = 'button';
    image.classList.toggle('selected', selected.has(item.id));
    image.setAttribute('aria-label', `Select ${item.name}`);
    image.setAttribute('aria-pressed', String(selected.has(item.id)));
    image.addEventListener('click', () => {
      selected = new Set(FitCheckTryOn.choose([...selected], item, state.items));
      renderBuilder();
      const replacement = [...$('#builder-grid').querySelectorAll('button')].find((button) => button.dataset.id === item.id);
      replacement?.focus({ preventScroll: true });
    });
    image.dataset.id = item.id;
  }
  const info = element('div', 'piece-info');
  info.append(element('h3', '', canUseItem(item) ? item.name : 'Earlier example · upload your own photo'));
  const meta = element('div', 'piece-meta');
  meta.append(element('span', '', `${item.origin==='demo'?'DEMO · ':''}${item.color} · ${item.category}`));
  if (!selectable) {
    const edit = element('button', 'text-button', item.origin==='demo'?'Adjust photo':'Edit'); edit.setAttribute('aria-label', `Edit ${item.name}`);
    edit.addEventListener('click', () => item.origin==='demo'?openGarmentEditor(item):editPiece(item)); meta.append(edit);
    const remove = element('button', 'text-button', 'Remove');
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.addEventListener('click', () => removeItem(item));
    meta.append(remove);
  }
  info.append(meta);
  const source=FitCheckDemo.sources[item.id];
  if(item.origin==='demo'&&source){
    const link=element('a','text-button','Revolve example ↗');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';
    link.setAttribute('aria-label',`View ${item.name} at Revolve`);info.append(link);
    if(source.edited)info.append(element('p','field-hint','Edited item-only reference'));
  }
  card.append(image, info); return card;
}

function removeItem(item) {
  const used = state.outfits.some((outfit) => outfit.itemIds.includes(item.id));
  const message = `Remove “${item.name}” from your closet?${used ? ' It will also be removed from saved outfits. Outfits with no remaining pieces will be deleted.' : ''}`;
  if (!confirm(message)) return;
  const outfits = state.outfits.map((outfit) => ({ ...outfit, itemIds: outfit.itemIds.filter((id) => id !== item.id) })).filter((outfit) => outfit.itemIds.length);
  const next = { ...state, items: state.items.filter((piece) => piece.id !== item.id), outfits, plans: state.plans.filter(p => outfits.some(o => o.id === p.outfitId)) };
  if (commit(next)) { selected.delete(item.id); renderBuilder(); notify('Piece removed from your closet.'); }
}

function renderCloset() {
  const occasion = $('#occasion-filter').value;
  const query = $('#closet-search').value.trim().toLowerCase();
  const owned = state.items.filter(canUseItem);
  const pending = state.items.length - owned.length;
  $('#ownership-notice').hidden = pending === 0;
  $('#ownership-notice').textContent = `${pending} earlier example pieces are excluded from styling. Review them below to replace their photos with your own garments, or remove them.`;
  const items = state.items.filter((item) => (canUseItem(item) || $('#review-examples').checked) && (categoryFilter === 'All' || item.category === categoryFilter) && (occasion === 'All' || item.occasion === occasion) && (!$('#unworn-filter').checked || FitCheck.underused(item)) && `${item.name} ${item.color} ${FitCheckDemo.sources[item.id]?'Revolve':''}`.toLowerCase().includes(query));
  $('#closet-grid').replaceChildren(...items.map((item) => itemCard(item)));
  $('#closet-count').textContent = owned.length;
  $('#closet-eyebrow').textContent=isDemoMode?'STYLE EXAMPLES TO EXPLORE':'CLOTHES YOU ALREADY OWN';
  $('[data-view="closet"]').textContent=isDemoMode?'Demo wardrobe':'My wardrobe';
  $('#wardrobe-mode-label').textContent=isDemoMode?'DEMO DRESSING ROOM':'MY PERSONAL WARDROBE';
  $('#wardrobe-mode-caption').textContent=isDemoMode?'Sample garments and Revolve references. Your own clothes stay separate.':'Your uploaded clothes only. Try the demo whenever you want.';
  $('#switch-wardrobe-mode').textContent=isDemoMode?'Use my own wardrobe ↗':'Try the demo ↗';
  $('#reset-demo').hidden=!isDemoMode;
  $('#today-view .demo-note').textContent=isDemoMode?'Try the sample garments here. Uploading a real piece switches to your separate personal wardrobe.':'Start with the clothes you already own. Upload garment photos in My wardrobe, then combine them in Build a Look.';
  $('#closet-empty').hidden = items.length > 0;
  $('#filter-summary').textContent = `${owned.length} ${isDemoMode?'demo':'owned'} pieces · ${items.length} shown`;
  document.querySelectorAll('#closet-grid .clothing-card').forEach((card,index) => {
    const item = items[index];
    card.append(element('p','wear-caption', FitCheck.lastWorn(item) ? `Last worn ${FitCheck.lastWorn(item)}` : 'No wear logged yet'));
    const label = element('label','availability-label','Availability');
    const select = element('select'); select.setAttribute('aria-label', `Availability of ${item.name}`);
    [['unknown','Not checked'],['ready','Clean & available'],['laundry','In the laundry']].forEach(([value,text]) => { const option = element('option','',text); option.value=value; select.append(option); });
    select.value=item.availability; select.addEventListener('change',()=> { if(commit({...state,items:state.items.map(i=>i.id===item.id?{...i,availability:select.value}:i)})) { activeLooks=[]; renderSuggestions(); } });
    label.append(select); card.append(label);
  });
}

function renderBuilder() {
  const available = state.items.filter(canUseItem);
  const picked=[...selected].filter(id => available.some(item=>item.id===id));
  let compatible=[];for(const id of picked)compatible=FitCheckTryOn.choose(compatible,available.find(item=>item.id===id),available);
  selected = new Set(compatible);
  const visible = available.filter(item => builderCategory === 'All' || item.category === builderCategory);
  $('#builder-grid').replaceChildren(...visible.map((item) => itemCard(item, true)));
  $('#builder-empty').hidden = visible.length > 0;
  $('#builder-empty').textContent = available.length ? 'No pieces in this category. Choose another category.' : 'Your closet is empty. Add a piece in My closet to get started.';
  const items = state.items.filter((item) => selected.has(item.id));
  $('#selection-count').textContent = items.length;
  const rows = items.map((item) => {
    const row = element('div', 'selected-row');
    const remove = element('button', '', '×'); remove.type = 'button'; remove.setAttribute('aria-label', `Unselect ${item.name}`);
    remove.addEventListener('click', () => { selected.delete(item.id); renderBuilder(); });
    const adjust=element('button','text-button','Adjust photo');adjust.type='button';adjust.setAttribute('aria-label',`Adjust ${item.name} on your model`);adjust.addEventListener('click',()=>openGarmentEditor(item));
    row.append(itemImage(item), element('span', '', item.name), adjust, remove); return row;
  });
  $('#selected-items').replaceChildren(...(rows.length ? rows : [element('p', 'selection-hint', 'Your look is a blank canvas. Select a piece to get started.')]));
  if (typeof renderAtelier === 'function') renderAtelier();
}

function renderSaved() {
  const ownedOutfits=state.outfits.filter(outfit=>outfit.itemIds.every(id=>canUseItem(state.items.find(item=>item.id===id))));
  $('#outfit-count').textContent = ownedOutfits.length;
  $('#saved-empty').hidden = ownedOutfits.length > 0;
  $('#saved-grid').replaceChildren(...ownedOutfits.map((outfit) => {
    const card = element('article', 'saved-card');
    const preview = element('div', 'saved-preview');
    const items = outfit.itemIds.map((id) => state.items.find((item) => item.id === id)).filter(Boolean);
    preview.append(...items.map(itemImage));
    const actions = element('div', 'piece-meta');
    const reuse = element('button', 'text-button', 'Try on this look ↗');
    reuse.addEventListener('click', () => { selected = new Set(outfit.itemIds); $('#outfit-name').value = `${outfit.name} remix`.slice(0, 60); $('#outfit-occasion').value = outfit.occasion; renderBuilder(); showView('builder'); });
    const remove = element('button', 'text-button', 'Delete'); remove.setAttribute('aria-label', `Delete outfit ${outfit.name}`);
    remove.addEventListener('click', () => { if (confirm(`Delete “${outfit.name}” and its planned dates? Your clothing items will stay in your closet.`) && commit({ ...state, outfits: state.outfits.filter((look) => look.id !== outfit.id), plans: state.plans.filter(p=>p.outfitId!==outfit.id) })) notify('Outfit deleted.'); });
    const wear = element('button','text-button','Wear today'); wear.addEventListener('click',()=>wearOutfit(outfit.itemIds));
    const plan = element('button','text-button','Plan a date'); plan.addEventListener('click',()=>{ showView('planner'); $('#plan-outfit').value=outfit.id; $('#plan-date').focus(); });
    actions.append(reuse, wear, plan, remove);
    card.append(preview, element('h3', '', outfit.name), element('span', 'badge', `${outfit.occasion} · ${items.length} pieces`), element('p', '', items.map(item => canUseItem(item) ? item.name : 'Unconfirmed earlier piece').join(' + ')), actions); return card;
  }));
}
function render() { renderCloset(); renderBuilder(); renderSaved(); if (typeof renderExtras === 'function') renderExtras(); }

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
$('#review-examples').addEventListener('change', renderCloset);
$('#switch-wardrobe-mode').addEventListener('click',()=>switchWardrobeMode(!isDemoMode));
$('#add-revolve-examples').addEventListener('click',()=>{
  if(!isDemoMode)switchWardrobeMode(true);
  const items=FitCheckDemo.addExamples(state.items);
  if(items.length===state.items.length){showView('closet');notify('All nine Revolve examples are already in the demo wardrobe.');return;}
  if(commit({...state,items})){showView('closet');notify('Revolve examples added to the demo wardrobe.');}
});
$('#reset-demo').addEventListener('click',()=>{
  if(!isDemoMode)return;
  try {const fresh=FitCheck.validate({items:FitCheckDemo.wardrobe(),outfits:[]});localStorage.setItem(DEMO_STORAGE_KEY,JSON.stringify(fresh));state=fresh;recoveryMode=false;undoState=null;$('#undo-change').hidden=true;selected=new Set(FitCheckDemo.initialSelection);activeLooks=[];suggestionMessage='Demo refreshed. Choose an occasion to try the sample wardrobe.';$('#suggestions').replaceChildren();render();notify('Demo reset. Your personal wardrobe is unchanged.');}
  catch {notify('The browser could not reset the demo. Your current data is unchanged.');}
});
$('#start-outfit').addEventListener('click', () => showView('builder'));
$('#new-outfit').addEventListener('click', () => { selected.clear(); $('#outfit-form').reset(); renderBuilder(); showView('builder'); });
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  categoryFilter = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach((chip) => { const active = chip === button; chip.classList.toggle('active', active); chip.setAttribute('aria-pressed', String(active)); });
  renderCloset();
}));
$('#occasion-filter').addEventListener('change', renderCloset);
$('#clear-selection').addEventListener('click', () => { selected.clear(); renderBuilder(); });
$('#outfit-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#outfit-name').value.trim();
  if (!selected.size) return notify('Choose at least one piece for your outfit.');
  if (!name) { $('#outfit-name').focus(); return notify('Give your outfit a name.'); }
  const outfit = { id: makeId(), name, occasion: $('#outfit-occasion').value, itemIds: [...selected] };
  if (commit({ ...state, outfits: [outfit, ...state.outfits] })) { $('#outfit-form').reset(); renderBuilder(); showView('saved'); notify('Your outfit is saved. One less thing to think about.'); }
});

$('#add-item').addEventListener('click', () => {
  if(isDemoMode)switchWardrobeMode(false);
  editingId = null; $('#dialog-title').textContent = 'A new addition'; $('#submit-item').textContent = 'Add to my closet';
  $('#item-form').reset(); $('#item-photo').required = true; photoData = ''; photoVersion++; photoBusy = false;
  $('#submit-item').disabled = false; $('#item-error').textContent = ''; $('#photo-preview').hidden = true;
  $('#item-dialog').showModal();
});
$('#close-dialog').addEventListener('click', () => $('#item-dialog').close());
$('#photo-preview').addEventListener('error', () => { $('#photo-preview').hidden = true; $('#item-error').textContent = 'Photo unavailable. Upload a replacement photo.'; });

// Resize photos before saving: a few large phone photos can otherwise fill localStorage.
$('#item-photo').addEventListener('change', async (event) => {
  const version = ++photoVersion;
  const previousPhoto = photoData;
  photoData = ''; photoBusy = false; $('#submit-item').disabled = false;
  $('#photo-preview').hidden = true; $('#item-error').textContent = '';
  const file = event.target.files[0];
  if (!file) { photoData = previousPhoto; $('#photo-preview').hidden = !photoData; if (photoData) $('#photo-preview').src = photoData; photoBusy = false; $('#submit-item').disabled = false; return; }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
    $('#item-error').textContent = 'Choose a JPG, PNG, or WebP image smaller than 15 MB.'; event.target.value = ''; return;
  }
  photoBusy = true; $('#submit-item').disabled = true;
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    if (!img.width || !img.height || img.width * img.height > 50000000) throw Error('Unsupported image dimensions');
    const scale = Math.min(1, 600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
    const context = canvas.getContext('2d'); context.fillStyle = '#f8f7f3'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (version !== photoVersion) return;
    photoData = canvas.toDataURL('image/jpeg', 0.75); $('#photo-preview').src = photoData; $('#photo-preview').hidden = false;
  } catch { if (version === photoVersion) { $('#item-error').textContent = 'This photo could not be read. Please choose another image.'; event.target.value = ''; } }
  finally { URL.revokeObjectURL(url); if (version === photoVersion) { photoBusy = false; $('#submit-item').disabled = false; } }
});
$('#item-form').addEventListener('submit', (event) => {
  event.preventDefault(); if (photoBusy) return;
  const name = $('#item-name').value.trim(); const color = $('#item-color').value.trim(); const category = $('#item-category').value;
  if (!name || !color) { $('#item-error').textContent = 'Please enter an item name and color.'; return; }
  if (!photoData || !FitCheck.photoOK(photoData)) { $('#item-error').textContent = 'Upload a JPG, PNG, or WebP photo of this piece before saving.'; $('#item-photo').focus(); return; }
  const previous = state.items.find(i=>i.id===editingId);
  const item = { ...previous, id: previous?.id || makeId(), name, color, category, occasion: $('#item-occasion').value, image: photoData, origin:'owned', fitting:previous && previous.image===photoData && previous.category===category ? previous.fitting : undefined };
  if (commit({ ...state, items: previous ? state.items.map(i=>i.id===previous.id?item:i) : [...state.items, item] })) { $('#item-dialog').close(); activeLooks=[]; renderSuggestions(); notify(previous ? 'Piece updated.' : 'A new possibility, added to your closet.'); }
});

render();
if (storageWarning) notify(storageWarning);

document.querySelectorAll('[data-builder-category]').forEach(button => button.addEventListener('click', () => {
  builderCategory = button.dataset.builderCategory;
  document.querySelectorAll('[data-builder-category]').forEach(chip => { const active = chip === button; chip.classList.toggle('active', active); chip.setAttribute('aria-pressed', String(active)); });
  renderBuilder();
}));
