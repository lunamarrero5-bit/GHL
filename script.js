// FitCheck uses plain JavaScript. No account, server, or installation is needed.
const STORAGE_KEY = 'fitcheck-v1';
const categories = ['Tops', 'Bottoms', 'Layers', 'Shoes', 'Dresses'];
const occasions = ['Casual', 'Work', 'Going out'];
const $ = (selector) => document.querySelector(selector);
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Small original SVG illustrations keep the starter wardrobe available offline.
function illustration(category, color = '#d0c3b7') {
  const shapes = {
    Tops: '<path d="M65 40 85 28Q100 43 115 28L135 40 175 75 150 105 130 88 135 175H65L70 88 50 105 25 75Z"/><path d="M85 28Q100 65 115 28" fill="none"/>',
    Bottoms: '<path d="M55 25H145L153 195H113L100 85 87 195H47Z"/><path d="M55 45H145M100 25V85M60 45Q60 65 80 65M140 45Q140 65 120 65" fill="none"/>',
    Layers: '<path d="M75 30 45 48 25 165 53 173 70 90 65 190H135L130 90 147 173 175 165 155 48 125 30Z"/><path d="M75 30 100 75 125 30M100 75V190M77 115H91M109 115H123" fill="none"/>',
    Shoes: '<path d="M35 105 65 92 100 128 150 143Q179 149 177 169H30Q16 155 35 105Z"/><path d="M25 160H175M78 112 64 124M90 124 76 136M103 134 89 146" fill="none"/>',
    Dresses: '<path d="M78 25 90 30Q100 45 110 30L122 25 135 65 116 85 158 190H42L84 85 65 65Z"/><path d="M84 85H116" fill="none"/>'
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220"><g fill="${color}" stroke="#635e58" stroke-width="1.5" stroke-linejoin="round">${shapes[category] || shapes.Tops}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function starterWardrobe() {
  return [
    ['Everyday cotton tee', 'Tops', 'Red', 'Casual', '#c94040'],
    ['Straight-leg denim', 'Bottoms', 'Blue', 'Casual', '#66809b'],
    ['The oversized blazer', 'Layers', 'Sand', 'Work', '#c4af94'],
    ['Weekend sneakers', 'Shoes', 'White', 'Casual', '#e6e2d6'],
    ['Little black dress', 'Dresses', 'Black', 'Going out', '#45444b'],
    ['Relaxed button-down', 'Tops', 'Sage', 'Work', '#a8b4a0'],
    ['Tailored trousers', 'Bottoms', 'Charcoal', 'Work', '#77777b'],
    ['Evening ballet flats', 'Shoes', 'Burgundy', 'Going out', '#8f5260']
  ].map(([name, category, color, occasion, shade]) => ({ id: makeId(), name, category, color, occasion, image: illustration(category, shade) }));
}

let storageWarning = '';
let recoveryMode = false;
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return FitCheck.validate({ items: starterWardrobe(), outfits: [] });
    const data = JSON.parse(raw);
    const validItem = (item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.color === 'string' && categories.includes(item.category) && occasions.includes(item.occasion) && typeof item.image === 'string' && /^data:image\/(svg\+xml|jpeg|png|webp)[;,]/.test(item.image);
    if (!data || !Array.isArray(data.items) || !data.items.every(validItem) || !Array.isArray(data.outfits) || !data.outfits.every((outfit) => outfit && typeof outfit.id === 'string' && typeof outfit.name === 'string' && occasions.includes(outfit.occasion) && Array.isArray(outfit.itemIds) && outfit.itemIds.every((id) => data.items.some((item) => item.id === id)))) throw new Error('Invalid saved data');
    // Update the original sample tee in closets saved before its color changed.
    data.items = data.items.map((item) => item.name === 'Everyday cotton tee' && item.category === 'Tops' && item.color === 'Cream' && item.image === illustration('Tops', '#e4dfcf')
      ? { ...item, color: 'Red', image: illustration('Tops', '#c94040') }
      : item);
    return FitCheck.validate(data);
  } catch {
    recoveryMode = true;
    storageWarning = 'Your saved closet could not be read. It has not been overwritten. Download the original data in Insights & backup, then restore a valid backup.';
    return FitCheck.validate({ items: starterWardrobe(), outfits: [] });
  }
}
let state = loadState();
let selected = new Set();
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
  const img = element('img'); img.src = item.image; img.alt = item.name;
  img.addEventListener('error', () => { img.src = illustration(item.category); }, { once: true });
  return img;
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
      selected.has(item.id) ? selected.delete(item.id) : selected.add(item.id);
      renderBuilder();
      const replacement = [...$('#builder-grid').querySelectorAll('button')].find((button) => button.dataset.id === item.id);
      replacement?.focus({ preventScroll: true });
    });
    image.dataset.id = item.id;
  }
  const info = element('div', 'piece-info');
  info.append(element('h3', '', item.name));
  const meta = element('div', 'piece-meta');
  meta.append(element('span', '', `${item.color} · ${item.category}`));
  if (!selectable) {
    const edit = element('button', 'text-button', 'Edit'); edit.setAttribute('aria-label', `Edit ${item.name}`);
    edit.addEventListener('click', () => editPiece(item)); meta.append(edit);
    const remove = element('button', 'text-button', 'Remove');
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.addEventListener('click', () => removeItem(item));
    meta.append(remove);
  }
  info.append(meta); card.append(image, info); return card;
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
  const items = state.items.filter((item) => (categoryFilter === 'All' || item.category === categoryFilter) && (occasion === 'All' || item.occasion === occasion) && (!$('#unworn-filter').checked || FitCheck.underused(item)) && `${item.name} ${item.color}`.toLowerCase().includes(query));
  $('#closet-grid').replaceChildren(...items.map((item) => itemCard(item)));
  $('#closet-count').textContent = state.items.length;
  $('#closet-empty').hidden = items.length > 0;
  $('#filter-summary').textContent = `${items.length} of ${state.items.length} pieces shown`;
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
  $('#builder-grid').replaceChildren(...state.items.map((item) => itemCard(item, true)));
  $('#builder-empty').hidden = state.items.length > 0;
  const items = state.items.filter((item) => selected.has(item.id));
  $('#selection-count').textContent = items.length;
  const rows = items.map((item) => {
    const row = element('div', 'selected-row');
    const remove = element('button', '', '×'); remove.type = 'button'; remove.setAttribute('aria-label', `Unselect ${item.name}`);
    remove.addEventListener('click', () => { selected.delete(item.id); renderBuilder(); });
    row.append(itemImage(item), element('span', '', item.name), remove); return row;
  });
  $('#selected-items').replaceChildren(...(rows.length ? rows : [element('p', 'selection-hint', 'Your look is a blank canvas. Select a piece to get started.')]));
}

