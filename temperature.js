/* Optional, user-entered temperature; never a live forecast. */
(function(root) {
  'use strict';
  const labels = {cold:'Chilly', mild:'Mild / indoors', hot:'Hot', rain:'Rain'};
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
    const feeling = suggested === 'hot' ? 'warm' : suggested === 'cold' ? 'cold' : 'mild';
    return {weather, suggested, conflict:`${number}°${unit} seems ${feeling} for “${labels[weather]}”. Switch conditions or continue with your selected conditions.`};
  }
  const api = {evaluate, labels};
  root.FitCheckTemperature = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
