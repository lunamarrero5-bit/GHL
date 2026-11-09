const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'), fs=require('node:fs');
const R=require('../render-core.js');
const output='data:image/png;base64,aGVsbG8=';
const request={modelId:'model',modelImage:'assets/models/model.svg',garments:[{id:'b',image:'b.png'},{id:'a',image:'a.png'}]};
function memory(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};}
test('cache key is stable for garment order and cannot collide on delimiter-containing IDs',()=>{
  assert.equal(R.cacheKey('m',['b','a']),R.cacheKey('m',['a','b']));
  assert.notEqual(R.cacheKey('m',['a,b']),R.cacheKey('m',['a','b']));
  assert.notEqual(R.cacheKey('other',['a']),R.cacheKey('m',['a']));
});
test('cached, reordered and concurrent requests invoke the provider only once',async()=>{
  let calls=0;
  const renderer=R.createRenderer({storage:memory(),provider:{async renderOutfit(input){calls++;assert.deepEqual(input,{modelImage:request.modelImage,garments:['a.png','b.png']});return output;}}});
  await Promise.all([renderer.render(request),renderer.render({...request,garments:[...request.garments].reverse()})]);
  assert.equal(await renderer.render(request),output);assert.equal(calls,1);assert.equal(renderer.remaining(),4);
});
test('replacing a garment photo invalidates its ID-based cache entry',async()=>{
  let calls=0;const renderer=R.createRenderer({storage:memory(),provider:{async renderOutfit(){calls++;return output;}}});
  await renderer.render(request);
  await renderer.render({...request,garments:[{id:'a',image:'replacement.png'}]});
  await renderer.render({...request,garments:request.garments.map(g=>({...g,image:g.image+'new'}))});
  assert.equal(calls,3);
});
test('render attempts are limited across reloads, including failures, and reset next UTC day',async()=>{
  const storage=memory();let date=new Date('2026-11-09T12:00:00Z'),calls=0;
  const config={storage,limit:2,now:()=>date,provider:{async renderOutfit(){calls++;throw Error('Provider unavailable');}}};
  await assert.rejects(R.createRenderer(config).render(request),/unavailable/);
  await assert.rejects(R.createRenderer(config).render(request),/unavailable/);
  await assert.rejects(R.createRenderer(config).render(request),/Daily limit/);assert.equal(calls,2);
  date=new Date('2026-11-10T12:00:00Z');
  await assert.rejects(R.createRenderer(config).render(request),/unavailable/);assert.equal(calls,3);
});
test('a failed render exposes retry and leaves the real UI collage intact',async()=>{
  const nodes=new Map();
  const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{children:[],events:{},replaceChildren(...children){this.children=children;},append(...children){this.children.push(...children);},setAttribute(){},addEventListener(name,callback){this.events[name]=callback;}});return nodes.get(selector);};
  let fail=true;
  const context=vm.createContext({$:node,element:()=>node(Symbol()),itemImage:item=>({image:item.image}),FitCheckRender:R,FitCheckModel:require('../model-core.js'),
    FitCheckProvider:{createMockProvider:()=>({async renderOutfit(){if(fail)throw Error('Provider unavailable');return output;}})},
    localStorage:memory(),navigator:{},state:{items:request.garments},selected:new Set(['a','b']),STORAGE_KEY:'own',canUseItem:()=>true,mountModelImage(){}
  });
  vm.runInContext(fs.readFileSync(require.resolve('../tryon.js'),'utf8'),context);
  vm.runInContext('syncOutfitPreview()',context);
  const collage=node('#outfit-collage').children;
  await vm.runInContext('renderSelectedOutfit()',context);
  assert.equal(node('#outfit-collage').children,collage);assert.equal(collage.length,2);
  assert.equal(node('#retry-render').hidden,false);assert.match(node('#tryon-status').textContent,/unavailable/);
  fail=false;await node('#retry-render').events.click();
  assert.equal(node('#outfit-collage').children,collage);assert.equal(node('#retry-render').hidden,true);
});
test('stale render completion cannot replace a newly selected outfit',async()=>{
  let complete;const states=[],images=[];
  const controller=R.createPreviewController({renderer:{render:()=>new Promise(resolve=>complete=resolve)},onState:s=>states.push(s.status),onImage:s=>images.push(s),onClear(){}});
  const pending=controller.render(request);controller.reset();complete(output);await pending;
  assert.deepEqual(images,[]);assert.equal(states.at(-1),'idle');
});
test('timeouts and malformed provider output become retryable failures',async()=>{
  const hung=R.createRenderer({storage:memory(),timeoutMs:5,provider:{renderOutfit:()=>new Promise(()=>{})}});
  await assert.rejects(hung.render(request),/timed out/);
  const bad=R.createRenderer({storage:memory(),provider:{renderOutfit:async()=> 'javascript:alert(1)'}});
  await assert.rejects(bad.render(request),/unsupported image/);
});
test('a blocked budget write prevents calling the provider',async()=>{
  let calls=0;const renderer=R.createRenderer({storage:{getItem:()=>null,setItem(){throw Error('Storage blocked');}},provider:{renderOutfit(){calls++;return output;}}});
  await assert.rejects(renderer.render(request),/blocked/);assert.equal(calls,0);
});
