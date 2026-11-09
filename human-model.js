/* Local photographic human reference assets; no face/body data leaves the browser. */
(function(root){
  'use strict';
  const tones=['#f0d3bd','#deb595','#c59170','#aa7455','#80513e','#50352d'];
  const bodies=['body-light','body-light-medium','body-medium','body-medium-deep','body-deep','body-rich-deep'];
  const hair={long:{file:'hair-long',box:[124,26,72,164]},bob:{file:'hair-bob',box:[128,26,64,103]},short:{file:'hair-short',box:[134,28,52,43]}};
  const bounds={"hair-bob":[0.06174,0.01918,0.93293,0.96497],"hair-long":[0.04,0.01329,0.95455,0.99021],"hair-short":[0.1128,0.05171,0.89101,0.82319]};
  const bodyFrames={"#f0d3bd":[0.21037,0.01689,0.77947,0.98624],"#deb595":[0.20935,0.01689,0.77947,0.98687],"#c59170":[0.21138,0.01751,0.77846,0.98186],"#aa7455":[0.20935,0.01689,0.77947,0.98749],"#80513e":[0.20935,0.01501,0.78049,0.98749],"#50352d":[0.20935,0.01689,0.78049,0.98374]};
  const frameFor=tone=>bodyFrames[tone]||[0,.016,1,.994];
  const bodyFor=tone=>{const index=tones.indexOf(tone);if(index<0)throw Error('Unknown human model skin tone.');return `assets/human/${bodies[index]}.png`;};
  const sourceY=284;
  function strips(geometry){
    const baseline={shoulder:45.2679,chest:35.2473,waist:27.6669,hips:38.3659};
    const anchors=[[0,1],[110,1],[126,geometry.shoulder/baseline.shoulder],[156,geometry.chest/baseline.chest],[190,geometry.waist/baseline.waist],[250,geometry.hips/baseline.hips],[284,geometry.hips/baseline.hips],[355,1],[480,1],[520,1]];
    function factor(y){let i=0;while(i<anchors.length-2&&y>anchors[i+1][0])i++;const [a,x]=anchors[i],[b,z]=anchors[i+1];return Math.max(.55,Math.min(2.15,x+(z-x)*(y-a)/(b-a)));}
    function destination(y){if(y<=221)return y;if(y<=sourceY)return 221+(y-221)*(geometry.crotch-221)/(sourceY-221);if(y<=480)return geometry.crotch+(y-sourceY)*(480-geometry.crotch)/(480-sourceY);return y;}
    const rows=[];
    for(let y=0;y<520;y+=5){const bottom=Math.min(y+5,520),top=destination(y),end=destination(bottom);rows.push({sourceTop:y,top,height:end-top+.25,scaleX:factor((y+bottom)/2),scaleY:(end-top)/(bottom-y)});}
    return rows;
  }
  function hairFor(style){
    if(style==='none')return null;
    const asset=hair[style];if(!asset)throw Error('Unknown photographic hair style.');
    return {file:`assets/human/${asset.file}.png`,box:[...asset.box],bounds:bounds[asset.file]||[0,0,1,1]};
  }
  // Align garment defaults with the photographed reference's measured front-view widths.
  // This is image-space calibration, not a claim about garment sizing or body reconstruction.
  const clothingGeometry=g=>({...g,shoulder:g.shoulder*(62.275/45.2679),hips:g.hips*(58.375/38.3659),pantsTop:190});
  const api={clothingGeometry,bodyFor,hairFor,strips,frameFor,images:[...bodies.map(file=>`assets/human/${file}.png`),...Object.values(hair).map(h=>`assets/human/${h.file}.png`)]};
  root.FitCheckHuman=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
