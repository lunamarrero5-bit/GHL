const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const F = require('../core.js');
const demo = require('../demo.js');
const source = fs.readFileSync(require.resolve('../experience.js'), 'utf8');
const start = source.indexOf("$('#suggested-save-form').addEventListener");
const end = source.indexOf("$('#undo-change').addEventListener", start);
assert.ok(start >= 0 && end > start, 'Direct-save handlers must exist');

// Exercise the real event handlers with a small form/DOM adapter.
function harness({ failWrite = false } = {}) {
  const nodes = new Map();
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', textContent: '', attributes: {}, events: {}, closed: false,
      addEventListener(type, callback) { this.events[type] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      focus() { this.focused = true; },
      close() { this.closed = true; this.events.close?.(); }
    });
    return nodes.get(selector);
  };
  let writes = 0;
  const state = F.validate({ items: demo.wardrobe(), outfits: [] });
  const context = vm.createContext({
    $: node, state, STORAGE_KEY: 'fitcheck-demo-v1',
    suggestedSaveDraft: { storageKey: 'fitcheck-demo-v1', occasion: 'Going out', itemIds: ['demo-dress', 'demo-shoes'] },
    canUseItem: item => F.isOwned(item) || (item?.origin === 'demo' && F.demoPhotoOK(item.image)),
    makeId: () => 'saved-look', notify: () => {},
    commit(next) { if (failWrite) return false; context.state = F.validate(next); writes++; return true; }
  });
  vm.runInContext(source.slice(start, end), context);
  return { node, context, get writes() { return writes; }, submit(name) { node('#suggested-outfit-name').value = name; node('#suggested-save-form').events.submit({ preventDefault() {} }); } };
}

test('direct save trims the title, retains suggested pieces and does not log wear', () => {
  const h = harness(); h.submit('  Dinner demo - direct save  ');
  assert.equal(h.context.state.outfits[0].name, 'Dinner demo - direct save');
  assert.deepEqual(h.context.state.outfits[0].itemIds, ['demo-dress', 'demo-shoes']);
  assert.ok(h.context.state.items.every(item => item.wears.length === 0));
  assert.equal(h.node('#suggested-save-dialog').closed, true);
  assert.equal(h.context.suggestedSaveDraft, null);
});
test('blank and whitespace-only titles show an inline error without saving', () => {
  for (const name of ['', '   ']) {
    const h = harness(); h.submit(name);
    assert.equal(h.writes, 0);
    assert.match(h.node('#suggested-save-error').textContent, /look name/);
    assert.equal(h.node('#suggested-outfit-name').attributes['aria-invalid'], 'true');
    assert.equal(h.node('#suggested-save-dialog').closed, false);
  }
});
test('cancel discards the draft without saving', () => {
  const h = harness(); h.node('#cancel-suggested-save').events.click();
  assert.equal(h.context.suggestedSaveDraft, null); assert.equal(h.writes, 0);
  h.submit('Late submit'); assert.equal(h.writes, 0);
});
test('a failed write keeps the draft and dialog available to retry', () => {
  const h = harness({ failWrite: true }); h.submit('Dinner');
  assert.equal(h.context.state.outfits.length, 0);
  assert.equal(h.node('#suggested-save-dialog').closed, false);
  assert.ok(h.context.suggestedSaveDraft);
  assert.match(h.node('#suggested-save-error').textContent, /Could not save/);
});
test('a removed piece, laundry change or workspace switch prevents a stale save', () => {
  for (const change of [
    h => { h.context.state.items = h.context.state.items.filter(i => i.id !== 'demo-dress'); },
    h => { h.context.state.items.find(i => i.id === 'demo-dress').availability = 'laundry'; },
    h => { h.context.STORAGE_KEY = 'fitcheck-v1'; }
  ]) {
    const h = harness(); change(h); h.submit('Stale look');
    assert.equal(h.writes, 0); assert.match(h.node('#suggested-save-error').textContent, /wardrobe changed/);
  }
});
test('resubmitting after success cannot create a second outfit', () => {
  const h = harness(); h.submit('Dinner'); h.submit('Dinner');
  assert.equal(h.writes, 1); assert.equal(h.context.state.outfits.length, 1);
});
