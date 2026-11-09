/* Optional, user-entered temperature; never a live forecast. */
(function(root) {
  'use strict';
  const labels = {cold:'Chilly', mild:'Mild / indoors', hot:'Hot', rain:'Rain'};
  function conflictMessage(number, unit, weather, suggested) {
    const feeling = suggested === 'hot' ? 'warm' : suggested === 'cold' ? 'cold' : 'mild';
    return `${number}°${unit} seems ${feeling} for “${labels[weather]}”. Switch conditions or continue with your selected conditions.`;
  }
  function evaluate(value, unit, weather, badInput = false) {
    const error = 'Enter a realistic temperature between −58°F and 140°F (−50°C to 60°C), or leave it blank.';
    if (badInput || !['F','C'].includes(unit)) return {error};
    const raw = String(value).trim();
    if (!raw) return {weather};
    const number = Number(raw);
    const c = unit === 'F' ? (number - 32) * 5 / 9 : number;
    if (!Number.isFinite(number) || c < -50 || c > 60) return {error};
    const suggested = c < 16 ? 'cold' : c > 27 ? 'hot' : 'mild';
    if (weather === 'rain' || suggested === weather) return {weather};
    return {weather, suggested, conflict:conflictMessage(number, unit, weather, suggested)};
  }
  function createInput(initialUnit) {
    let lastUnit = initialUnit;
    let source = null;
    function edit(value, unit, badInput = false) {
      const raw = String(value).trim();
      source = {raw, unit, badInput, display:raw, displayUnit:unit};
      lastUnit = unit;
      return source;
    }
    function current(value, unit, badInput) {
      if (!source || source.display !== String(value).trim() || source.displayUnit !== unit) return edit(value, unit, badInput);
      if (badInput) source.badInput = true;
      return source;
    }
    return {
      edit,
      evaluate(value, unit, weather, badInput = false) {
        const reading = current(value, unit, badInput);
        // Always validate/classify the last user edit, not a converted display value.
        const result = evaluate(reading.raw, reading.unit, weather, reading.badInput);
        if (result.conflict) result.conflict = conflictMessage(Number(value), unit, weather, result.suggested);
        return result;
      },
      convert(value, unit, badInput = false) {
        const reading = current(value, lastUnit, badInput);
        let display = reading.raw;
        if (display && !reading.badInput && Number.isFinite(Number(display)) && ['F','C'].includes(unit) && ['F','C'].includes(reading.unit) && unit !== reading.unit) {
          display = String(unit === 'C' ? (Number(display) - 32) * 5 / 9 : Number(display) * 9 / 5 + 32);
        }
        // Retain original input and unit across toggles to avoid round-trip drift.
        reading.display = display; reading.displayUnit = unit; lastUnit = unit;
        return display;
      }
    };
  }
  const api = {evaluate, labels, createInput};
  root.FitCheckTemperature = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
