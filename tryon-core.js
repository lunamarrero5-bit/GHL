/* Selection rules and legacy outline validation for backward-compatible wardrobe backups. */
(function(root) {
  'use strict';
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function imageKey(image) { let hash=2166136261; for(let i=0;i<image.length;i++) hash=Math.imul(hash^image.charCodeAt(i),16777619); return (hash>>>0).toString(16); }
  function validate(value,image) {
    if(!value || value.imageKey!==imageKey(image) || !Array.isArray(value.points) || value.points.length<3 || value.points.length>32 || !value.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1))) throw Error('This garment outline is invalid or belongs to another photo.');
    const bounds={x:[-100,100],y:[-150,150],width:[.35,2.5],height:[.35,2.5],rotation:[-45,45]};
    for(const [key,[min,max]] of Object.entries(bounds)) if(typeof value[key]!=='number'||!Number.isFinite(value[key])||value[key]<min||value[key]>max) throw Error('Garment positioning is outside the supported range.');
    const xs=value.points.map(p=>p[0]),ys=value.points.map(p=>p[1]);
    if(Math.max(...xs)-Math.min(...xs)<.03 || Math.max(...ys)-Math.min(...ys)<.03) throw Error('Give your garment outline some width and height.');
    const area=Math.abs(value.points.reduce((sum,p,i)=>{const next=value.points[(i+1)%value.points.length];return sum+p[0]*next[1]-next[0]*p[1];},0))/2;
    if(area<.001) throw Error('Outline the garment instead of a straight line.');
    return {imageKey:value.imageKey,points:value.points.map(p=>[...p]),...Object.fromEntries(Object.keys(bounds).map(key=>[key,value[key]]))};
  }
  function defaults(item) {
    const points=item.category==='Shoes'?[[.04,.25],[.96,.25],[.96,.82],[.04,.82]]:item.category==='Bottoms'?[[.2,.04],[.8,.04],[.92,.96],[.56,.96],[.5,.38],[.44,.96],[.08,.96]]:[[.26,.08],[.4,.04],[.6,.04],[.74,.08],[.96,.34],[.8,.48],[.7,.35],[.74,.96],[.26,.96],[.3,.35],[.2,.48],[.04,.34]];
    return {imageKey:imageKey(item.image),points,x:0,y:0,width:1,height:1,rotation:0};
  }
  function choose(ids,item,items) {
    if(ids.includes(item.id)) return ids.filter(id=>id!==item.id);
    return [...ids.filter(id=>{
      const previous=items.find(piece=>piece.id===id);if(!previous)return false;
      if(previous.category===item.category)return false;
      if(item.category==='Dresses'&&['Tops','Bottoms'].includes(previous.category))return false;
      if(['Tops','Bottoms'].includes(item.category)&&previous.category==='Dresses')return false;
      return true;
    }),item.id];
  }
  const api={validate,defaults,imageKey,choose,clamp};root.FitCheckTryOn=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
