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
