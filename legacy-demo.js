/* Luna's historical sage migration applies only to exact old sample SVGs. */
(function(root){
function legacyIllustration(category, color = '#d0c3b7') {
  const shapes = {
    Tops: '<path d="M65 40 85 28Q100 43 115 28L135 40 175 75 150 105 130 88 135 175H65L70 88 50 105 25 75Z"/><path d="M85 28Q100 65 115 28" fill="none"/>',
    Bottoms: '<path d="M55 25H145L153 195H113L100 85 87 195H47Z"/><path d="M55 45H145M100 25V85M60 45Q60 65 80 65M140 45Q140 65 120 65" fill="none"/>',
    Layers: '<path d="M75 30 45 48 25 165 53 173 70 90 65 190H135L130 90 147 173 175 165 155 48 125 30Z"/><path d="M75 30 100 75 125 30M100 75V190M77 115H91M109 115H123" fill="none"/>',
    Shoes: '<path d="M35 105 65 92 100 128 150 143Q179 149 177 169H30Q16 155 35 105Z"/><path d="M25 160H175M78 112 64 124M90 124 76 136M103 134 89 146" fill="none"/>',
    Dresses: '<path d="M78 25 90 30Q100 45 110 30L122 25 135 65 116 85 158 190H42L84 85 65 65Z"/><path d="M84 85H116" fill="none"/>'
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220"><g fill="${color}" stroke="#635e58" stroke-width="1.5" stroke-linejoin="round">${shapes[category] || shapes.Tops}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function migrate(items){return items.map(item => item.name==='Everyday cotton tee' && item.category==='Tops' && ((item.color==='Cream' && item.image===legacyIllustration('Tops','#e4dfcf')) || (item.color==='Red' && item.image===legacyIllustration('Tops','#c94040'))) ? {...item,color:'Sage',image:legacyIllustration('Tops','#a8b4a0')} : item);}
const api={migrate,illustration:legacyIllustration};root.FitCheckLegacyDemo=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