function renderSaved() {
  $('#outfit-count').textContent = state.outfits.length;
  $('#saved-empty').hidden = state.outfits.length > 0;
  $('#saved-grid').replaceChildren(...state.outfits.map((outfit) => {
    const card = element('article', 'saved-card');
    const preview = element('div', 'saved-preview');
    const items = outfit.itemIds.map((id) => state.items.find((item) => item.id === id)).filter(Boolean);
    preview.append(...items.map(itemImage));
    const actions = element('div', 'piece-meta');
    const reuse = element('button', 'text-button', 'Use as a starting point ↗');
    reuse.addEventListener('click', () => { selected = new Set(outfit.itemIds); $('#outfit-name').value = `${outfit.name} remix`.slice(0, 60); $('#outfit-occasion').value = outfit.occasion; renderBuilder(); showView('builder'); });
    const remove = element('button', 'text-button', 'Delete'); remove.setAttribute('aria-label', `Delete outfit ${outfit.name}`);
    remove.addEventListener('click', () => { if (confirm(`Delete “${outfit.name}” and its planned dates? Your clothing items will stay in your closet.`) && commit({ ...state, outfits: state.outfits.filter((look) => look.id !== outfit.id), plans: state.plans.filter(p=>p.outfitId!==outfit.id) })) notify('Outfit deleted.'); });
    const wear = element('button','text-button','Wear today'); wear.addEventListener('click',()=>wearOutfit(outfit.itemIds));
    const plan = element('button','text-button','Plan a date'); plan.addEventListener('click',()=>{ showView('planner'); $('#plan-outfit').value=outfit.id; $('#plan-date').focus(); });
    actions.append(reuse, wear, plan, remove);
    card.append(preview, element('h3', '', outfit.name), element('span', 'badge', `${outfit.occasion} · ${items.length} pieces`), element('p', '', items.map((item) => item.name).join(' + ')), actions); return card;
  }));
}
function render() { renderCloset(); renderBuilder(); renderSaved(); if (typeof renderExtras === 'function') renderExtras(); }

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
$('#start-outfit').addEventListener('click', () => { showView('today'); $('#style-occasion').focus(); });
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
  if (commit({ ...state, outfits: [outfit, ...state.outfits] })) { selected.clear(); $('#outfit-form').reset(); renderBuilder(); showView('saved'); notify('Your outfit is saved. One less thing to think about.'); }
});

$('#add-item').addEventListener('click', () => {
  editingId = null; $('#dialog-title').textContent = 'A new addition'; $('#submit-item').textContent = 'Add to my closet';
  $('#item-form').reset(); photoData = ''; photoVersion++; photoBusy = false;
  $('#submit-item').disabled = false; $('#item-error').textContent = ''; $('#photo-preview').hidden = true;
  $('#item-dialog').showModal();
});
$('#close-dialog').addEventListener('click', () => $('#item-dialog').close());

// Resize photos before saving: a few large phone photos can otherwise fill localStorage.
$('#item-photo').addEventListener('change', async (event) => {
  const version = ++photoVersion;
  photoData = ''; photoBusy = false; $('#submit-item').disabled = false;
  $('#photo-preview').hidden = true; $('#item-error').textContent = '';
  const file = event.target.files[0];
  if (!file) { photoBusy = false; $('#submit-item').disabled = false; return; }
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
  const previous = state.items.find(i=>i.id===editingId);
  const item = { ...previous, id: previous?.id || makeId(), name, color, category, occasion: $('#item-occasion').value, image: photoData || illustration(category, $('#item-shade').value) };
  if (commit({ ...state, items: previous ? state.items.map(i=>i.id===previous.id?item:i) : [...state.items, item] })) { $('#item-dialog').close(); activeLooks=[]; renderSuggestions(); notify(previous ? 'Piece updated.' : 'A new possibility, added to your closet.'); }
});

render();
if (storageWarning) notify(storageWarning);
