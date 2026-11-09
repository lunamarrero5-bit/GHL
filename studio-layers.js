/* Normalize cutouts into transparent PNGs on the SAME canvas as the base image.
   Canvas prepares a garment layer only. It never paints or warps the body image. */
(function(root) {
  'use strict';
  const cache=new Map();
  function png(item,geometry,override) {
    const position=FitCheckTryOn.placement(item,geometry,override);
    const key=JSON.stringify([geometry.presetId,item.image,override || item.fitting || null]);
    if(cache.has(key)) return cache.get(key);
    const result=new Promise((resolve,reject)=>{
      const photo=new Image();
      photo.onload=()=>{
        try {
          const size=FitCheckHuman.canvas, canvas=document.createElement('canvas');
          canvas.width=size.rasterWidth;canvas.height=size.rasterHeight;
          const context=canvas.getContext('2d');if(!context)throw Error('PNG preparation is unavailable.');
          context.scale(canvas.width/size.width,canvas.height/size.height);
          const p=position;
          context.translate(p.left+p.width/2,p.top+p.height/2);context.rotate(p.rotation*Math.PI/180);context.translate(-p.width/2,-p.height/2);
          const points=(override || item.fitting || FitCheckTryOn.defaults(item)).points;
          const minX=Math.min(...points.map(pt=>pt[0])), minY=Math.min(...points.map(pt=>pt[1]));
          const spanX=Math.max(...points.map(pt=>pt[0]))-minX, spanY=Math.max(...points.map(pt=>pt[1]))-minY;
          context.beginPath();points.forEach((pt,index)=>{const x=(pt[0]-minX)/spanX*p.width,y=(pt[1]-minY)/spanY*p.height;index?context.lineTo(x,y):context.moveTo(x,y);});context.closePath();context.clip();
          context.drawImage(photo,p.imageLeft/100*p.width,p.imageTop/100*p.height,p.imageWidth/100*p.width,p.imageHeight/100*p.height);
          resolve(canvas.toDataURL('image/png'));
        } catch(error) { reject(error); }
      };
      photo.onerror=()=>reject(Error('The garment cutout could not load.'));
      photo.src=item.image;
    });
    cache.set(key,result);if(cache.size>18)cache.delete(cache.keys().next().value);
    result.catch(()=>cache.delete(key));
    return result;
  }
  root.FitCheckStudioLayers={png};
})(typeof globalThis!=='undefined'?globalThis:this);
