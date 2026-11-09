const {test}=require('node:test'),assert=require('node:assert/strict');
const G=require('../garment-fit.js');
const vm=require('node:vm'),fs=require('node:fs');
test('all model builds and garment categories preserve aspect ratios inside body anchor slots',()=>{
 for(const model of [{photoPreset:'balanced'},{photoPreset:'straight'},{photoPreset:'curve'},{build:'slim'},{build:'regular'},{build:'full'}]) {
  for(const category of ['Tops','Bottoms','Dresses','Layers','Shoes'])for(const crop of [{width:100,height:200},{width:450,height:180},{width:80,height:700}]) {
   const slot=G.slot(model,category),fit=G.fit(model,category,crop);
   assert.ok(Math.abs(fit.width/fit.height-crop.width/crop.height)<1e-10);
   assert.ok(fit.width<=slot.width+1e-9 && fit.height<=slot.height+1e-9);
   assert.ok(Math.abs(fit.left+fit.width/2-160)<1e-9);
   assert.equal(fit.top,slot.top);
  }
 }
});
test('garment padding and image resolution cannot change visible fit dimensions',()=>{
 const model={photoPreset:'balanced'};
 const low=G.fit(model,'Tops',{width:120,height:200});
 const high=G.fit(model,'Tops',{width:1200,height:2000});
 for(const key of ['left','top','width','height'])assert.ok(Math.abs(low[key]-high[key])<1e-9);
 const pixels=new Uint8ClampedArray(8*8*4);
 for(let y=2;y<6;y++)for(let x=1;x<7;x++)pixels[(y*8+x)*4+3]=255;
 assert.deepEqual(G.bounds(pixels,8,8),{left:1,top:2,width:6,height:4});
});
test('bottoms begin at the waist and shoes stay at the ankles across models',()=>{
 for(const model of [{photoPreset:'balanced'},{photoPreset:'curve'},{build:'slim'},{build:'full'}]) {
  const pose=G.pose(model);
  assert.equal(G.slot(model,'Bottoms').top,pose.waist);
  assert.equal(G.slot(model,'Shoes').top,pose.ankle-5);
  assert.ok(G.slot(model,'Layers').width>G.slot(model,'Tops').width);
 }
});
test('light backdrop removal is border-connected and preserves enclosed white garment pixels',()=>{
 const width=7,height=7,data=new Uint8ClampedArray(width*height*4).fill(255);
 for(let y=1;y<6;y++)for(let x=1;x<6;x++)if(x===1||x===5||y===1||y===5){const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=0;}
 G.removeBackground(data,width,height);
 assert.equal(data[3],0);assert.equal(data[(3*width+3)*4+3],255);
 assert.deepEqual(G.bounds(data,width,height),{left:1,top:1,width:5,height:5});
});
test('clothing order is deterministic and outerwear follows the base outfit',()=>{
 const pieces=[{id:'shoes',category:'Shoes'},{id:'layer',category:'Layers'},{id:'top',category:'Tops'},{id:'pants',category:'Bottoms'}];
 assert.deepEqual(G.sortGarments(pieces).map(g=>g.id),['pants','top','layer','shoes']);
 assert.deepEqual(G.sortGarments([...pieces].reverse()),G.sortGarments(pieces));
});
test('on-model compositor retains the original model canvas and never stretches clothing',async()=>{
 const canvases=[];
 const context=vm.createContext({FitCheckGarmentFit:G,FitCheckModel:{loadModels:()=>[{image:'base.png',photoPreset:'balanced'}]},FitCheckDemo:{wardrobe:()=>[]},
 Image:class{set src(src){this.srcName=src;this.naturalWidth=src==='base.png'?984:100;this.naturalHeight=src==='base.png'?1599:200;Promise.resolve().then(()=>this.onload());}},
 document:{createElement(){const canvas={width:0,height:0,draws:[],getContext(){return {
 drawImage(...args){canvas.draws.push(args);},
 getImageData(){const data=new Uint8ClampedArray(canvas.width*canvas.height*4);for(let y=20;y<180;y++)for(let x=10;x<90;x++)data[(y*canvas.width+x)*4+3]=255;return {data};},
 putImageData(){}
 };},toDataURL:()=> 'data:image/png;base64,preview'};canvases.push(canvas);return canvas;}}
 });
 vm.runInContext(fs.readFileSync(require.resolve('../tryon-provider.js'),'utf8'),context);
 await context.FitCheckProvider.createMockProvider().renderOutfit({modelImage:'base.png',garments:['top.png','pants.png'],garmentDetails:[{id:'top',image:'top.png',category:'Tops'},{id:'pants',image:'pants.png',category:'Bottoms'}]});
 const output=canvases[0];assert.equal(output.width,984);assert.equal(output.height,1599);
 assert.deepEqual(Array.from(output.draws[0].slice(1)),[0,0,984,1599]);
 for(const draw of output.draws.slice(1)){const [,sx,sy,sw,sh,x,y,w,h]=draw;assert.equal(sw,80);assert.equal(sh,160);assert.ok(Math.abs(w/h-sw/sh)<1e-10);assert.ok(y>200);}
 assert.equal(output.draws.length,3);
});
test('a shoe pair is split at its gap and each shoe aligns with a separate foot',()=>{
 const width=20,height=15,data=new Uint8ClampedArray(width*height*4);
 for(let y=2;y<13;y++)for(let x=1;x<19;x++)if(x<8||x>11)data[(y*width+x)*4+3]=255;
 const crops=G.shoeCrops(data,width,height,G.bounds(data,width,height));
 assert.equal(crops.length,2);
 for(const side of [0,1]){
  const fit=G.fitShoe({photoPreset:'balanced'},crops[side],side);
  assert.equal(fit.left+fit.width/2,side===0?115:203);
  assert.ok(Math.abs(fit.width/fit.height-crops[side].width/crops[side].height)<1e-10);
 }
});
