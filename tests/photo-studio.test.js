const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const P=require('../photo-studio.js'),D=require('../demo.js'),F=require('../core.js');
const items=()=>F.validate({items:D.wardrobe(),outfits:[]}).items;
const casual=()=>items().filter(i=>P.outfits.casual.includes(i.id));
test('all twelve demo combinations match validated wardrobe records regardless of selection order',()=>{
  for(const shape of ['balanced','straight','curve'])for(const [key,ids] of Object.entries(P.outfits)){
    const selection=items().filter(i=>ids.includes(i.id)).reverse();
    assert.equal(P.lookup({shape},selection,{allowDemo:true})?.src,`assets/studio/photos/${shape}-${key}.png`);
  }
});
test('own wardrobes and incomplete demo outfits cannot show a styled sample photograph',()=>{
  assert.equal(P.lookup({},casual()),null);
  assert.equal(P.lookup({},casual().slice(1),{allowDemo:true}),null);
  assert.equal(P.lookup({},casual().map(i=>({...i,origin:'owned'})),{allowDemo:true}),null);
});
test('modified source photos, placements and live editor overrides fall back to placement',()=>{
  const a=casual();a[0].fitting.x=12;assert.equal(P.lookup({},a,{allowDemo:true}),null);
  const b=casual();b[0].image='replacement.png';assert.equal(P.lookup({},b,{allowDemo:true}),null);
  assert.equal(P.lookup({},casual(),{allowDemo:true,overrides:{'demo-top':{}}}),null);
  assert.equal(P.lookup({shape:'unknown'},casual(),{allowDemo:true}),null);
});
test('each styled photograph is bundled as an RGBA PNG on the shared canvas',()=>{
  assert.equal(P.images.length,12);
  for(const file of P.images){const data=fs.readFileSync(path.join(__dirname,'..',file));
    assert.equal(data.readUInt32BE(16),984);assert.equal(data.readUInt32BE(20),1599);assert.equal(data[25],6);
  }
});
