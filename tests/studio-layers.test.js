const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const H=require('../human-model.js'), A=require('../avatar-core.js'), T=require('../tryon-core.js');
const source=fs.readFileSync(require.resolve('../studio-layers.js'),'utf8');
const garment={id:'top',category:'Tops',image:'data:image/png;base64,aGVsbG8='};
function harness(broken=false) {
  const canvases=[],draws=[],loads=[];
  const context=vm.createContext({FitCheckHuman:H,FitCheckTryOn:T,Image:class {
    set src(value){loads.push(value);Promise.resolve().then(()=>broken?this.onerror():this.onload());}
  },document:{createElement(tag){assert.equal(tag,'canvas');
    const canvas={width:0,height:0,getContext(){return {
      scale(){},translate(){},rotate(){},beginPath(){},lineTo(){},moveTo(){},closePath(){},clip(){},
      fillRect(){throw Error('A garment PNG must retain its transparent background.');},
      drawImage(...args){draws.push(args);}
    };},toDataURL(type){assert.equal(type,'image/png');return `data:image/png;base64,layer${canvases.length}`;}};
    canvases.push(canvas);return canvas;
  }}});
  vm.runInContext(source,context);return {api:context.FitCheckStudioLayers,canvases,draws,loads};
}
test('garments are normalized to the exact base canvas without redrawing a body',async()=>{
  const h=harness();
  for(const shape of Object.keys(H.shapes))await h.api.png(garment,A.geometry({...A.example,shape}));
  assert.equal(h.canvases.length,3);assert.equal(h.draws.length,3);
  for(const canvas of h.canvases){assert.equal(canvas.width,H.canvas.rasterWidth);assert.equal(canvas.height,H.canvas.rasterHeight);}
  assert.ok(h.loads.every(src=>src===garment.image));
});
test('PNG preparation shares work only for the same preset and placement',async()=>{
  const h=harness(),g=A.geometry(A.example);
  const first=h.api.png(garment,g);assert.equal(first,h.api.png(garment,g));await first;
  await h.api.png(garment,g,{...T.defaults(garment),x:10});
  assert.equal(h.loads.length,2);
});
test('a failed garment load rejects visibly and is eligible for retry',async()=>{
  const h=harness(true),g=A.geometry(A.example);
  await assert.rejects(h.api.png(garment,g),/cutout could not load/);
  await assert.rejects(h.api.png(garment,g),/cutout could not load/);
  assert.equal(h.loads.length,2);assert.equal(h.canvases.length,0);
});
