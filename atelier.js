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
let avatarProfile = null;
let avatarRaw = null;
let avatarReadError = '';
let setupStep = 0;
const draftUnit = 'in';
let highlightedMeasurement = '';
let setupStorageSnapshot = null;

function readAvatar() {
  avatarReadError = '';
  try {
    avatarRaw = localStorage.getItem(AVATAR_KEY);
    avatarProfile = avatarRaw === null ? null : Avatar.validate(JSON.parse(avatarRaw));
  } catch {
    avatarProfile = null;
    avatarReadError = 'Your model could not be loaded. Your wardrobe is safe. You can export or delete the existing avatar data in setup.';
  }
}

function renderAtelier() {
  // The wardrobe can render before this script is loaded.
  if (!$('#home-avatar')) return;
  const profile = avatarProfile || Avatar.example;
  renderDressedAvatar($('#home-avatar'), profile, [...selected], 'home');
  renderDressedAvatar($('#builder-avatar'), profile, [...selected], 'builder');
  $('#avatar-status').textContent = `${FitCheckHuman.presetFor(profile).label.toUpperCase()} / FIXED POSE`;
  $('#avatar-caption').textContent = avatarProfile ? `${profile.name || 'Your'}${profile.name ? '’s' : ''} personal silhouette.` : 'Make this silhouette yours.';
  $('#avatar-height').textContent = 'PHOTOGRAPHIC SAMPLE MODEL';
  $('#create-avatar').textContent = avatarProfile ? 'EDIT MY MODEL ↗' : 'PERSONALIZE MY MODEL ↗';
  $('#profile-initial').textContent = avatarProfile?.name ? Array.from(avatarProfile.name)[0].toUpperCase() : '◇';
  $('#profile-button').setAttribute('aria-label', avatarProfile ? 'Edit your model and measurements' : 'Create your personal model');
  renderMeasurementNotes();
}

function renderMeasurementNotes() {
  const panel=$('#home-measurement-notes');panel.hidden=!$('#show-measurement-notes').checked;
  panel.replaceChildren();
  if(!avatarProfile?.measurementsProvided) { panel.append(element('p','','No measurements saved. Add optional notes in Personalize.'));return; }
  ['height','chest','waist','hips'].forEach(key=>panel.append(element('dt','',Avatar.labels[key]),element('dd','',key==='height'?Avatar.heightLabel(avatarProfile.height):`${Avatar.display(avatarProfile[key],'in')} in`)));
}


function buildMeasurementFields() {
  $('#measurement-fields').replaceChildren(...Object.keys(Avatar.ranges).filter(key => key !== 'height').map((key, index) => {
    const wrapper = element('div', 'measurement-field');
    const label = element('label', '', `${String(index + 2).padStart(2, '0')} / ${Avatar.labels[key]}`); label.htmlFor = `measure-${key}`;
    const box = element('div', 'measurement-input-wrap');
    const input = element('input'); input.type = 'number'; input.id = `measure-${key}`; input.step = '0.1'; input.inputMode = 'decimal'; input.required = false;
    input.setAttribute('aria-describedby', 'measurement-help'); input.placeholder = '—';
    input.addEventListener('focus', () => { highlightedMeasurement = key; $('#measurement-help').textContent = measurementTips[key]; renderSetupPreview(); });
    input.addEventListener('input', () => { delete input.dataset.cm; input.removeAttribute('aria-invalid'); $('#avatar-error').textContent = ''; renderSetupPreview(); });
    box.append(input, element('span', 'measurement-unit', draftUnit));
    if (!input.required) label.append(element('span', 'optional', ' / optional'));
    wrapper.append(label, box); return wrapper;
  }));
}

function currentAppearance() {
  return {
    name: $('#avatar-name').value.trim(), unit: draftUnit,
    shape: $('#avatar-shape').value,
    skin: (avatarProfile || Avatar.example).skin,
    hair: (avatarProfile || Avatar.example).hair,
    hairstyle: 'none'
  };
}

function completeDraft() {
  const fields=[$('#height-feet'),$('#height-inches'),...Object.keys(Avatar.ranges).filter(key=>key!=='height').map(key=>$(`#measure-${key}`))];
  if(fields.every(field=>field.value==='')) return Avatar.validate({...Avatar.example,...currentAppearance(),measurementsProvided:false});
  const input = {...currentAppearance(), feet:$('#height-feet').value, inches:$('#height-inches').value};
  if ($('#height-feet').dataset.cm!==undefined) {
    const total=Number($('#height-feet').dataset.cm)/2.54;
    input.feet=Math.floor(total/12);input.inches=total-input.feet*12;
  }
  for (const key of Object.keys(Avatar.ranges).filter(key=>key!=='height')) {
    const field=$(`#measure-${key}`);
    input[key]=field.value!==''&&field.dataset.cm!==undefined?Number(field.dataset.cm)/2.54:field.value;
  }
  return Avatar.fromUS({...input,measurementsProvided:true});
}

function previewDraft() {
  try { return completeDraft(); } catch { /* Show a partial preview while measuring. */ }
  const base=avatarProfile || Avatar.example;
  const height=Avatar.usHeight(base.height);
  const input={...currentAppearance(),feet:$('#height-feet').value || height.feet,inches:$('#height-inches').value || height.inches};
  for (const key of Object.keys(Avatar.ranges).filter(key=>key!=='height')) {
    const raw=$(`#measure-${key}`).value;
    input[key]=raw || Avatar.display(base[key],'in');
  }
  try { return Avatar.fromUS(input); } catch { return {...base,...currentAppearance()}; }
}

