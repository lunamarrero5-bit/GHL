/* Measurement validation and a deterministic, stylized 2D avatar. No scan or sizing claims. */
(function (root) {
  'use strict';
  const ranges = { height: [100, 240], chest: [45, 220], waist: [40, 220], hips: [45, 240], inseam: [30, 130], shoulders: [20, 80] };
  const labels = { height: 'Height', chest: 'Chest / bust', waist: 'Waist', hips: 'Hips', inseam: 'Inseam', shoulders: 'Shoulder width' };
  const tones = ['#f0d3bd', '#deb595', '#c59170', '#aa7455', '#80513e', '#50352d'];
  const hairColors = ['#25201d', '#62412b', '#b18b51', '#a74e32', '#aaa6a0'];
  const hairStyles = ['long', 'bob', 'short', 'none'];
  const example = { name: '', unit: 'cm', skin: tones[2], hair: hairColors[0], hairstyle: 'long', height: 168, chest: 90, waist: 72, hips: 98, inseam: 78, shoulders: 39 };
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
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function svg(input = example, guide = '') {
    const p = validate(input);
    const center = 160;
    const scale = 390 / p.height;
    // Circumferences inform a front-view illustration; they do not reconstruct a body.
    const chest = clamp(p.chest / Math.PI * scale * 0.53, 25, 81);
    const waist = clamp(p.waist / Math.PI * scale * 0.52, 20, 78);
    const hips = clamp(p.hips / Math.PI * scale * 0.53, 27, 87);
    const shoulder = clamp(p.shoulders * scale * 0.5, 33, 90);
    const crotch = clamp(465 - p.inseam * scale, 240, 315);
    const hipY = crotch - 28;
    const hairBack = p.hairstyle === 'long' ? `<path d="M126 80Q125 32 160 32Q200 32 195 86L207 195Q160 213 115 192Z" fill="${p.hair}"/>` : p.hairstyle === 'bob' ? `<path d="M127 78Q125 33 160 33Q199 33 195 83L201 118Q160 137 120 118Z" fill="${p.hair}"/>` : '';
    const hairFront = p.hairstyle === 'none' ? '' : `<path d="M133 66Q130 35 160 35Q192 34 189 71Q172 60 166 49Q155 66 133 66Z" fill="${p.hair}"/>`;
    const guideLine = (key, y, width) => guide === key ? `<g stroke="#a87945" stroke-width="2" stroke-dasharray="5 4"><path d="M${center-width-20} ${y}H${center+width+20}"/></g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 520" role="img" aria-label="Personalized stylized avatar"><ellipse cx="160" cy="490" rx="74" ry="9" fill="#000" opacity=".07"/>${hairBack}<g fill="${p.skin}"><path d="M146 91H174L177 122 160 138 143 122Z"/><ellipse cx="160" cy="73" rx="27" ry="35"/><path d="M${160-shoulder} 123Q${160-shoulder-15} 126 ${160-shoulder-19} 159L${160-hips-24} 290Q${160-hips-26} 308 ${160-hips-17} 310Q${160-hips-9} 309 ${160-hips-12} 289L${160-shoulder+6} 165 160 158 ${160+shoulder-6} 165 ${160+hips+12} 289Q${160+hips+9} 309 ${160+hips+17} 310Q${160+hips+26} 308 ${160+hips+24} 290L${160+shoulder+19} 159Q${160+shoulder+15} 126 ${160+shoulder} 123Z"/><path d="M${160-hips} ${hipY}Q${160-hips-3} ${crotch+14} ${160-hips+5} ${crotch+50}L128 465 121 479Q128 487 146 479L161 ${crotch+34} 174 479Q193 487 200 479L192 465 ${160+hips-5} ${crotch+50}Q${160+hips+3} ${crotch+14} ${160+hips} ${hipY}Z"/></g><path d="M${160-shoulder} 124 143 115Q160 130 177 115L${160+shoulder} 124 ${160+chest} 174Q${160+waist} 202 ${160+waist} 219H${160-waist}Q${160-waist} 202 ${160-chest} 174Z" fill="#e8e0d4" stroke="#bcb1a1" stroke-width=".8"/><path d="M${160-waist} 217H${160+waist}Q${160+hips} ${hipY-10} ${160+hips} ${hipY+12}L${160+hips-5} 324Q186 337 164 322L160 ${crotch+4} 156 322Q133 337 ${160-hips+5} 324L${160-hips} ${hipY+12}Q${160-hips} ${hipY-10} ${160-waist} 217Z" fill="#ded3c1" stroke="#bcb1a1" stroke-width=".8"/><path d="M${160-waist} 221H${160+waist}" stroke="#bcb1a1" fill="none"/>${hairFront}<path d="M149 78h4M169 78h4" stroke="#49392f" stroke-width="1.5" stroke-linecap="round"/><path d="M155 94Q160 97 165 94" stroke="#915f50" fill="none" stroke-linecap="round"/>${guideLine('chest',174,chest)}${guideLine('waist',217,waist)}${guideLine('hips',hipY,hips)}${guide === 'height' ? '<path d="M55 35V480M49 35H61M49 480H61" stroke="#a87945" fill="none" stroke-width="2"/>' : ''}${guide === 'inseam' ? `<path d="M160 ${crotch+8}V470" stroke="#a87945" stroke-dasharray="5 4" stroke-width="2"/>` : ''}${guideLine('shoulders',124,shoulder)}</svg>`;
  }
  const api = { ranges, labels, tones, hairColors, hairStyles, example, cm, display, validate, fromForm, save, svg };
  root.FitCheckAvatar = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
