/* The dressing room uses only locally uploaded wardrobe photos. No shopping feed. */
const Fitting=FitCheckTryOn;
let fittingItemId=null, fittingDraft=null, selectedOutlinePoint=0, addingOutlinePoint=false, draggingOutlinePoint=null;

function renderDressedAvatar(target,profile,ids,namespace,overrides={}) {
  const stage=element('div','model-canvas');
  const body=element('div','model-body');body.innerHTML=FitCheckAvatar.svg(profile,'',namespace);
  stage.append(body);
  const pieces=Fitting.layers(ids.map(id=>state.items.find(item=>item.id===id)).filter(canUseItem));
  for(const item of pieces) {
    const position=Fitting.placement(item,FitCheckAvatar.geometry(profile),overrides[item.id]);
    const layer=element('div','garment-overlay');layer.dataset.garmentId=item.id;
    layer.style.left=position.left/320*100+'%';layer.style.top=position.top/520*100+'%';
    layer.style.width=position.width/320*100+'%';layer.style.height=position.height/520*100+'%';
    layer.style.clipPath=`polygon(${position.polygon})`;layer.style.transform=`rotate(${position.rotation}deg)`;
    const image=element('img');image.alt=`Your model wearing ${item.name}`;
    image.style.left=position.imageLeft+'%';image.style.top=position.imageTop+'%';
    image.style.width=position.imageWidth+'%';image.style.height=position.imageHeight+'%';
    image.addEventListener('error',()=>{layer.hidden=true;if(namespace==='builder')$('#tryon-status').textContent='A garment photo could not load. Replace that photo in My wardrobe.';});
    image.src=item.image;layer.append(image);stage.append(layer);
  }
  target.replaceChildren(stage);
  if(namespace==='builder')$('#tryon-status').textContent=pieces.length?`${pieces.length} of your pieces on your model. Adjust photo to refine the garment outline and placement.`:'Choose a piece from your own wardrobe to dress your model.';
}

function editorItem() { return state.items.find(item=>item.id===fittingItemId); }
function editorError(message='') { $('#garment-error').textContent=message; }
function editorPreview() {
  const item=editorItem();if(!item)return;
  let ids=[...selected];if(!ids.includes(item.id))ids=Fitting.choose(ids,item,state.items);
  try { renderDressedAvatar($('#garment-preview'),avatarProfile||FitCheckAvatar.example,ids,'garment-editor',{[item.id]:fittingDraft}); }
  catch(error){editorError(error.message);}
}
function renderOutline() {
  const svg=$('#outline-svg');
  svg.innerHTML=`<polygon points="${fittingDraft.points.map(p=>`${p[0]*1000},${p[1]*1000}`).join(' ')}" fill="#9b7b4930" stroke="#8e6a35" stroke-width="4" vector-effect="non-scaling-stroke"/>`;
  const existing=$('#outline-stage').querySelectorAll('.outline-handle');
  if(existing.length!==fittingDraft.points.length) {
    existing.forEach(node=>node.remove());
    fittingDraft.points.forEach((point,index)=>{
      const handle=element('button','outline-handle');handle.type='button';handle.textContent=String(index+1);
      handle.setAttribute('aria-label',`Garment outline point ${index+1}. Use arrow keys to move.`);
      handle.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();selectedOutlinePoint=index;draggingOutlinePoint=index;handle.setPointerCapture?.(event.pointerId);renderOutline();});
      handle.addEventListener('pointermove',event=>{
        if(draggingOutlinePoint!==index)return;
        const rect=$('#outline-stage').getBoundingClientRect();
        fittingDraft.points[index]=[Fitting.clamp((event.clientX-rect.left)/rect.width,0,1),Fitting.clamp((event.clientY-rect.top)/rect.height,0,1)];
        editorError();renderOutline();editorPreview();
      });
      handle.addEventListener('pointerup',()=>{draggingOutlinePoint=null;});
      handle.addEventListener('pointercancel',()=>{draggingOutlinePoint=null;});
      handle.addEventListener('lostpointercapture',()=>{draggingOutlinePoint=null;});
      handle.addEventListener('click',event=>{event.stopPropagation();selectedOutlinePoint=index;renderOutline();});
      handle.addEventListener('keydown',event=>{
        const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
        if(!directions[event.key])return;event.preventDefault();selectedOutlinePoint=index;
        const step=event.shiftKey?.02:.005;
        fittingDraft.points[index]=point.map((_,axis)=>Fitting.clamp(fittingDraft.points[index][axis]+directions[event.key][axis]*step,0,1));
        renderOutline();editorPreview();
      });
      $('#outline-stage').append(handle);
    });
  }
  $('#outline-stage').querySelectorAll('.outline-handle').forEach((handle,index)=>{
    handle.style.left=fittingDraft.points[index][0]*100+'%';handle.style.top=fittingDraft.points[index][1]*100+'%';
    handle.classList.toggle('selected',index===selectedOutlinePoint);
    handle.setAttribute('aria-pressed',String(index===selectedOutlinePoint));
  });
  $('#add-outline-point').setAttribute('aria-pressed',String(addingOutlinePoint));
  $('#outline-instructions').textContent=addingOutlinePoint?'Click on the photo to add a point, then drag it to the garment edge.':'Drag numbered points around the garment. The preview shows only the area inside your outline.';
}
function fillPlacementControls() {
  for(const key of ['x','y','width','height','rotation']) {
    $(`#garment-${key}`).value=fittingDraft[key];
    $(`#garment-${key}-value`).textContent=['width','height'].includes(key)?Math.round(fittingDraft[key]*100)+'%':fittingDraft[key]+(key==='rotation'?'°':'');
  }
}
function openGarmentEditor(item) {
  if(!canUseItem(item))return notify('Upload a photo of your own garment first.');
  fittingItemId=item.id;fittingDraft=Fitting.validate(item.fitting||Fitting.defaults(item),item.image);
  selectedOutlinePoint=0;addingOutlinePoint=false;draggingOutlinePoint=null;
  $('#garment-title').textContent=`Style ${item.name}`;editorError();
  const photo=$('#outline-photo');
  photo.onload=()=>{if(photo.naturalWidth&&photo.naturalHeight)$('#outline-stage').style.aspectRatio=`${photo.naturalWidth} / ${photo.naturalHeight}`;};
  photo.onerror=()=>editorError('This photo could not load. Replace it in My wardrobe before adjusting it.');
  photo.src=item.image;photo.alt=`Outline the garment in your photo of ${item.name}`;
  fillPlacementControls();renderOutline();editorPreview();$('#garment-dialog').showModal();
}

