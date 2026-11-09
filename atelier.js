/* A single library image moves between home, the builder and personalization. */
const ModelLibrary=FitCheckModel;
const singleModelImage=element('img','library-model-image');
singleModelImage.id='model-image'; singleModelImage.decoding='async';
let modelDraft=null, modelSetupSnapshot=null, modelSetupScope='';
function activeModelSelection() {
  return $('#avatar-dialog').open && modelDraft ? {modelId:ModelLibrary.pickModel(modelDraft).id,preferences:modelDraft} : state.modelPreference;
}
function mountModelImage() {
  const selection=activeModelSelection();
  const model=ModelLibrary.resolveSelection(selection);
  const dialogOpen=$('#avatar-dialog').open;
  const builderVisible=!$('#builder-view').hidden;
  const target=dialogOpen?$('#setup-avatar'):builderVisible?$('#builder-avatar'):$('#home-avatar');
  const result=!dialogOpen && builderVisible && renderedOutfitImage;
  const src=result || model.image;
  if(singleModelImage.getAttribute('src')!==src) singleModelImage.src=src;
  singleModelImage.alt=result?'Mock outfit preview: chosen garments beside your selected model':`Full-body ${model.build} model with ${model.skinTone.replaceAll('-',' ')} skin and ${model.hairStyle} hair, in a plain fitted base layer`;
  const scale=result?1:ModelLibrary.scaleForHeight(selection?.preferences.heightCm || ModelLibrary.defaults.heightCm,model);
  singleModelImage.style.transform=`scale(${scale})`;
  target.append(singleModelImage);
  $('#model-match').textContent=`Closest library match: ${model.build}, ${model.heightCm} cm, ${model.skinTone.replaceAll('-',' ')} skin, ${model.hairStyle} ${model.hairColor} hair. Placeholder illustration.`;
}
function renderAtelier() {
  if(!$('#home-avatar'))return;
  $('#avatar-status').textContent=state.modelPreference?'YOUR SELECTED MODEL':'MODEL LIBRARY · PLACEHOLDER';
  $('#avatar-caption').textContent='One complete model. No personal photo needed.';
  $('#avatar-height').textContent=`${state.modelPreference?.preferences.heightCm || ModelLibrary.defaults.heightCm} CM / UNIFORM SCALE`;
  mountModelImage(); syncOutfitPreview();
}
function readModelDraft() {
  return ModelLibrary.validatePreferences({heightCm:Number($('#model-height').value),build:$('#model-build').value,skinTone:$('#model-skin').value,hairStyle:$('#model-hair-style').value,hairColor:$('#model-hair-color').value});
}
function previewModelDraft() {
  try { modelDraft=readModelDraft(); $('#avatar-error').textContent=''; mountModelImage(); }
  catch(error) { $('#avatar-error').textContent=error.message; }
}
function openAvatar() {
  modelSetupScope=STORAGE_KEY;
  try { modelSetupSnapshot=localStorage.getItem(STORAGE_KEY); }
  catch { $('#avatar-error').textContent='Browser storage is unavailable.'; }
  modelDraft={...(state.modelPreference?.preferences || ModelLibrary.defaults)};
  const available=ModelLibrary.loadModels(), closest=ModelLibrary.resolveSelection(state.modelPreference);
  for(const key of ['build','skinTone','hairStyle','hairColor']) {
    if(!available.some(model=>model[key]===modelDraft[key]))modelDraft[key]=closest[key];
  }
  $('#model-height').value=modelDraft.heightCm;
  for(const [id,key] of [['model-build','build'],['model-skin','skinTone'],['model-hair-style','hairStyle'],['model-hair-color','hairColor']]) $('#'+id).value=modelDraft[key];
  $('#avatar-error').textContent='';
  $('#avatar-dialog').showModal(); mountModelImage();
}
for(const [id,key] of [['model-build','build'],['model-skin','skinTone'],['model-hair-style','hairStyle'],['model-hair-color','hairColor']]) {
  // Options come from the data file, so adding or removing models needs no UI changes.
  const options=ModelLibrary.choices[key].filter(value=>ModelLibrary.loadModels().some(model=>model[key]===value));
  $('#'+id).replaceChildren(...options.map(value=>{const option=element('option','',value.replaceAll('-',' '));option.value=value;return option;}));
}
['#create-avatar','#edit-avatar','#profile-button','#builder-edit-avatar','#footer-avatar'].forEach(selector=>$(selector).addEventListener('click',openAvatar));
$('#start-outfit').addEventListener('click',()=>showView('builder'));
$('#close-avatar').addEventListener('click',()=>$('#avatar-dialog').close());
$('#avatar-dialog').addEventListener('close',()=>{modelDraft=null;renderAtelier();});
$('#avatar-form').addEventListener('input',previewModelDraft);
$('#avatar-form').addEventListener('change',previewModelDraft);
$('#avatar-form').addEventListener('submit',event=>{
  event.preventDefault();
  try {
    const preferences=readModelDraft(), model=ModelLibrary.pickModel(preferences);
    if(STORAGE_KEY!==modelSetupScope || localStorage.getItem(STORAGE_KEY)!==modelSetupSnapshot) throw Error('Your wardrobe changed. Close personalization and reopen it before saving.');
    if(!commit({...state,modelPreference:{modelId:model.id,preferences}})) throw Error('Your model could not be saved. Your previous choice is unchanged.');
    $('#avatar-dialog').close(); notify('Model saved with your wardrobe.');
  } catch(error) { $('#avatar-error').textContent=error.message; }
});
singleModelImage.addEventListener('error',()=>{
  if(renderedOutfitImage) {
    if(currentRenderRequest)outfitRenderer.invalidate(currentRenderRequest);
    outfitPreview.reset(); previewState={status:'error',message:'The rendered image could not load. Your collage is unchanged. Please retry.'};
    updateRenderControls();
  } else { $('#model-match').textContent='This model image could not load. Choose another model or reload the page.'; }
});
renderAtelier();
