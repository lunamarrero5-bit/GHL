/* Editorial collection and personal-avatar setup. Built with browser APIs only. */
const Avatar = FitCheckAvatar;
const AVATAR_KEY = 'fitcheck-avatar-v1';
const measurementTips = {
  height: 'Stand barefoot against a wall. Measure from the floor to the top of your head; a flat book helps mark the height.',
  chest: 'Wrap the tape around the fullest part of your chest or bust. Keep it level across your back, with arms relaxed.',
  waist: 'Measure around your natural waist, usually the narrowest point between your ribs and hips. Breathe normally; do not pull in.',
  hips: 'With feet together, measure around the fullest part of your hips and seat. Check in a mirror that the tape is level.',
  inseam: 'Measure along the inside of your leg from the crotch to the ankle. A helper can make this easier.',
  shoulders: 'Measure across your back, from the outer tip of one shoulder to the outer tip of the other. Ask someone to help.'
};
const skinNames = ['Light', 'Light medium', 'Medium', 'Medium deep', 'Deep', 'Rich deep'];
const hairNames = ['Soft black', 'Chestnut', 'Golden blonde', 'Auburn', 'Silver'];
let avatarProfile = null;
let avatarRaw = null;
let avatarReadError = '';
let setupStep = 0;
let draftUnit = 'cm';
let highlightedMeasurement = '';
let setupStorageSnapshot = null;
let allCollectionPieces = false;

function readAvatar() {
  avatarReadError = '';
  try {
    avatarRaw = localStorage.getItem(AVATAR_KEY);
    avatarProfile = avatarRaw === null ? null : Avatar.validate(JSON.parse(avatarRaw));
  } catch {
    avatarProfile = null;
    avatarReadError = 'Your avatar could not be loaded. Your wardrobe is safe. You can export or delete the existing avatar data in setup.';
  }
}

function renderAtelier() {
  // The wardrobe can render before this script is loaded.
  if (!$('#home-avatar')) return;
  const profile = avatarProfile || Avatar.example;
  $('#home-avatar').innerHTML = Avatar.svg(profile);
  $('#builder-avatar').innerHTML = Avatar.svg(profile);
  $('#avatar-status').textContent = avatarProfile ? 'YOUR PERSONAL AVATAR' : 'EXAMPLE AVATAR';
  $('#avatar-caption').textContent = avatarProfile ? `${profile.name || 'Your'}${profile.name ? '’s' : ''} personal silhouette.` : 'Make this silhouette yours.';
  $('#avatar-height').textContent = avatarProfile ? `${Avatar.display(profile.height, profile.unit)} ${profile.unit.toUpperCase()} / PERSONAL PROPORTIONS` : 'MADE TO YOUR MEASUREMENTS';
  $('#create-avatar').textContent = avatarProfile ? 'EDIT MY AVATAR ↗' : 'CREATE MY AVATAR ↗';
  $('#profile-initial').textContent = avatarProfile?.name ? Array.from(avatarProfile.name)[0].toUpperCase() : '◇';
  $('#profile-button').setAttribute('aria-label', avatarProfile ? 'Edit your avatar and measurements' : 'Create your personal avatar');
  renderCollection();
}

function renderCollection() {
  const pieces = allCollectionPieces ? FitCheck.catalog.pieces : FitCheck.catalog.pieces.slice(0, 4);
  $('#editorial-grid').replaceChildren(...pieces.map((piece, index) => {
    const card = element('article', 'editorial-product');
    const photo = element('div', 'editorial-product-image');
    photo.append(itemImage(piece), element('span', 'product-number', String(index + 1).padStart(2, '0')));
    const inCloset = state.items.some(item => item.image === piece.image);
    const action = element('button', 'collection-add', inCloset ? 'IN YOUR WARDROBE ↗' : '+ ADD SAMPLE PIECE');
    action.type = 'button';
    action.setAttribute('aria-label', `${inCloset ? 'View' : 'Add sample'} ${piece.name}`);
    action.addEventListener('click', () => {
      if (inCloset) { showView('closet'); return; }
      const { name, category, color, occasion, image } = piece;
      if (commit({ ...state, items: [...state.items, { id: makeId(), name, category, color, occasion, image }] })) {
        activeLooks = []; renderSuggestions();
        notify('Sample piece added. Replace it with your own clothing photo whenever you like.');
      }
    });
    photo.append(action);
    const source = element('a', 'product-source', `${piece.brand} / REVOLVE ↗`);
    source.href = piece.source; source.target = '_blank'; source.rel = 'noopener noreferrer';
    source.setAttribute('aria-label', `View the original ${piece.name} on REVOLVE`);
    card.append(photo, element('p', 'eyebrow', piece.edit), element('h3', '', piece.name), element('p', 'editorial-product-meta', `${piece.color} / ${piece.category}`), source);
    return card;
  }));
  $('#view-all-edit').textContent = allCollectionPieces ? 'SHOW THE HIGHLIGHTS ↑' : `VIEW ALL ${FitCheck.catalog.pieces.length} PIECES ↗`;
}

