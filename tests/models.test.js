const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const M=require('../model-core.js');
const models=require('../models.js');
const F=require('../core.js');
test('pickModel selects an exact match and does not depend on catalog ordering',()=>{
  for(const model of models) {
    assert.equal(M.pickModel(model).id,model.id);
    assert.equal(M.pickModel(model,[...models].reverse()).id,model.id);
  }
});
test('matching uses weighted skin and build distances rather than height alone',()=>{
  const p={...M.defaults,heightCm:168};
  const near={...p,id:'near',image:'assets/models/near.svg',heightCm:170};
  const wrong={...p,id:'wrong',image:'assets/models/wrong.svg',build:'full',skinTone:'rich-deep'};
  assert.equal(M.pickModel(p,[wrong,near]).id,'near');
});
test('loader supports a one-entry, extended and empty library without a fixed model count',()=>{
  assert.equal(M.loadModels([models[0]]).length,1);
  const added={...models[0],id:'new-model',image:'assets/models/new-model.png'};
  assert.equal(M.loadModels([...models,added]).length,models.length+1);
  assert.throws(()=>M.pickModel(M.defaults,[]),/No models/);
  assert.throws(()=>M.loadModels([models[0],models[0]]),/invalid/);
});
test('all placeholder images share one canvas, framing and fitted base layer',()=>{
  for(const model of M.loadModels()) {
    const svg=fs.readFileSync(require.resolve('../'+model.image),'utf8');
    assert.match(svg,/width="320" height="520" viewBox="0 0 320 520"/);
    assert.match(svg,/MODEL LIBRARY/);
    assert.match(svg,/fill="#68756e"/);
  }
});
test('height scale remains uniform and capped within four percent',()=>{
  assert.equal(M.scaleForHeight(120,{heightCm:180}),.96);
  assert.equal(M.scaleForHeight(220,{heightCm:150}),1.04);
  assert.equal(M.scaleForHeight(168,{heightCm:168}),1);
});
test('model preference round-trips with existing saved outfits, plans and legacy fitting',()=>{
  const T=require('../tryon-core.js');
  const item={id:'tee',name:'Tee',category:'Tops',occasion:'Casual',color:'Red',image:'data:image/png;base64,aGVsbG8='};
  item.fitting=T.defaults(item);
  const original=F.validate({items:[item],outfits:[{id:'look',name:'Monday',occasion:'Casual',itemIds:['tee']}],plans:[{id:'plan',outfitId:'look',date:F.day()}]});
  const selection={modelId:M.pickModel(M.defaults).id,preferences:M.defaults};
  const saved=F.validate({...original,modelPreference:selection});
  const reloaded=F.validate(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(reloaded.modelPreference,selection);
  for(const key of ['items','outfits','plans'])assert.deepEqual(reloaded[key],original[key]);
});
test('bad model preferences are rejected while old wardrobes need no model preference',()=>{
  const old=F.validate({items:[],outfits:[]});assert.equal('modelPreference' in old,false);
  for(const preferences of [{...M.defaults,heightCm:NaN},{...M.defaults,build:'unknown'},{...M.defaults,hairStyle:'<script>'}]) {
    assert.throws(()=>F.validate({...old,modelPreference:{modelId:'regular-medium-long',preferences}}));
  }
});
test('retired model IDs rematch preferences rather than invalidating saved outfits',()=>{
  const selection={modelId:'retired-model',preferences:M.defaults};
  assert.equal(M.resolveSelection(selection).id,M.pickModel(M.defaults).id);
  assert.equal(F.validate({items:[],outfits:[],modelPreference:selection}).modelPreference.modelId,'retired-model');
});
