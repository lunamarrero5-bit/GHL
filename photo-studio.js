/* Coherent photographic demos, matched to exact, unmodified demo selections.
   This is a local asset library, not an API or a claim of live generated try-on. */
(function(root) {
  'use strict';
  const demo=root.FitCheckDemo || (typeof require==='function'?require('./demo.js'):null);
  const shapes=['balanced','straight','curve'];
  const outfits={
    casual:['demo-top','demo-pants','demo-shoes'],
    'casual-layer':['demo-top','demo-pants','demo-blazer','demo-shoes'],
    dress:['demo-dress','demo-shoes'],
    'dress-layer':['demo-dress','demo-blazer','demo-shoes']
  };
  const expected=demo.wardrobe();
  function samePlacement(a,b) {
    return !!a && !!b && ['imageKey','x','y','width','height','rotation'].every(key=>a[key]===b[key]) && JSON.stringify(a.points)===JSON.stringify(b.points);
  }
  function lookup(profile,items,{allowDemo=false,overrides={}}={}) {
    if(!allowDemo || Object.keys(overrides).length || !shapes.includes(profile.shape || 'balanced'))return null;
    if(items.some(item=>{
      const original=expected.find(piece=>piece.id===item.id);
      return !original || item.origin!=='demo' || item.image!==original.image || !samePlacement(item.fitting,original.fitting);
    }))return null;
    const key=Object.keys(outfits).find(name=>outfits[name].length===items.length && outfits[name].every(id=>items.some(item=>item.id===id)));
    if(!key)return null;
    return {src:`assets/studio/photos/${profile.shape || 'balanced'}-${key}.png`,key};
  }
  const images=shapes.flatMap(shape=>Object.keys(outfits).map(key=>`assets/studio/photos/${shape}-${key}.png`));
  const api={lookup,outfits,images};root.FitCheckPhotoStudio=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