function makeSwatches(target, group, values, names) {
  const nodes = values.map((value, index) => {
    const label = element('label', 'swatch');
    const input = element('input'); input.type = 'radio'; input.name = group; input.value = value;
    input.setAttribute('aria-label', names[index]);
    const dot = element('span'); dot.style.backgroundColor = value; dot.title = names[index];
    label.append(input, dot); return label;
  });
  $(target).append(...nodes);
}

function buildMeasurementFields() {
  $('#measurement-fields').replaceChildren(...Object.keys(Avatar.ranges).map((key, index) => {
    const wrapper = element('div', 'measurement-field');
    const label = element('label', '', `${String(index + 1).padStart(2, '0')} / ${Avatar.labels[key]}`); label.htmlFor = `measure-${key}`;
    const box = element('div', 'measurement-input-wrap');
    const input = element('input'); input.type = 'number'; input.id = `measure-${key}`; input.step = '0.1'; input.inputMode = 'decimal'; input.required = true;
    input.setAttribute('aria-describedby', 'measurement-help'); input.placeholder = '—';
    input.addEventListener('focus', () => { highlightedMeasurement = key; $('#measurement-help').textContent = measurementTips[key]; renderSetupPreview(); });
    input.addEventListener('input', () => { delete input.dataset.cm; input.removeAttribute('aria-invalid'); $('#avatar-error').textContent = ''; renderSetupPreview(); });
    box.append(input, element('span', 'measurement-unit', draftUnit));
    wrapper.append(label, box); return wrapper;
  }));
}

function currentAppearance() {
  return {
    name: $('#avatar-name').value.trim(), unit: draftUnit,
    skin: document.querySelector('[name="avatar-skin"]:checked')?.value || Avatar.example.skin,
    hair: document.querySelector('[name="avatar-hair"]:checked')?.value || Avatar.example.hair,
    hairstyle: $('#avatar-hairstyle').value
  };
}

function completeDraft() {
  const input = currentAppearance();
  for (const key of Object.keys(Avatar.ranges)) {
    const field = $(`#measure-${key}`);
    if (field.value === '') throw Error(`Enter your ${Avatar.labels[key].toLowerCase()}.`);
    input[key] = field.dataset.cm === undefined ? Avatar.cm(field.value, draftUnit) : Number(field.dataset.cm);
  }
  return Avatar.validate(input);
}

function previewDraft() {
  // Unfilled fields use example proportions only for a visibly labeled preview.
  const draft = { ...(avatarProfile || Avatar.example), ...currentAppearance() };
  for (const [key, [min, max]] of Object.entries(Avatar.ranges)) {
    const field = $(`#measure-${key}`);
    const raw = field.value;
    const value = field.dataset.cm === undefined ? Avatar.cm(raw, draftUnit) : Number(field.dataset.cm);
    if (raw !== '' && Number.isFinite(value) && value >= min && value <= max) draft[key] = value;
  }
  try { return Avatar.validate(draft); }
  catch { return { ...(avatarProfile || Avatar.example), ...currentAppearance() }; }
}

function renderSetupPreview() {
  $('#setup-avatar').innerHTML = Avatar.svg(previewDraft(), setupStep === 1 ? highlightedMeasurement : '');
  let complete = false;
  try { completeDraft(); complete = true; } catch { /* Missing measurements still allow an appearance preview. */ }
  $('#preview-status').textContent = complete ? 'YOUR PROPORTIONS' : 'APPEARANCE PREVIEW';
  $('#preview-note').textContent = complete ? 'A stylized interpretation of your measurements.' : 'Example proportions until all six measurements are entered.';
}

