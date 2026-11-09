const {test}=require('node:test');
const assert=require('node:assert/strict');
const T=require('../tryon-core.js');
const A=require('../avatar-core.js');
const F=require('../core.js');
const item=(id,category)=>({id,name:id,category,color:'Red',occasion:'Casual',image:'data:image/jpeg;base64,aGVsbG8=',origin:'owned'});
const pieces=[item('top','Tops'),item('other-top','Tops'),item('bottom','Bottoms'),item('dress','Dresses'),item('jacket','Layers'),item('shoes','Shoes')];
test('adding a second top replaces the first',()=>assert.deepEqual(T.choose(['top','bottom'],pieces[1],pieces),['bottom','other-top']));
test('a dress replaces top and bottom but retains shoes and a layer',()=>assert.deepEqual(T.choose(['top','bottom','jacket','shoes'],pieces[3],pieces),['jacket','shoes','dress']));
test('choosing separates replaces a dress',()=>assert.deepEqual(T.choose(['dress','shoes'],pieces[0],pieces),['shoes','top']));
test('clicking a selected piece removes it',()=>assert.deepEqual(T.choose(['top','bottom'],pieces[0],pieces),['bottom']));
test('garment placement changes with body dimensions',()=>{
  const p=pieces[0];assert.notEqual(T.placement(p,A.geometry(A.example)).width,T.placement(p,A.geometry({...A.example,shoulders:48})).width);
});
test('outlines and positioning persist through a full wardrobe backup round trip',()=>{
  const fitted={...pieces[0],fitting:{...T.defaults(pieces[0]),x:12,rotation:8}};
  const state=F.validate({items:[fitted],outfits:[]});assert.deepEqual(F.validate(JSON.parse(JSON.stringify(state))),state);
  assert.equal(state.items[0].fitting.x,12);
});
test('a placement cannot silently move to a replacement garment photo',()=>{
  const value=T.defaults(pieces[0]);assert.throws(()=>T.validate(value,'data:image/jpeg;base64,ZGlmZmVyZW50'));
});
test('invalid or degenerate outlines cannot enter saved data',()=>{
  const v=T.defaults(pieces[0]);for(const points of [[],[[0,0],[1,1]],[[0,0],[.5,.5],[1,1]],[[0,0],[2,0],[1,1]]])assert.throws(()=>T.validate({...v,points},pieces[0].image));
});
test('unsafe transforms are rejected',()=>{
  const v=T.defaults(pieces[0]);for(const x of [Infinity,NaN,'0; background:url(x)',101])assert.throws(()=>T.validate({...v,x},pieces[0].image));
});
test('body image and garment overlay values remain finite',()=>{
  for(const p of pieces){const v=T.placement(p,A.geometry(A.example));for(const key of ['left','top','width','height','imageLeft','imageWidth'])assert.ok(Number.isFinite(v[key]));}
});
test('layers and footwear render after base clothing',()=>assert.deepEqual(T.layers([pieces[5],pieces[4],pieces[0],pieces[2]]).map(i=>i.id),['bottom','top','jacket','shoes']));
test('a legacy reference cannot be relabeled as an owned uploaded garment',()=>{
  const data=F.validate({items:[{...pieces[0],image:'https://is4.revolveassets.com/images/p4/n/uv/FREE-WS5542_V1.jpg'}],outfits:[]});
  assert.equal(data.items[0].origin,'unconfirmed');assert.equal(F.suggest(data.items).looks.length,0);
});

test('demo suggestions require explicit demo mode and never masquerade as owned clothes',()=>{
  const D=require('../demo.js');const items=F.validate({items:D.wardrobe(),outfits:[]}).items;
  assert.equal(F.suggest(items).looks.length,0);
  assert.ok(F.suggest(items,{allowDemo:true}).looks.length>0);
  assert.ok(items.every(i=>!F.isOwned(i)));
});
