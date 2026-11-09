const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Temperature = require('../temperature.js');
const F = require('../core.js');
const demo = require('../demo.js');
const source = fs.readFileSync(require.resolve('../experience.js'), 'utf8');
const start = source.indexOf('const temperatureInput =');
const end = source.indexOf("$('#closet-search').addEventListener", start);
assert.ok(start >= 0 && end > start);

function harness() {
  const nodes = new Map();
  const $ = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      value:'', textContent:'', hidden:true, checked:true, validity:{badInput:false}, attributes:{}, events:{},
      addEventListener(type, fn) {
        const previous = this.events[type];
        this.events[type] = (...args) => { previous?.(...args); fn(...args); };
      },
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
  $('#style-occasion').value = 'Casual'; $('#style-weather').value = 'mild'; $('#temp-unit').value = 'F';
  vm.runInContext(source.slice(start, end), context);
  return {$, context, calls,
    submit() { $('#style-form').events.submit({preventDefault(){}}); },
    unit(unit) { $('#temp-unit').value = unit; $('#temp-unit').events.change(); }
  };
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

test('review: 60.1°C remains rejected after switching to Fahrenheit and back', () => {
  const h = harness(); h.$('#style-weather').value = 'rain'; h.unit('C');
  h.$('#style-temp').value = '60.1'; h.submit();
  assert.match(h.$('#temperature-error').textContent, /realistic/);
  h.unit('F');
  assert.ok(Number(h.$('#style-temp').value) > 140);
  h.submit();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('#temperature-error').textContent, /realistic/);
  h.unit('C'); h.submit();
  assert.equal(Number(h.$('#style-temp').value), 60.1);
  assert.equal(h.calls.length, 0);
});
test('review: 140.1°F remains rejected after switching to Celsius', () => {
  const h = harness(); h.$('#style-weather').value = 'rain'; h.$('#style-temp').value = '140.1'; h.submit();
  h.unit('C');
  assert.ok(Number(h.$('#style-temp').value) > 60);
  h.submit();
  assert.equal(h.calls.length, 0);
  assert.match(h.$('#temperature-error').textContent, /realistic/);
});
test('review: a value just below the Chilly cutoff stays cold through unit switches', () => {
  const h = harness(); h.unit('C'); h.$('#style-temp').value = '15.99'; h.submit();
  assert.match(h.$('#temperature-note').textContent, /seems cold/);
  h.unit('F'); h.submit();
  assert.match(h.$('#temperature-note').textContent, /seems cold/);
  assert.equal(h.calls.length, 0);
  h.unit('C'); h.submit();
  assert.match(h.$('#temperature-note').textContent, /seems cold/);
});
test('the exact Mild/Hot cutoff stays Mild through repeated unit switches', () => {
  const h = harness(); h.unit('C'); h.$('#style-temp').value = '27'; h.submit();
  for (let i = 0; i < 10; i++) {
    h.unit('F'); h.submit();
    assert.equal(h.$('#temperature-conflict').hidden, true);
    assert.ok(h.context.activeLooks.length > 0);
    h.unit('C'); h.submit();
    assert.equal(Number(h.$('#style-temp').value), 27);
    assert.equal(h.$('#temperature-conflict').hidden, true);
  }
});
test('an explicit edit replaces the original reading after conversion', () => {
  const h = harness(); h.$('#style-weather').value = 'rain'; h.$('#style-temp').value = '140.1'; h.submit();
  h.unit('C'); h.$('#style-temp').value = '60'; h.$('#style-temp').events.input(); h.submit();
  assert.equal(h.$('#temperature-error').textContent, '');
  assert.ok(h.context.activeLooks.length > 0);
  h.unit('F'); h.submit();
  assert.equal(Number(h.$('#style-temp').value), 140);
  assert.ok(h.context.activeLooks.length > 0);
});
test('blank temperatures stay blank and exact range boundaries stay valid across toggles', () => {
  for (const raw of ['', '-50', '60']) {
    const h = harness(); h.$('#style-weather').value = 'rain'; h.unit('C');
    h.$('#style-temp').value = raw; h.$('#style-temp').events.input();
    for (let i = 0; i < 10; i++) {
      h.unit('F'); h.submit(); assert.equal(h.$('#temperature-error').textContent, '');
      h.unit('C'); h.submit(); assert.equal(h.$('#temperature-error').textContent, '');
      assert.equal(h.$('#style-temp').value, raw);
    }
  }
});
test('Rain intentionally provides a footwear reminder without requiring a warm layer', () => {
  const h = harness(); h.unit('C'); h.$('#style-temp').value = '0'; h.$('#style-weather').value = 'rain'; h.submit();
  assert.equal(h.$('#temperature-conflict').hidden, true);
  assert.equal(h.$('#temperature-error').textContent, '');
  assert.ok(h.context.activeLooks.length > 0);
  assert.ok(h.context.activeLooks.every(look => !look.itemIds.includes('demo-blazer')));
});
