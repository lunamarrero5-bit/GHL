/* Replace this provider with a backend adapter exposing renderOutfit({modelImage, garments}). */
(function(root) {
  'use strict';
  function loadImage(src) {
    return new Promise((resolve,reject) => {
      const image = new Image(); image.crossOrigin='anonymous';
      image.onload=()=>resolve(image); image.onerror=()=>reject(Error('A model or garment image could not load. Check the images and retry.'));
      image.src=src;
    });
  }
  function contain(ctx,image,x,y,width,height) {
    const scale=Math.min(width/image.naturalWidth,height/image.naturalHeight);
    const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
    ctx.drawImage(image,x+(width-w)/2,y+(height-h)/2,w,h);
  }
  async function composeMock({modelImage,garments}) {
    const images=await Promise.all([modelImage,...garments].map(loadImage));
    const canvas=document.createElement('canvas'); canvas.width=800; canvas.height=1040;
    const ctx=canvas.getContext('2d');
    if (!ctx) throw Error('Image preview is unavailable in this browser.');
    ctx.fillStyle='#f0ebe2'; ctx.fillRect(0,0,800,1040);
    contain(ctx,images[0],0,50,500,940);
    const height=Math.min(210,900/garments.length);
    images.slice(1).forEach((image,i)=>contain(ctx,image,510,65+i*height,270,height-10));
    ctx.fillStyle='#493e32'; ctx.font='18px sans-serif';
    ctx.fillText('MOCK PREVIEW · Garments shown beside the model',25,30);
    ctx.fillText('No fitted try-on generated',25,1020);
    return canvas.toDataURL('image/png');
  }
  function createMockProvider({compose=composeMock}={}) {
    return {name:'Local mock',isMock:true,renderOutfit:input=>compose(input)};
  }
  function createStudioProvider({fallback=createMockProvider()}={}) {
    return {name:'Local sample library and mock',isMock:true,async renderOutfit(input) {
      const model=root.FitCheckModel.loadModels().find(model=>model.image===input.modelImage);
      if(model?.photoPreset) {
        const originals=root.FitCheckDemo.wardrobe();
        const garments=input.garments.map(image=>originals.find(item=>item.image===image));
        if(garments.every(Boolean)) {
          const sample=root.FitCheckPhotoStudio.lookup({shape:model.photoPreset},garments,{allowDemo:true});
          if(sample)return sample.src;
        }
      }
      return fallback.renderOutfit(input);
    }};
  }
  const api={createMockProvider,createStudioProvider}; root.FitCheckProvider=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