function renderSetupPreview() {
  $('#setup-avatar').innerHTML = Avatar.svg(previewDraft(), setupStep === 1 ? highlightedMeasurement : '', 'setup');
  let complete = false;
  try { completeDraft(); complete = true; } catch { /* Missing measurements still allow an appearance preview. */ }
  $('#preview-status').textContent = `${FitCheckHuman.presetFor(previewDraft()).label.toUpperCase()} / FIXED POSE`;
  $('#preview-note').textContent = 'A separate photographic model for this shape. Measurements never stretch the figure.';
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
    $('#measurement-summary').replaceChildren(element('dt','','Body shape'),element('dd','',FitCheckHuman.presetFor(profile).label),...(profile.measurementsProvided?Object.keys(Avatar.ranges).flatMap(key => [element('dt', '', Avatar.labels[key]), element('dd', '', key === 'height' ? Avatar.heightLabel(profile.height) : `${Avatar.display(profile[key], 'in')} in${profile.estimated?.includes(key) ? ' (estimated)' : ''}`)]):[element('dt','','Measurements'),element('dd','','Not added (optional)')]));
  }
  renderSetupPreview();
  if ($('#avatar-dialog').open) {
    const heading = $(`#setup-step-${index} h2`); heading.tabIndex = -1; heading.focus({ preventScroll: true });
    $('.setup-content').scrollTop = 0;
  }
}

function updateUnitLabels() {
  document.querySelectorAll('.measurement-unit').forEach(label=>{label.textContent='in';});
  for (const [key,[min,max]] of Object.entries(Avatar.ranges)) {
    if (key==='height') continue;
    const field=$(`#measure-${key}`);field.min=Math.ceil(min/2.54*10)/10;field.max=Math.floor(max/2.54*10)/10;
  }
}

function openAvatar() {
  readAvatar(); setupStorageSnapshot = avatarRaw;
  const profile = avatarProfile || Avatar.example;
  highlightedMeasurement = '';
  $('#avatar-name').value = profile.name; $('#avatar-shape').value=profile.shape;
  const hasMeasurements=avatarProfile?.measurementsProvided;
  const height=Avatar.usHeight(profile.height);
  $('#height-feet').value=hasMeasurements?height.feet:'';$('#height-inches').value=hasMeasurements?height.inches:'';
  if (hasMeasurements) $('#height-feet').dataset.cm=String(profile.height); else delete $('#height-feet').dataset.cm;
  for (const key of Object.keys(Avatar.ranges).filter(key=>key!=='height')) {
    const field = $(`#measure-${key}`);
    field.value = hasMeasurements && !profile.estimated?.includes(key) ? Avatar.display(profile[key], 'in') : '';
    if (hasMeasurements) field.dataset.cm = String(profile[key]); else delete field.dataset.cm;
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

$('#show-measurement-notes').addEventListener('change',renderMeasurementNotes);
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
    for (const input of [$('#height-feet'),$('#height-inches'),...Object.keys(Avatar.ranges).filter(key=>key!=='height').map(key=>$(`#measure-${key}`))]) {
      if (!input.checkValidity()) { input.setAttribute('aria-invalid', 'true'); input.focus(); break; }
    }
    return;
  }
  if (setupStep === 1) { setSetupStep(2); return; }
  try {
    if (localStorage.getItem(AVATAR_KEY) !== setupStorageSnapshot) throw Error('Your model changed in another tab. Close setup and reopen it to see the latest version.');
    const saved = Avatar.save(localStorage, profile);
    avatarProfile = saved; avatarRaw = JSON.stringify(saved); avatarReadError = '';
    renderAtelier(); $('#avatar-dialog').close();
    notify(`${saved.name ? `${saved.name}, your` : 'Your'} personal model is ready. Welcome to your dressing room.`);
  } catch (error) { $('#avatar-error').textContent = error.message.includes('another tab') ? error.message : 'Your model could not be saved. Browser storage may be full or disabled. Your previous avatar is unchanged.'; }
});

['#height-feet','#height-inches'].forEach(selector=>{
  $(selector).addEventListener('input',()=>{delete $('#height-feet').dataset.cm;$('#avatar-error').textContent='';renderSetupPreview();});
  $(selector).addEventListener('focus',()=>{highlightedMeasurement='height';$('#measurement-help').textContent=measurementTips.height;renderSetupPreview();});
});

$('#delete-avatar').addEventListener('click', () => {
  if (!confirm('Delete your model, name, and measurements from this browser? Your wardrobe and saved outfits will stay.')) return;
  try {
    localStorage.removeItem(AVATAR_KEY); avatarProfile = null; avatarRaw = null; avatarReadError = '';
    renderAtelier(); $('#avatar-dialog').close(); notify('Your model and measurements have been deleted.');
  } catch { $('#avatar-error').textContent = 'The browser prevented deletion. Your saved avatar is unchanged.'; }
});
$('#export-avatar').addEventListener('click', () => {
  if (avatarRaw === null) return;
  const url = URL.createObjectURL(new Blob([avatarRaw], { type: 'application/json' }));
  const link = element('a'); link.href = url; link.download = 'fitcheck-avatar.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
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
  figure.innerHTML = Avatar.diagram(Avatar.example, key, 'guide-'+key);
  tile.append(figure, element('h3', '', `${String(index + 1).padStart(2, '0')} / ${Avatar.labels[key]}`), element('p', '', measurementTips[key])); return tile;
}));
window.addEventListener('storage', event => {
  if (event.key === AVATAR_KEY || event.key === null) {
    readAvatar(); renderAtelier();
    if ($('#avatar-dialog').open) $('#avatar-error').textContent = 'Your model changed in another tab. Close and reopen setup before saving.';
  }
});