function setSetupStep(index) {
  setupStep = index; $('#avatar-error').textContent = '';
  document.querySelectorAll('.setup-step').forEach((step, i) => { step.hidden = i !== index; });
  document.querySelectorAll('[data-setup-step]').forEach((step, i) => {
    if (i === index) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    step.classList.toggle('complete', i < index);
  });
  $('#setup-back').hidden = index === 0;
  $('#setup-next').textContent = index === 2 ? 'SAVE MY AVATAR ↗' : 'CONTINUE →';
  if (index === 2) {
    const profile = completeDraft();
    $('#measurement-summary').replaceChildren(...Object.keys(Avatar.ranges).flatMap(key => [element('dt', '', Avatar.labels[key]), element('dd', '', `${Avatar.display(profile[key], draftUnit)} ${draftUnit}`)]));
  }
  renderSetupPreview();
  if ($('#avatar-dialog').open) {
    const heading = $(`#setup-step-${index} h2`); heading.tabIndex = -1; heading.focus({ preventScroll: true });
    $('.setup-content').scrollTop = 0;
  }
}

function updateUnitLabels() {
  document.querySelectorAll('.measurement-unit').forEach(label => { label.textContent = draftUnit; });
  for (const [key, [min, max]] of Object.entries(Avatar.ranges)) {
    const input = $(`#measure-${key}`);
    input.min = Math.ceil(min / (draftUnit === 'in' ? 2.54 : 1) * 10) / 10;
    input.max = Math.floor(max / (draftUnit === 'in' ? 2.54 : 1) * 10) / 10;
  }
}

function openAvatar() {
  readAvatar(); setupStorageSnapshot = avatarRaw;
  const profile = avatarProfile || Avatar.example;
  draftUnit = profile.unit; highlightedMeasurement = '';
  $('#avatar-name').value = profile.name; $('#avatar-hairstyle').value = profile.hairstyle;
  document.querySelectorAll('[name="avatar-skin"]').forEach(input => { input.checked = input.value === profile.skin; });
  document.querySelectorAll('[name="avatar-hair"]').forEach(input => { input.checked = input.value === profile.hair; });
  document.querySelectorAll('[name="avatar-unit"]').forEach(input => { input.checked = input.value === draftUnit; });
  for (const key of Object.keys(Avatar.ranges)) {
    const field = $(`#measure-${key}`);
    field.value = avatarProfile ? Avatar.display(profile[key], draftUnit) : '';
    if (avatarProfile) field.dataset.cm = String(profile[key]); else delete field.dataset.cm;
    field.removeAttribute('aria-invalid');
  }
  $('#profile-manage').hidden = !avatarProfile && avatarRaw === null;
  updateUnitLabels(); setSetupStep(0);
  $('#avatar-dialog').showModal();
  if (avatarReadError) $('#avatar-error').textContent = avatarReadError;
}

function openGuide() { $('#guide-dialog').showModal(); }
function stopVideo() {
  const iframe = $('#measurement-video iframe');
  if (iframe) iframe.remove();
  $('#load-video').hidden = false;
}

makeSwatches('#skin-swatches', 'avatar-skin', Avatar.tones, skinNames);
makeSwatches('#hair-swatches', 'avatar-hair', Avatar.hairColors, hairNames);
buildMeasurementFields();
readAvatar();
renderAtelier();
if (avatarReadError) notify(avatarReadError);

['#create-avatar', '#edit-avatar', '#profile-button', '#builder-edit-avatar', '#footer-avatar'].forEach(selector => $(selector).addEventListener('click', openAvatar));
$('#close-avatar').addEventListener('click', () => $('#avatar-dialog').close());
$('#avatar-brand').addEventListener('click', event => { event.preventDefault(); $('#avatar-dialog').close(); });
$('#setup-back').addEventListener('click', () => setSetupStep(setupStep - 1));
$('#avatar-form').addEventListener('input', renderSetupPreview);
$('#avatar-form').addEventListener('submit', event => {
  event.preventDefault();
  if (setupStep === 0) { setSetupStep(1); return; }
  let profile;
  try { profile = completeDraft(); }
  catch (error) {
    $('#avatar-error').textContent = error.message;
    for (const key of Object.keys(Avatar.ranges)) {
      const input = $(`#measure-${key}`);
      if (!input.checkValidity()) { input.setAttribute('aria-invalid', 'true'); input.focus(); break; }
    }
    return;
  }
  if (setupStep === 1) { setSetupStep(2); return; }
  try {
    if (localStorage.getItem(AVATAR_KEY) !== setupStorageSnapshot) throw Error('Your avatar changed in another tab. Close setup and reopen it to see the latest version.');
    const saved = Avatar.save(localStorage, profile);
    avatarProfile = saved; avatarRaw = JSON.stringify(saved); avatarReadError = '';
    renderAtelier(); $('#avatar-dialog').close();
    notify(`${saved.name ? `${saved.name}, your` : 'Your'} personal avatar is ready. Welcome to your dressing room.`);
  } catch (error) { $('#avatar-error').textContent = error.message.includes('another tab') ? error.message : 'Your avatar could not be saved. Browser storage may be full or disabled. Your previous avatar is unchanged.'; }
});

