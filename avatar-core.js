/* Measurement validation and a deterministic, stylized 2D avatar. No scan or sizing claims. */
(function (root) {
  'use strict';
  const human=root.FitCheckHuman || (typeof require==='function'?require('./human-model.js'):null);
  const ranges = { height: [100, 240], chest: [45, 220], waist: [40, 220], hips: [45, 240], inseam: [30, 130], shoulders: [20, 80] };
  const labels = { height: 'Height', chest: 'Chest / bust', waist: 'Waist', hips: 'Hips', inseam: 'Inseam', shoulders: 'Shoulder width' };
  const tones = ['#f0d3bd', '#deb595', '#c59170', '#aa7455', '#80513e', '#50352d'];
  const hairColors = ['#25201d', '#62412b', '#b18b51', '#a74e32', '#aaa6a0'];
  const hairStyles = ['long', 'bob', 'short', 'none'];
  const example = { name: '', unit: 'in', skin: tones[2], hair: hairColors[0], hairstyle: 'long', height: 168, chest: 90, waist: 72, hips: 98, inseam: 78, shoulders: 39 };
  const cm = (value, unit) => Number(value) * (unit === 'in' ? 2.54 : 1);
  const display = (value, unit) => Number((value / (unit === 'in' ? 2.54 : 1)).toFixed(1));
  function validate(input) {
    if (!input || !['cm', 'in'].includes(input.unit)) throw Error('Choose centimeters or inches.');
    if (typeof input.name !== 'string' || input.name.trim().length > 40) throw Error('Use a first name of 40 characters or fewer.');
    if (!tones.includes(input.skin) || !hairColors.includes(input.hair) || !hairStyles.includes(input.hairstyle)) throw Error('Choose an available skin tone and hair style.');
    const result = { name: input.name.trim(), unit: input.unit, skin: input.skin, hair: input.hair, hairstyle: input.hairstyle };
    for (const [key, [min, max]] of Object.entries(ranges)) {
      // Stored measurements always use centimeters, regardless of the display unit.
      const value = input[key];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error(`Check ${labels[key].toLowerCase()}: enter ${display(min, input.unit)}–${display(max, input.unit)} ${input.unit}.`);
      result[key] = Number(value.toFixed(3));
    }
    if (result.inseam >= result.height * 0.65) throw Error('Please check your height and inseam. Measure inseam from the inner leg to the ankle.');
    if (result.shoulders >= result.height * 0.45) throw Error('Please check shoulder width. Measure across your back, shoulder tip to shoulder tip.');
    if (input.estimated !== undefined) {
      if (!Array.isArray(input.estimated) || input.estimated.length > 2 || !input.estimated.every(key => ['inseam','shoulders'].includes(key)) || new Set(input.estimated).size !== input.estimated.length) throw Error('Invalid estimated measurements.');
      result.estimated = [...input.estimated];
    }
    return result;
  }
  function fromForm(input) {
    const result = { ...input };
    for (const key of Object.keys(ranges)) {
      if (input[key] === '' || input[key] === null || input[key] === undefined) throw Error(`Enter your ${labels[key].toLowerCase()}.`);
      result[key] = cm(input[key], input.unit);
    }
    return validate(result);
  }
  function save(storage, input) {
    const profile = validate(input);
    storage.setItem('fitcheck-avatar-v1', JSON.stringify(profile));
    return profile;
  }
  function usHeight(height) {
    const total = height / 2.54;
    let feet = Math.floor(total / 12), inches = Number((total - feet * 12).toFixed(1));
    if (inches === 12) { feet++; inches = 0; }
    return { feet, inches };
  }
  function heightLabel(height) { const {feet, inches} = usHeight(height); return `${feet} ft ${inches} in`; }
  function fromUS(input) {
    if (input.feet === '' || !Number.isInteger(Number(input.feet)) || Number(input.feet) < 3 || Number(input.feet) > 7) throw Error('Enter your height in feet (3–7) and inches (0–11.9).');
    const inches = input.inches === '' ? 0 : Number(input.inches);
    if (!Number.isFinite(inches) || inches < 0 || inches >= 12) throw Error('The inches part of height must be between 0 and 11.9.');
    const result = {...input, unit:'in', height: Number(((Number(input.feet)*12 + inches)*2.54).toFixed(3)), estimated:[]};
    for (const key of ['chest','waist','hips','inseam','shoulders']) {
      if ((input[key] === '' || input[key] === undefined) && ['inseam','shoulders'].includes(key)) {
        result[key] = Number((result.height * (key === 'inseam' ? .465 : .232)).toFixed(3)); result.estimated.push(key);
      } else {
        if (input[key] === '' || input[key] === undefined) throw Error(`Enter your ${labels[key].toLowerCase()} in inches.`);
        result[key] = Number(cm(input[key], 'in').toFixed(3));
      }
    }
    return validate(result);
  }
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function geometry(input = example) {
    const p = validate(input), scale = 390 / p.height;
    return {
      chest:clamp(p.chest / Math.PI * scale * .53,25,81),
      waist:clamp(p.waist / Math.PI * scale * .52,20,78),
      hips:clamp(p.hips / Math.PI * scale * .53,27,87),
      shoulder:clamp(p.shoulders * scale * .5,33,90),
      crotch:clamp(465 - p.inseam * scale,240,315)
    };
  }
  function shade(hex, amount) {
    return '#' + [1,3,5].map(index => clamp(parseInt(hex.slice(index,index+2),16)+amount,0,255).toString(16).padStart(2,'0')).join('');
  }
  function diagram(input = example, guide = '', namespace = 'default') {
    const p = validate(input), {chest,waist,hips,shoulder,crotch} = geometry(p);
    const hipY = crotch-28;
    const ns = 'fc-' + String(namespace).replace(/[^a-z0-9-]/gi,'').slice(0,40);
    const light = shade(p.skin,22), shadow = shade(p.skin,-30), deep = shade(p.skin,-55);
    const guideLine = (key,y,width) => guide === key ? `<path d="M${160-width-15} ${y}H${160+width+15}" fill="none" stroke="#a87945" stroke-width="1.5" stroke-dasharray="5 4"/>` : '';
    const hairBack = p.hairstyle==='long' ? `<path d="M130 63Q128 30 160 28Q198 29 194 76L203 176Q191 192 175 183L145 181Q123 188 117 171Z" fill="url(#${ns}-hair)"/>` : p.hairstyle==='bob' ? `<path d="M130 62Q128 30 160 29Q196 28 193 77L198 118Q178 133 157 124Q136 134 122 119Z" fill="url(#${ns}-hair)"/>` : '';
    const hairFront = p.hairstyle==='none' ? '' : p.hairstyle==='short' ? `<path d="M135 64Q128 35 153 31Q182 25 190 53L187 66Q168 52 162 45Q151 58 135 64Z" fill="url(#${ns}-hair)"/>` : `<path d="M133 67Q128 32 160 30Q194 30 188 74Q178 65 174 49L162 40Q151 59 133 67Z" fill="url(#${ns}-hair)"/><path d="M162 36Q149 49 141 52" stroke="${shade(p.hair,24)}" stroke-width="1.2" fill="none" opacity=".6"/>`;
    const arms = [-1,1].map(side => {
      const x=160+side*shoulder;
      return `<path d="M${x} 126Q${x+side*13} 131 ${x+side*14} 154L${x+side*21} 212 ${x+side*24} 277Q${x+side*29} 291 ${x+side*22} 304Q${x+side*18} 308 ${x+side*15} 299L${x+side*14} 287Q${x+side*9} 287 ${x+side*10} 279L${x+side*5} 218 ${x-side*7} 163Z" fill="url(#${ns}-skin)" stroke="${shadow}" stroke-width=".5"/><path d="M${x+side*13} 213L${x+side*17} 270" stroke="${deep}" stroke-width=".7" opacity=".2"/>`;
    }).join('');
    const legs = [-1,1].map(side => {
      const outer=160+side*hips, ankle=160+side*24;
      return `<path d="M160 ${crotch+7}Q${160+side*9} ${crotch-10} ${outer} ${hipY}Q${outer+side*4} ${crotch+35} ${outer-side*4} ${crotch+62}L${ankle+side*8} 372Q${ankle+side*13} 401 ${ankle+side*3} 445L${ankle+side*2} 467 ${ankle+side*10} 478Q${ankle+side*12} 484 ${ankle-side*12} 482L${ankle-side*10} 467 ${ankle-side*9} 418Q${ankle-side*15} 395 ${ankle-side*9} 374L${160+side*8} ${crotch+54}Z" fill="url(#${ns}-leg)" stroke="${shadow}" stroke-width=".5"/><ellipse cx="${ankle}" cy="373" rx="10" ry="8" fill="${light}" opacity=".2"/><path d="M${ankle+side*4} 393Q${ankle+side*7} 416 ${ankle} 447" stroke="${deep}" opacity=".13" fill="none"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 520" role="img" aria-label="Personalized shaded body model"><defs>
      <linearGradient id="${ns}-skin" x1="0" x2="1"><stop stop-color="${shadow}"/><stop offset=".37" stop-color="${light}"/><stop offset=".72" stop-color="${p.skin}"/><stop offset="1" stop-color="${shadow}"/></linearGradient>
      <radialGradient id="${ns}-face" cx=".42" cy=".34" r=".8"><stop stop-color="${light}"/><stop offset=".6" stop-color="${p.skin}"/><stop offset="1" stop-color="${shadow}"/></radialGradient>
      <linearGradient id="${ns}-leg" x1="0" x2="1"><stop stop-color="${shadow}"/><stop offset=".45" stop-color="${light}"/><stop offset=".7" stop-color="${p.skin}"/><stop offset="1" stop-color="${shadow}"/></linearGradient>
      <linearGradient id="${ns}-hair" x1="0" x2="1"><stop stop-color="${p.hair}"/><stop offset=".48" stop-color="${shade(p.hair,25)}"/><stop offset=".6" stop-color="${p.hair}"/><stop offset="1" stop-color="${shade(p.hair,-10)}"/></linearGradient>
      <linearGradient id="${ns}-base" x1="0" x2="1"><stop stop-color="#b8aa96"/><stop offset=".4" stop-color="#ede5d9"/><stop offset=".65" stop-color="#e0d3c0"/><stop offset="1" stop-color="#b8aa96"/></linearGradient>
    </defs><ellipse cx="160" cy="490" rx="62" ry="6" fill="#000" opacity=".09"/>${hairBack}${arms}${legs}
    <path d="M147 94H173L176 118 160 135 144 118Z" fill="url(#${ns}-skin)"/><path d="M147 104Q160 115 173 104" fill="none" stroke="${shadow}" stroke-width="3" opacity=".4"/>
    <path d="M${160-shoulder} 126Q132 121 145 114Q160 126 175 114Q188 121 ${160+shoulder} 126L${160+chest} 174Q${160+waist-4} 199 ${160+waist} 221Q${160+hips} 247 ${160+hips} ${hipY+10}Q160 ${crotch+15} ${160-hips} ${hipY+10}Q${160-hips} 247 ${160-waist} 221Q${160-waist+4} 199 ${160-chest} 174Z" fill="url(#${ns}-base)" stroke="#b5a791" stroke-width=".6"/>
    <path d="M143 119Q160 131 177 119M${160-waist} 221Q160 227 ${160+waist} 221" stroke="#b5a791" stroke-width=".8" fill="none"/>
    <path d="M${160-hips} ${hipY}Q160 ${hipY+17} ${160+hips} ${hipY}L${160+hips-5} ${crotch+36}Q180 ${crotch+45} 163 ${crotch+33}L160 ${crotch+12} 157 ${crotch+33}Q140 ${crotch+45} ${160-hips+5} ${crotch+36}Z" fill="url(#${ns}-base)" stroke="#b5a791" stroke-width=".6"/>
    <ellipse cx="133" cy="73" rx="4" ry="8" fill="${shadow}"/><ellipse cx="187" cy="73" rx="4" ry="8" fill="${shadow}"/>
    <path d="M134 59Q135 35 160 35Q185 35 186 59L184 85Q180 103 160 110Q140 103 136 85Z" fill="url(#${ns}-face)" stroke="${shadow}" stroke-width=".4"/>
    <path d="M142 66Q148 62 154 65M166 65Q173 62 179 66" stroke="${p.hair}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M142 72Q148 68 154 72Q148 76 142 72M166 72Q173 68 179 72Q173 76 166 72" fill="#f2e9df" stroke="${shadow}" stroke-width=".6"/><ellipse cx="148.5" cy="72" rx="1.7" ry="2.1" fill="#463b31"/><ellipse cx="172" cy="72" rx="1.7" ry="2.1" fill="#463b31"/>
    <path d="M160 73 157 85Q160 87 164 85" fill="none" stroke="${shadow}" stroke-width=".8"/><path d="M151 94Q160 90 169 94Q160 101 151 94" fill="${shade(p.skin,-32)}"/><path d="M152 94Q160 96 168 94" stroke="${deep}" stroke-width=".5" fill="none"/>
    <ellipse cx="145" cy="85" rx="6" ry="3" fill="#ca8c7c" opacity=".12"/><ellipse cx="175" cy="85" rx="6" ry="3" fill="#ca8c7c" opacity=".12"/>${hairFront}
    ${guideLine('chest',174,chest)}${guideLine('waist',221,waist)}${guideLine('hips',hipY,hips)}${guideLine('shoulders',126,shoulder)}${guide==='height'?'<path d="M55 30V483M50 30H60M50 483H60" stroke="#a87945" stroke-width="1.5" fill="none"/>':''}${guide==='inseam'?`<path d="M160 ${crotch+12}V470" stroke="#a87945" stroke-dasharray="5 4" fill="none"/>`:''}</svg>`;
  }
  function hairParts(p,ns) {
    const hair=human.hairFor(p.hairstyle);if(!hair)return {defs:'',markup:''};
    const [x,y,w,h]=hair.box,[left,top,right,bottom]=hair.bounds,sx=right-left,sy=bottom-top;
    const rgb=[1,3,5].map(i=>parseInt(p.hair.slice(i,i+2),16)/255);
    const matrix=rgb.map(channel=>`${.2126*channel*3} ${.7152*channel*3} ${.0722*channel*3} 0 ${channel*.2}`).join(' ')+' 0 0 0 1 0';
    const defs=`<clipPath id="${ns}-hair-window"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><filter id="${ns}-hair-color" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix}"/></filter>`;
    const markup=`<g clip-path="url(#${ns}-hair-window)"><image href="${hair.file}" x="${x-left/sx*w}" y="${y-top/sy*h}" width="${w/sx}" height="${h/sy}" preserveAspectRatio="none"${p.hair===hairColors[0]?'':` filter="url(#${ns}-hair-color)"`}/></g>`;
    return {defs,markup};
  }
  const safeNamespace=value=>'fc-'+String(value).replace(/[^a-z0-9-]/gi,'').slice(0,40);
  function hairSvg(input=example,namespace='hair') {
    const p=validate(input),parts=hairParts(p,safeNamespace(namespace));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 520" aria-hidden="true"><defs>${parts.defs}</defs>${parts.markup}</svg>`;
  }
  // The visible model uses photographic human imagery; measurements warp the reference gently.
  // Facial detail remains unchanged when a body circumference changes.
  function svg(input = example, guide = '', namespace = 'default', options = {}) {
    const p=validate(input),g=geometry(p),ns=safeNamespace(namespace);
    const source=human.bodyFor(p.skin),rows=human.strips(g),frame=human.frameFor(p.skin);
    const photoScale=453/((frame[3]-frame[1])*520),photoOffset=30-frame[1]*520*photoScale;
    const clips=rows.map((row,index)=>`<clipPath id="${ns}-body-${index}"><rect x="0" y="${row.top}" width="320" height="${row.height}"/></clipPath>`).join('');
    const body=rows.map((row,index)=>`<g clip-path="url(#${ns}-body-${index})"><image href="${source}" x="${160-160*row.scaleX}" y="${row.top+(photoOffset-row.sourceTop)*row.scaleY}" width="${320*row.scaleX}" height="${520*photoScale*row.scaleY}" preserveAspectRatio="none"/></g>`).join('');
    const hair=options.includeHair===false?{defs:'',markup:''}:hairParts(p,ns);
    const line=(key,y,width)=>guide===key?`<path d="M${160-width-15} ${y}H${160+width+15}" fill="none" stroke="#a87945" stroke-width="1.5" stroke-dasharray="5 4"/>`:'';
    const guides=line('chest',174,g.chest)+line('waist',221,g.waist)+line('hips',g.crotch-28,g.hips)+line('shoulders',126,g.shoulder)+(guide==='height'?'<path d="M55 30V483M50 30H60M50 483H60" stroke="#a87945" stroke-width="1.5" fill="none"/>':'')+(guide==='inseam'?`<path d="M160 ${g.crotch+12}V470" stroke="#a87945" stroke-dasharray="5 4" fill="none"/>`:'');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 520" role="img" aria-label="Photographic human styling reference with personalized proportions"><defs>${clips}${hair.defs}</defs>${body}${hair.markup}${guides}</svg>`;
  }
  const api = { ranges, labels, tones, hairColors, hairStyles, example, cm, display, validate, fromForm, fromUS, usHeight, heightLabel, geometry, save, svg, hairSvg, diagram };
  root.FitCheckAvatar = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
