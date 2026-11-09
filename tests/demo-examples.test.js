const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('../demo.js'),F=require('../core.js');
test('every demo image is bundled locally',()=>{
  const fs=require('node:fs'),path=require('node:path');
  for(const file of D.images)assert.ok(fs.statSync(path.join(__dirname,'..',file)).size>0,file);
});
test('Revolve examples cover jeans, shirts, dresses, sneakers and heels without becoming owned clothes',()=>{
  const items=F.validate({items:D.wardrobe(),outfits:[]}).items.filter(i=>D.sources[i.id]);
  assert.equal(items.length,9);assert.ok(items.every(i=>i.origin==='demo'&&!F.isOwned(i)));
  for(const c of ['Tops','Bottoms','Dresses','Shoes'])assert.ok(items.some(i=>i.category===c));
  assert.ok(items.some(i=>/heels/.test(i.name)));
  for(const item of items)assert.match(D.sources[item.id].url,/^https:\/\/www\.revolve\.com\/.+\/dp\/[A-Z0-9-]+\/$/);
  assert.equal(F.suggest(items).looks.length,0);
});
test('adding examples retains existing edits and saved pieces and is idempotent',()=>{
  const first=D.wardrobe()[0],reference={...D.wardrobe().find(i=>D.sources[i.id]),name:'My edited sample',availability:'laundry'};
  const existing=[first,reference],added=D.addExamples(existing);
  assert.equal(added.length,10);assert.equal(added[0],first);assert.equal(added[1],reference);
  assert.deepEqual(D.addExamples(added),added);
});
