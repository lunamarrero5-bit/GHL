const {test}=require('node:test');
const assert=require('node:assert/strict');
const F=require('../core.js');
test('uploaded photographs are allowed while external product photos cannot become owned pieces', () => {
  for(const image of ['data:image/jpeg;base64,aGVsbG8=','data:image/png;base64,aGVsbG8=','data:image/webp;base64,aGVsbG8=']) assert.ok(F.photoOK(image));
  for(const image of ['https://example.com/a.jpg','https://is4.revolveassets.com/images/p4/n/uv/SIMX-WP13_V1.jpg','javascript:alert(1)']) assert.equal(F.photoOK(image),false);
});
test('earlier sample URLs remain readable for recovery but never enter outfit suggestions', () => {
  const example={id:'old',name:'Earlier example',category:'Tops',color:'Red',occasion:'Casual',image:'https://is4.revolveassets.com/images/p4/n/uv/FREE-WS5542_V1.jpg'};
  const data=F.validate({items:[example],outfits:[]});
  assert.equal(data.items[0].origin,'unconfirmed');
  assert.equal(F.isOwned(data.items[0]),false);
  assert.equal(F.suggest(data.items).looks.length,0);
});
test('legacy SVGs are recoverable but never qualify as uploaded garment photographs', () => {
  const old='data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E';
  assert.ok(F.imageOK(old));assert.equal(F.photoOK(old),false);
});
