/* Fit Studio's single source of truth. Positions use a 320 x 520 pose canvas.
   Each shape is a separate photograph. Body pixels are never measurement-warped. */
(function(root) {
  'use strict';
  const canvas = {width:320, height:520, rasterWidth:984, rasterHeight:1599};
  const shapes = {
    balanced: {id:'balanced', label:'Balanced', image:'assets/studio/photos/base-balanced.png',
      anchors:{shoulders:[[104,90],[216,90]], waist:[[120,205],[200,205]], hips:[[106,245],[214,245]], ankles:[[126,475],[194,475]]}},
    straight: {id:'straight', label:'Straight', image:'assets/studio/photos/base-straight.png',
      anchors:{shoulders:[[104,90],[216,90]], waist:[[113,205],[207,205]], hips:[[107,245],[213,245]], ankles:[[126,475],[194,475]]}},
    curve: {id:'curve', label:'Fuller Curve', image:'assets/studio/photos/base-curve.png',
      anchors:{shoulders:[[103,90],[217,90]], waist:[[116,205],[204,205]], hips:[[94,245],[226,245]], ankles:[[126,475],[194,475]]}}
  };
  function presetFor(profile={}) {
    const id=profile.shape || 'balanced';
    if(!Object.hasOwn(shapes,id)) throw Error('Choose an available body shape.');
    return shapes[id];
  }
  function garmentBox(category, anchors) {
    const {shoulders,waist,hips,ankles}=anchors;
    const shoulderWidth=shoulders[1][0]-shoulders[0][0];
    const hipWidth=hips[1][0]-hips[0][0];
    const waistY=waist[0][1], ankleY=ankles[0][1];
    const boxes={
      Tops:[shoulders[0][0]-10,shoulders[0][1]-5,shoulderWidth+20,waistY-shoulders[0][1]+19],
      Bottoms:[hips[0][0]-2,waistY,hipWidth+4,ankleY-waistY+7],
      Dresses:[Math.min(shoulders[0][0],hips[0][0])-7,shoulders[0][1]-5,Math.max(shoulderWidth,hipWidth)+14,365],
      Layers:[shoulders[0][0]-30,shoulders[0][1]-25,shoulderWidth+60,hips[0][1]-shoulders[0][1]+65],
      Shoes:[ankles[0][0]-23,ankleY-5,ankles[1][0]-ankles[0][0]+46,37]
    };
    if(!Object.hasOwn(boxes,category)) throw Error('Unknown garment category.');
    return boxes[category];
  }
  // Freeze nested config so one preview cannot accidentally shift another shape's anchors.
  function freeze(value) { Object.values(value).forEach(v=>{if(v && typeof v==='object')freeze(v);});return Object.freeze(value); }
  freeze(shapes);freeze(canvas);
  const api={canvas,shapes,presetFor,garmentBox,images:Object.values(shapes).map(s=>s.image),clothingGeometry:g=>g};
  root.FitCheckHuman=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
