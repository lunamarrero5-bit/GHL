/* Proportion-preserving placement on a fixed 320 x 520 model canvas. */
(function(root) {
  'use strict';
  const order=['Bottoms','Tops','Dresses','Layers','Shoes'];
  function pose(model) {
    if(model.photoPreset) {
      const widths={balanced:[112,108],straight:[112,106],curve:[114,132]};
      const [shoulder,hip]=widths[model.photoPreset] || widths.balanced;
      return {shoulder,hip,neck:87,waist:205,hipY:245,ankle:475,feet:[115,203]};
    }
    const widths={slim:[96,100],regular:[118,126],full:[146,156]};
    const [shoulder,hip]=widths[model.build] || widths.regular;
    return {shoulder,hip,neck:130,waist:239,hipY:267,ankle:480,feet:[128,192]};
  }
  function slot(model,category) {
    const p=pose(model);
    const slots={
      Tops:{width:p.shoulder+36,height:p.hipY-p.neck+8,top:p.neck},
      Bottoms:{width:p.hip+24,height:p.ankle-p.waist,top:p.waist},
      Dresses:{width:Math.max(p.shoulder,p.hip)+32,height:p.ankle-p.neck-32,top:p.neck},
      Layers:{width:p.shoulder+64,height:p.hipY-p.neck+38,top:p.neck-3},
      Shoes:{width:112,height:35,top:p.ankle-5}
    };
    if(!slots[category])throw Error('Choose a garment category before making an on-model preview.');
    const box=slots[category];return {...box,left:160-box.width/2};
  }
  function fit(model,category,crop) {
    if(!crop || !Number.isFinite(crop.width) || !Number.isFinite(crop.height) || crop.width<=0 || crop.height<=0) throw Error('This garment image is empty.');
    const box=slot(model,category);
    const scale=Math.min(box.width/crop.width,box.height/crop.height);
    const width=crop.width*scale,height=crop.height*scale;
    return {left:box.left+(box.width-width)/2,top:box.top,width,height,scale};
  }
  function bounds(data,width,height,region={left:0,top:0,width,height}) {
    let left=width,top=height,right=-1,bottom=-1;
    for(let y=region.top;y<region.top+region.height;y++)for(let x=region.left;x<region.left+region.width;x++)if(data[(y*width+x)*4+3]>20) {
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
    }
    if(right<left)throw Error('This garment image has no visible clothing.');
    return {left,top,width:right-left+1,height:bottom-top+1};
  }
  function shoeCrops(data,width,height,crop) {
    const columns=new Uint32Array(width);
    for(let x=crop.left;x<crop.left+crop.width;x++)for(let y=crop.top;y<crop.top+crop.height;y++)if(data[(y*width+x)*4+3]>100)columns[x]++;
    let split=Math.floor(crop.left+crop.width/2);
    for(let x=Math.ceil(crop.left+crop.width*.35);x<crop.left+crop.width*.65;x++)if(columns[x]<columns[split])split=x;
    let peak=0;for(const count of columns)peak=Math.max(peak,count);
    if(!peak || columns[split]>peak*.22)return [crop];
    try {
      return [bounds(data,width,height,{left:crop.left,top:crop.top,width:split-crop.left,height:crop.height}),bounds(data,width,height,{left:split,top:crop.top,width:crop.left+crop.width-split,height:crop.height})];
    }catch{return [crop];}
  }
  function fitShoe(model,crop,side) {
    const scale=Math.min(42/crop.width,44/crop.height);
    const width=crop.width*scale,height=crop.height*scale;
    return {left:pose(model).feet[side]-width/2,top:pose(model).ankle-5,width,height,scale};
  }
  function removeBackground(data,width,height) {
    // Only remove an almost-white border-connected backdrop; never infer a body mask.
    const cornerIndices=[0,width-1,(height-1)*width,height*width-1];
    const corners=cornerIndices.map(i=>Array.from(data.slice(i*4,i*4+4)));
    if(corners.some(c=>c[3]<240 || Math.min(...c.slice(0,3))<220))return data;
    const color=[0,1,2].map(c=>corners.reduce((sum,p)=>sum+p[c],0)/4);
    if(corners.some(c=>Math.max(...[0,1,2].map(k=>Math.abs(c[k]-color[k])))>18))return data;
    const visited=new Uint8Array(width*height),queue=new Int32Array(width*height);
    let head=0,tail=0;
    function visit(x,y) {
      if(x<0 || x>=width || y<0 || y>=height)return;
      const i=y*width+x;if(visited[i])return;visited[i]=1;
      const off=i*4;
      if(Math.max(...[0,1,2].map(k=>Math.abs(data[off+k]-color[k])))>24)return;
      queue[tail++]=i;
    }
    for(let x=0;x<width;x++){visit(x,0);visit(x,height-1);}
    for(let y=0;y<height;y++){visit(0,y);visit(width-1,y);}
    while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);data[i*4+3]=0;visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}
    return data;
  }
  function sortGarments(garments) { return [...garments].sort((a,b)=>order.indexOf(a.category)-order.indexOf(b.category) || a.id.localeCompare(b.id)); }
  const api={pose,slot,fit,bounds,shoeCrops,fitShoe,removeBackground,sortGarments};root.FitCheckGarmentFit=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
