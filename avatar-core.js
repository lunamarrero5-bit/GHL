/* Measurement validation and a deterministic, stylized 2D avatar. No scan or sizing claims. */
(function (root) {
  'use strict';
  const human=root.FitCheckHuman || (typeof require==='function'?require('./human-model.js'):null);
  const ranges = { height: [100, 240], chest: [45, 220], waist: [40, 220], hips: [45, 240], inseam: [30, 130], shoulders: [20, 80] };
  const labels = { height: 'Height', chest: 'Chest / bust', waist: 'Waist', hips: 'Hips', inseam: 'Inseam', shoulders: 'Shoulder width' };
  const tones = ['#f0d3bd', '#deb595', '#c59170', '#aa7455', '#80513e', '#50352d'];
  const hairColors = ['#25201d', '#62412b', '#b18b51', '#a74e32', '#aaa6a0'];
  const hairStyles = ['long', 'bob', 'short', 'none'];
  const example = { name: '', unit: 'in', shape:'balanced', measurementsProvided:false, skin: tones[2], hair: hairColors[0], hairstyle: 'none', height: 168, chest: 90, waist: 72, hips: 98, inseam: 78, shoulders: 39 };
  const cm = (value, unit) => Number(value) * (unit === 'in' ? 2.54 : 1);
  const display = (value, unit) => Number((value / (unit === 'in' ? 2.54 : 1)).toFixed(1));
  function validate(input) {
    if (!input || !['cm', 'in'].includes(input.unit)) throw Error('Choose centimeters or inches.');
    if (typeof input.name !== 'string' || input.name.trim().length > 40) throw Error('Use a first name of 40 characters or fewer.');
    if(input.measurementsProvided!==undefined && typeof input.measurementsProvided!=='boolean') throw Error('Invalid measurement notes setting.');
    if (!tones.includes(input.skin) || !hairColors.includes(input.hair) || !hairStyles.includes(input.hairstyle)) throw Error('Choose an available skin tone and hair style.');
    human.presetFor(input);
    const result = { name: input.name.trim(), unit: input.unit, shape:input.shape || 'balanced', measurementsProvided:input.measurementsProvided!==false, skin: input.skin, hair: input.hair, hairstyle: input.hairstyle };
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
    const result = { ...input, measurementsProvided:true };
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
    const result = {...input, unit:'in', measurementsProvided:true, height: Number(((Number(input.feet)*12 + inches)*2.54).toFixed(3)), estimated:[]};
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
  // Legacy measurement records are preserved, but never deform a preset image.
  function geometry(input = example) {
    const p=validate(input), preset=human.presetFor(p), a=preset.anchors;
    return {presetId:preset.id, anchors:a, shoulder:(a.shoulders[1][0]-a.shoulders[0][0])/2,
      chest:48, waist:(a.waist[1][0]-a.waist[0][0])/2, hips:(a.hips[1][0]-a.hips[0][0])/2, crotch:224};
  }
  function svg(input = example) {
    const preset=human.presetFor(validate(input));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 520" role="img" aria-label="${preset.label} fixed-pose photographic sample model"><image href="${preset.image}" width="320" height="520" preserveAspectRatio="xMidYMid meet"/></svg>`;
  }
  // Tutorial thumbnails use the same unsegmented base; instructions are beside/below it.
  function diagram(input = example) { return svg(input); }
  const api = { ranges, labels, tones, hairColors, hairStyles, example, cm, display, validate, fromForm, fromUS, usHeight, heightLabel, geometry, save, svg, diagram };
  root.FitCheckAvatar = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
