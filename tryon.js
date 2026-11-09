/* Instant garment collage and explicit, replaceable try-on render step. */
const tryOnProvider = FitCheckProvider.createMockProvider();
const outfitRenderer = FitCheckRender.createRenderer({
  provider:tryOnProvider, storage:localStorage, limit:5,
  reserveLock:fn=>navigator.locks ? navigator.locks.request('fitcheck-render-budget',fn) : fn()
});
let previewState = {status:'idle'}, renderedOutfitImage = '', previewIdentity = '';
let currentRenderRequest = null;
const outfitPreview = FitCheckRender.createPreviewController({
  renderer:outfitRenderer,
  onClear() { renderedOutfitImage=''; if(typeof mountModelImage==='function') mountModelImage(); },
  onImage(imageUrl) { renderedOutfitImage=imageUrl; mountModelImage(); },
  onState(next) { previewState=next; updateRenderControls(); }
});
function selectedGarments() { return state.items.filter(item=>selected.has(item.id) && canUseItem(item)); }
function updateRenderControls() {
  const loading=previewState.status==='loading';
  $('#render-outfit').disabled=loading || !selectedGarments().length;
  $('#render-outfit').textContent=loading?'Creating preview…':'See it on my model';
  $('#render-outfit').setAttribute('aria-busy',String(loading));
  $('#retry-render').hidden=previewState.status!=='error';
  $('#tryon-status').textContent=loading?'Creating your preview. Your collage stays available.':previewState.status==='error'?previewState.message:previewState.status==='ready'?'Mock preview ready. Garments are shown beside the model; no fitted try-on was generated.':'Choose your pieces for an instant collage, then request a model preview.';
  try { $('#render-allowance').textContent=`${outfitRenderer.remaining()} of 5 render attempts left today on this browser. Cached previews use no attempts.`; }
  catch { $('#render-allowance').textContent='Render allowance is unavailable. Your collage remains usable.'; }
}
function syncOutfitPreview() {
  const garments=selectedGarments();
  const model=FitCheckModel.resolveSelection(state.modelPreference);
  const identity=JSON.stringify([STORAGE_KEY,model.id,garments.map(g=>[g.id,g.image])]);
  if(identity!==previewIdentity) {
    previewIdentity=identity;
    $('#outfit-collage').replaceChildren(...garments.map(item=>{
      const tile=element('figure','collage-piece'); tile.append(itemImage(item),element('figcaption','',item.name)); return tile;
    }));
    $('#collage-empty').hidden=garments.length>0;
    outfitPreview.reset();
  }
  updateRenderControls();
}
async function renderSelectedOutfit() {
  const model=FitCheckModel.resolveSelection(state.modelPreference);
  currentRenderRequest={modelId:model.id,modelImage:model.image,garments:selectedGarments()};
  await outfitPreview.render(currentRenderRequest);
}
$('#render-outfit').addEventListener('click',renderSelectedOutfit);
$('#retry-render').addEventListener('click',renderSelectedOutfit);
