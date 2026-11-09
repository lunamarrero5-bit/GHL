const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const F=require('../core.js');
const source=fs.readFileSync(require.resolve('../script.js'),'utf8').split("document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener")[0];
function harness(raw=null,fail=false){
  let stored=raw;let writes=0;
  const context=vm.createContext({FitCheck:F,localStorage:{getItem:()=>stored,setItem:(key,value)=>{if(fail)throw Error('QuotaExceededError');stored=value;writes++;}},document:{querySelector:()=>({hidden:true})},crypto:require('node:crypto').webcrypto,console,Date,Set,clearTimeout,setTimeout});
  vm.runInContext(source,context);vm.runInContext('render = () => {}; notify = () => {};',context);
  return {run:s=>vm.runInContext(s,context),get stored(){return stored;},get writes(){return writes;}};
}
test('failed storage write leaves the previous state intact',()=>{const h=harness(null,true);const before=h.run('state');assert.equal(h.run('commit({...state,items:[]})'),false);assert.equal(h.run('state'),before);assert.equal(h.writes,0);});
test('corrupt original data is retained and editing is blocked',()=>{const h=harness('{broken');assert.equal(h.run('recoveryMode'),true);assert.equal(h.run('commit({...state,items:[]})'),false);assert.equal(h.stored,'{broken');});
test('successful commits persist and retain an undo snapshot',()=>{const h=harness();const count=h.run('state.items.length');assert.equal(h.run('commit({...state,items:state.items.slice(1)})'),true);assert.equal(JSON.parse(h.stored).items.length,count-1);assert.equal(h.run('undoState.items.length'),count);assert.equal(h.run('commit(undoState)'),true);assert.equal(JSON.parse(h.stored).items.length,count);});
test('invalid state cannot overwrite a valid closet',()=>{const h=harness();assert.equal(h.run('commit({items:[],outfits:[{id:"bad"}]})'),false);assert.equal(h.writes,0);});
test('new wardrobes contain only photographic sample garments',()=>{
  const h=harness();
  assert.equal(h.run('state.items.length'),F.catalog.pieces.length);
  assert.equal(h.run('state.items.every(item => FitCheck.photoOK(item.image) && !item.image.startsWith("data:image/svg"))'),true);
});
test('saved illustrated starter pieces upgrade without breaking outfits or wear history',()=>{
  const old={items:[{id:'tee',name:'Everyday cotton tee',category:'Tops',color:'Red',occasion:'Casual',image:'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',wears:[F.day()],availability:'ready'}],outfits:[{id:'look',name:'Monday',occasion:'Casual',itemIds:['tee']}],plans:[{id:'plan',date:F.day(),outfitId:'look'}]};
  const h=harness(JSON.stringify(old));
  const migrated=JSON.parse(JSON.stringify(h.run('state')));
  assert.equal(migrated.items[0].id,'tee');
  assert.equal(migrated.items[0].image,F.catalog.pieces.find(p=>p.key==='red-tee').image);
  assert.deepEqual(migrated.items[0].wears,old.items[0].wears);
  assert.deepEqual(migrated.outfits,old.outfits);
  assert.deepEqual(migrated.plans,old.plans);
  assert.equal(h.writes,0);
});
test('uploaded user photographs are preserved during starter migration',()=>{
  const item={id:'mine',name:'Everyday cotton tee',category:'Tops',color:'Red',occasion:'Casual',image:'data:image/jpeg;base64,aGVsbG8='};
  const h=harness(JSON.stringify({items:[item],outfits:[]}));
  assert.equal(h.run('state.items[0].image'),item.image);
  assert.equal(h.run('state.items[0].name'),item.name);
});