$('#close-garment').addEventListener('click',()=>$('#garment-dialog').close());
$('#garment-dialog').addEventListener('close',()=>{draggingOutlinePoint=null;fittingItemId=null;fittingDraft=null;});
$('#add-outline-point').addEventListener('click',()=>{addingOutlinePoint=!addingOutlinePoint;renderOutline();});
$('#outline-stage').addEventListener('pointerdown',event=>{
  if(!addingOutlinePoint || event.target.classList?.contains('outline-handle'))return;
  if(fittingDraft.points.length>=32)return editorError('Use up to 32 outline points. Remove one before adding another.');
  const rect=$('#outline-stage').getBoundingClientRect();
  const point=[Fitting.clamp((event.clientX-rect.left)/rect.width,0,1),Fitting.clamp((event.clientY-rect.top)/rect.height,0,1)];
  let edge=0,distance=Infinity;
  fittingDraft.points.forEach((a,index)=>{
    const b=fittingDraft.points[(index+1)%fittingDraft.points.length];
    const dx=b[0]-a[0],dy=b[1]-a[1];const t=Fitting.clamp(((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);
    const d=(point[0]-a[0]-t*dx)**2+(point[1]-a[1]-t*dy)**2;
    if(d<distance){distance=d;edge=index;}
  });
  fittingDraft.points.splice(edge+1,0,point);selectedOutlinePoint=edge+1;addingOutlinePoint=false;renderOutline();editorPreview();
});
$('#remove-outline-point').addEventListener('click',()=>{
  if(fittingDraft.points.length<=3)return editorError('An outline needs at least three points.');
  fittingDraft.points.splice(selectedOutlinePoint,1);selectedOutlinePoint=Math.min(selectedOutlinePoint,fittingDraft.points.length-1);renderOutline();editorPreview();
});
$('#whole-photo').addEventListener('click',()=>{fittingDraft.points=[[0,0],[1,0],[1,1],[0,1]];selectedOutlinePoint=0;renderOutline();editorPreview();});
$('#reset-garment').addEventListener('click',()=>{const item=editorItem();if(!item)return editorError('This piece has been removed. Close this window and choose another.');fittingDraft=Fitting.defaults(item);selectedOutlinePoint=0;fillPlacementControls();renderOutline();editorPreview();});
for(const key of ['x','y','width','height','rotation'])$(`#garment-${key}`).addEventListener('input',event=>{fittingDraft[key]=Number(event.target.value);fillPlacementControls();editorPreview();});
$('#save-garment').addEventListener('click',()=>{
  const item=editorItem();if(!item)return editorError('This piece was removed in another tab. Close this window and choose another piece.');
  try {
    const fitting=Fitting.validate(fittingDraft,item.image);
    if(commit({...state,items:state.items.map(piece=>piece.id===item.id?{...piece,fitting}:piece)})){
      $('#garment-dialog').close();notify('Your garment placement is saved. It will be used whenever you try on this piece.');
    }else editorError('Your placement could not be saved. Your previous placement is unchanged.');
  }catch(error){editorError(error.message);}
});