document.querySelectorAll('[name="avatar-unit"]').forEach(input => input.addEventListener('change', () => {
  const newUnit = input.value;
  if (newUnit === draftUnit) return;
  for (const key of Object.keys(Avatar.ranges)) {
    const field = $(`#measure-${key}`);
    if (field.value !== '' && Number.isFinite(Number(field.value))) {
      const canonical = field.dataset.cm === undefined ? Avatar.cm(field.value, draftUnit) : Number(field.dataset.cm);
      field.dataset.cm = String(canonical);
      field.value = Avatar.display(canonical, newUnit);
    }
  }
  draftUnit = newUnit; updateUnitLabels(); renderSetupPreview();
}));

$('#delete-avatar').addEventListener('click', () => {
  if (!confirm('Delete your avatar, name, and measurements from this browser? Your wardrobe and saved outfits will stay.')) return;
  try {
    localStorage.removeItem(AVATAR_KEY); avatarProfile = null; avatarRaw = null; avatarReadError = '';
    renderAtelier(); $('#avatar-dialog').close(); notify('Your avatar and measurements have been deleted.');
  } catch { $('#avatar-error').textContent = 'The browser prevented deletion. Your saved avatar is unchanged.'; }
});
$('#export-avatar').addEventListener('click', () => {
  if (avatarRaw === null) return;
  const url = URL.createObjectURL(new Blob([avatarRaw], { type: 'application/json' }));
  const link = element('a'); link.href = url; link.download = 'fitcheck-avatar.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('#view-all-edit').addEventListener('click', () => { allCollectionPieces = !allCollectionPieces; renderCollection(); });
$('#explore-edit').addEventListener('click', () => $('#collection-section').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
['#open-guide', '#setup-guide'].forEach(selector => $(selector).addEventListener('click', openGuide));
$('#close-guide').addEventListener('click', () => $('#guide-dialog').close());
$('#guide-dialog').addEventListener('close', stopVideo);
$('#load-video').addEventListener('click', () => {
  const iframe = element('iframe'); iframe.title = 'Crafty Gemini: Intro to Body Measurements for Sewing Patterns';
  iframe.src = 'https://www.youtube-nocookie.com/embed/ajdM2TqRehI?rel=0';
  iframe.allow = 'encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  $('#load-video').hidden = true; $('#measurement-video').append(iframe);
});
$('#measurement-guide-grid').replaceChildren(...Object.keys(Avatar.ranges).map((key, index) => {
  const tile = element('article', 'measurement-guide-card'); const figure = element('div', 'guide-figure');
  figure.innerHTML = Avatar.svg(Avatar.example, key);
  tile.append(figure, element('h3', '', `${String(index + 1).padStart(2, '0')} / ${Avatar.labels[key]}`), element('p', '', measurementTips[key])); return tile;
}));
const editorialCover = $('.editorial-image img');
function showCoverFallback() { editorialCover.hidden = true; $('.editorial-image-fallback').hidden = false; }
editorialCover.addEventListener('error', showCoverFallback);
if (editorialCover.complete && editorialCover.naturalWidth === 0) showCoverFallback();
window.addEventListener('storage', event => {
  if (event.key === AVATAR_KEY || event.key === null) {
    readAvatar(); renderAtelier();
    if ($('#avatar-dialog').open) $('#avatar-error').textContent = 'Your avatar changed in another tab. Close and reopen setup before saving.';
  }
});
