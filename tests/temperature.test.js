const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Temperature = require('../temperature.js');
const F = require('../core.js');
const demo = require('../demo.js');
const source = fs.readFileSync(require.resolve('../experience.js'), 'utf8');
const start = source.indexOf('function clearTemperatureFeedback()');
const end = source.indexOf("$('#undo-change').addEventListener", start);
assert.ok(start >= 0 && end > start);

function harness() {
  const nodes = new Map();
  const $ = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      value:'', textContent:'', hidden:true, checked:true, validity:{badInput:false}, attributes:{}, events:{},
      addEventListener(type, fn) { this.events[type] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      focus() { this.focused = true; }, replaceChildren() { this.cleared = true; }
    });
    return nodes.get(selector);
  };
  let calls = [];
  const state = F.validate({items:demo.wardrobe(), outfits:[]});
  const context = vm.createContext({
    $, FitCheckTemperature:Temperature,
    FitCheck:{suggest(items, options) { calls.push(options); return F.suggest(items, options); }},
    state, canUseItem:() => true, isDemoMode:true,
    activeLooks:[], lookIndex:0, suggestionMessage:'', renderSuggestions() {}
  });
  vm.runInContext(source.slice(start, end), context);
  $('#style-occasion').value = 'Casual'; $('#style-weather').value = 'mild'; $('#temp-unit').value = 'F';
  return {$, context, calls, submit() { $('#style-form').events.submit({preventDefault(){}}); }};
}

test('S1: 68°F and Mild generates everyday ideas without feedback', () => {
  const h = harness(); h.$('#style-temp').value = '68'; h.submit();
  assert.ok(h.context.activeLooks.length > 0);
  assert.equal(h.$('#temperature-error').textContent, '');
  assert.equal(h.$('#temperature-conflict').hidden, true);
  assert.equal(h.calls[0].weather, 'mild');
});
test('S2: 500°F shows an inline error and clears previous ideas', () => {
  const h = harness(); h.$('#style-temp').value = '68'; h.submit();
  h.$('#style-occasion').value = 'Work'; h.$('#style-temp').value = '500'; h.submit();
  assert.equal(h.calls.length, 1);
  assert.equal(h.context.activeLooks.length, 0);
  assert.match(h.$('#temperature-error').textContent, /realistic temperature/);
  assert.equal(h.$('#style-temp').attributes['aria-invalid'], 'true');
});
test('S3: 92°F and Chilly waits for an explicit choice; Continue preserves Chilly', () => {
  const h = harness(); h.$('#style-temp').value = '92'; h.$('#style-weather').value = 'cold';
  h.$('#style-occasion').value = 'Going out'; h.submit();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('#temperature-note').textContent, /92°F seems warm.*Chilly/);
  assert.equal(h.$('#temperature-conflict').hidden, false);
  h.$('#keep-temperature-conditions').events.click();
  assert.equal(h.calls[0].weather, 'cold');
  assert.ok(h.context.activeLooks.length > 0);
  assert.equal(h.$('#style-weather').value, 'cold');
});
test('S3 alternative: Switch changes Chilly to Hot and generates ideas', () => {
  const h = harness(); h.$('#style-temp').value = '92'; h.$('#style-weather').value = 'cold'; h.submit();
  h.$('#switch-temperature-conditions').events.click();
  assert.equal(h.$('#style-weather').value, 'hot');
  assert.equal(h.calls[0].weather, 'hot');
  assert.ok(h.context.activeLooks.length > 0);
});
test('S4: blank temperature keeps Rain and generates ideas without feedback', () => {
  const h = harness(); h.$('#style-weather').value = 'rain'; h.submit();
  assert.ok(h.context.activeLooks.length > 0);
  assert.equal(h.calls[0].weather, 'rain');
  assert.equal(h.$('#temperature-error').textContent, '');
  assert.equal(h.$('#temperature-conflict').hidden, true);
});
test('editing temperature clears stale warnings; a stale button cannot bypass validation', () => {
  const h = harness(); h.$('#style-temp').value = '92'; h.$('#style-weather').value = 'cold'; h.submit();
  h.$('#style-temp').value = '500'; h.$('#style-temp').events.input();
  assert.equal(h.$('#temperature-conflict').hidden, true);
  h.$('#keep-temperature-conditions').events.click();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('#temperature-error').textContent, /realistic/);
});
test('nonfinite values, invalid native number input and out-of-range Celsius are rejected', () => {
  for (const value of ['NaN','Infinity','abc','-51','61']) assert.ok(Temperature.evaluate(value,'C','mild').error);
  assert.ok(Temperature.evaluate('','F','mild',true).error);
  assert.ok(Temperature.evaluate('68','X','mild').error);
});
test('Fahrenheit and Celsius ranges agree; decimal and blank inputs are accepted', () => {
  for (const [value,unit] of [['-58','F'],['140','F'],['-50','C'],['60','C'],['20.5','C'],['','C']]) {
    assert.equal(Temperature.evaluate(value,unit,'rain').error, undefined);
  }
  assert.equal(Temperature.evaluate('20','C','mild').weather, 'mild');
  assert.equal(Temperature.evaluate('92','F','rain').weather, 'rain');
});
