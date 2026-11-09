const {test}=require('node:test'),assert=require('node:assert/strict');
const L=require('../legacy-demo.js');
test('Luna sage migration changes only exact historical sample images and preserves IDs and history',()=>{
 const old={id:'legacy',name:'Everyday cotton tee',category:'Tops',color:'Red',image:L.illustration('Tops','#c94040'),wears:['2026-11-01']};
 const custom={...old,image:'data:image/png;base64,mine'};
 const result=L.migrate([old,custom]);
 assert.equal(result[0].color,'Sage');assert.equal(result[0].id,old.id);assert.equal(result[0].wears,old.wears);
 assert.equal(result[1],custom);assert.deepEqual(L.migrate(result),result);
});
