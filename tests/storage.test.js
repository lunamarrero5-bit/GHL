const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const F=require('../core.js');
const source=fs.readFileSync(require.resolve('../script.js'),'utf8').split("document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener")[0];
function harness(raw=null,fail=false,mode='own'){
  let stored=raw;let writes=0;
  const context=vm.createContext({FitCheck:F,FitCheckDemo:require('../demo.js'),localStorage:{getItem:key=>key==='fitcheck-mode'?mode:stored,setItem:(key,value)=>{if(fail)throw Error('QuotaExceededError');stored=value;writes++;}},document:{querySelector:()=>({hidden:true})},crypto:require('node:crypto').webcrypto,console,Date,Set,clearTimeout,setTimeout});
  vm.runInContext(source,context);vm.runInContext('render = () => {}; notify = () => {};',context);
  return {run:s=>vm.runInContext(s,context),get stored(){return stored;},get writes(){return writes;}};
}
test('failed storage write leaves the previous state intact',()=>{const h=harness(null,true);const before=h.run('state');assert.equal(h.run('commit({...state,items:[]})'),false);assert.equal(h.run('state'),before);assert.equal(h.writes,0);});
test('corrupt original data is retained and editing is blocked',()=>{const h=harness('{broken');assert.equal(h.run('recoveryMode'),true);assert.equal(h.run('commit({...state,items:[]})'),false);assert.equal(h.stored,'{broken');});
test('successful commits persist and retain an undo snapshot',()=>{const h=harness(JSON.stringify({items:[{id:'mine',name:'My tee',category:'Tops',color:'Red',occasion:'Casual',image:'data:image/jpeg;base64,aGVsbG8='}],outfits:[]}));const count=h.run('state.items.length');assert.equal(h.run('commit({...state,items:state.items.slice(1)})'),true);assert.equal(JSON.parse(h.stored).items.length,count-1);assert.equal(h.run('undoState.items.length'),count);assert.equal(h.run('commit(undoState)'),true);assert.equal(JSON.parse(h.stored).items.length,count);});
test('invalid state cannot overwrite a valid closet',()=>{const h=harness();assert.equal(h.run('commit({items:[],outfits:[{id:"bad"}]})'),false);assert.equal(h.writes,0);});
test('new wardrobes start empty rather than claiming that samples are owned',()=>{
  const h=harness();assert.equal(h.run('state.items.length'),0);
});
test('earlier illustrated examples are quarantined without breaking saved IDs or history',()=>{
  const old={items:[{id:'tee',name:'Everyday cotton tee',category:'Tops',color:'Red',occasion:'Casual',image:'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',wears:[F.day()],availability:'ready'}],outfits:[{id:'look',name:'Monday',occasion:'Casual',itemIds:['tee']}],plans:[{id:'plan',date:F.day(),outfitId:'look'}]};
  const h=harness(JSON.stringify(old));const loaded=JSON.parse(JSON.stringify(h.run('state')));
  assert.equal(loaded.items[0].id,'tee');assert.equal(loaded.items[0].origin,'unconfirmed');
  assert.deepEqual(loaded.items[0].wears,old.items[0].wears);assert.deepEqual(loaded.outfits,old.outfits);assert.deepEqual(loaded.plans,old.plans);assert.equal(h.writes,0);
});
test('uploaded user photographs are preserved during starter migration',()=>{
  const item={id:'mine',name:'Everyday cotton tee',category:'Tops',color:'Red',occasion:'Casual',image:'data:image/jpeg;base64,aGVsbG8='};
  const h=harness(JSON.stringify({items:[item],outfits:[]}));
  assert.equal(h.run('state.items[0].image'),item.image);
  assert.equal(h.run('state.items[0].name'),item.name);
});

test('demo examples are explicitly separate from uploaded ownership',()=>{
  const h=harness(null,false,'demo');
  assert.equal(h.run('state.items.length'),5);
  assert.equal(h.run('state.items.every(item=>item.origin==="demo" && !FitCheck.isOwned(item))'),true);
  assert.equal(h.run('selected.size'),3);
});
