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
  function prepareGarment(image) {
    // Analyze a bounded canvas so padding and pixel resolution cannot change visual size.
    const size=Math.min(1,1000/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*size));canvas.height=Math.max(1,Math.round(image.naturalHeight*size));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw Error('Image preview is unavailable in this browser.');
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    root.FitCheckGarmentFit.removeBackground(pixels.data,canvas.width,canvas.height);
    const corners=[0,canvas.width-1,(canvas.height-1)*canvas.width,canvas.width*canvas.height-1];
    if(corners.every(i=>pixels.data[i*4+3]>240))throw Error('Use a transparent clothing cutout or a plain white-background photo for this preview. Your collage remains available.');
    const crop=root.FitCheckGarmentFit.bounds(pixels.data,canvas.width,canvas.height);
    ctx.putImageData(pixels,0,0);
    return {canvas,crop,pixels:pixels.data};
  }
  async function composeMock({modelImage,garments,garmentDetails}) {
    const model=root.FitCheckModel.loadModels().find(model=>model.image===modelImage);
    if(!model)throw Error('Choose an available model before rendering.');
    const details=garmentDetails || garments.map(image=>root.FitCheckDemo.wardrobe().find(item=>item.image===image));
    if(details.some(item=>!item?.category))throw Error('Choose a category for each garment before rendering.');
    const pieces=root.FitCheckGarmentFit.sortGarments(details);
    const images=await Promise.all([modelImage,...pieces.map(item=>item.image)].map(loadImage));
    const canvas=document.createElement('canvas');
    // Base and result have precisely the same canvas and framing. Never resize a body part.
    canvas.width=images[0].naturalWidth;canvas.height=images[0].naturalHeight;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('Image preview is unavailable in this browser.');
    ctx.drawImage(images[0],0,0,canvas.width,canvas.height);
    const sx=canvas.width/320,sy=canvas.height/520;
    for(let i=0;i<pieces.length;i++) {
      const {canvas:cutout,crop,pixels}=prepareGarment(images[i+1]);
      function draw(rectangle,source) {
        // One uniform scale per garment: image size and transparent margins cannot distort it.
        const scale=Math.min(sx,sy),width=rectangle.width*scale,height=rectangle.height*scale;
        ctx.drawImage(cutout,source.left,source.top,source.width,source.height,rectangle.left*sx,rectangle.top*sy,width,height);
      }
      if(pieces[i].category==='Shoes') {
        const shoes=root.FitCheckGarmentFit.shoeCrops(pixels,cutout.width,cutout.height,crop);
        for(let side=0;side<2;side++) {
          const source=shoes[side] || shoes[0];
          draw(root.FitCheckGarmentFit.fitShoe(model,source,side),source);
        }
      } else draw(root.FitCheckGarmentFit.fit(model,pieces[i].category,crop),crop);
    }
    return canvas.toDataURL('image/png');
  }
  function createMockProvider({compose=composeMock}={}) {
    return {name:'Local on-model styling preview',isMock:true,renderOutfit:input=>compose(input)};
  }
  function createStudioProvider({fallback=createMockProvider()}={}) {
    return {name:'Local sample library and on-model preview',isMock:true,async renderOutfit(input) {
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
