const { test } = require('node:test');
const assert = require('node:assert/strict');
const Avatar = require('../avatar-core.js');
const F = require('../core.js');
const catalog = require('../catalog.js');
const input = (overrides = {}) => ({ ...Avatar.example, ...overrides });

test('avatar data round-trips with all six canonical measurements', () => {
  const p = Avatar.validate(input({ name: '  Khushi  ' }));
  assert.equal(p.name, 'Khushi');
  assert.deepEqual(Avatar.validate(JSON.parse(JSON.stringify(p))), p);
});
test('inch and centimeter inputs describe the same avatar', () => {
  const inchInput = input({ unit: 'in' });
  for (const key of Object.keys(Avatar.ranges)) inchInput[key] = Avatar.example[key] / 2.54;
  const p = Avatar.fromForm(inchInput);
  for (const key of Object.keys(Avatar.ranges)) assert.equal(p[key], Avatar.example[key]);
  assert.equal(p.unit, 'in');
  assert.equal(Avatar.svg(p), Avatar.svg(Avatar.example));
});
test('blank measurements cannot silently become example values or zero', () => {
  for (const key of Object.keys(Avatar.ranges)) assert.throws(() => Avatar.fromForm(input({ [key]: '' })), /Enter your/);
});
test('invalid numeric measurements are rejected', () => {
  for (const height of [NaN, Infinity, -1, 0, 300, '168', null]) assert.throws(() => Avatar.validate(input({ height })));
});
test('all measurement bounds are enforced', () => {
  for (const [key, [min, max]] of Object.entries(Avatar.ranges)) {
    assert.throws(() => Avatar.validate(input({ [key]: min - 1 })));
    assert.throws(() => Avatar.validate(input({ [key]: max + 1 })));
  }
});
test('clearly inconsistent height and inseam produce a helpful correction', () => {
  assert.throws(() => Avatar.validate(input({ height: 150, inseam: 120 })), /height and inseam/);
});
test('unsafe appearance values and unknown units cannot reach the SVG', () => {
  assert.throws(() => Avatar.validate(input({ skin: '" onload="alert(1)' })));
  assert.throws(() => Avatar.validate(input({ hair: 'url(https://example.com)' })));
  assert.throws(() => Avatar.validate(input({ unit: 'feet' })));
  assert.throws(() => Avatar.validate(input({ hairstyle: '<script>' })));
});
test('names never appear as markup in the avatar SVG', () => {
  const markup = Avatar.svg(input({ name: '<img src=x onerror=alert(1)>' }));
  assert.ok(!markup.includes('<img'));
  assert.ok(!markup.includes('onerror'));
});
test('changing body proportions changes the silhouette', () => {
  assert.notEqual(Avatar.svg(input({ waist: 95, hips: 115 })), Avatar.svg(input()));
});
test('measurement guides highlight the chosen measurement', () => {
  assert.notEqual(Avatar.svg(input(), 'chest'), Avatar.svg(input()));
  assert.ok(!Avatar.svg(input()).includes('NaN'));
  for (const hairstyle of Avatar.hairStyles) assert.ok(Avatar.svg(input({ hairstyle })).includes('<svg'));
});
test('profile saving validates before writing', () => {
  let writes = 0;
  const storage = { setItem() { writes++; } };
  assert.throws(() => Avatar.save(storage, input({ waist: -1 })));
  assert.equal(writes, 0);
  Avatar.save(storage, input());
  assert.equal(writes, 1);
});
test('failed profile writes surface an error without replacing the saved profile', () => {
  let stored = JSON.stringify(input());
  const before = stored;
  const storage = { setItem() { throw Error('QuotaExceededError'); } };
  assert.throws(() => Avatar.save(storage, input({ waist: 80 })), /Quota/);
  assert.equal(stored, before);
});
test('only exact sample catalog image URLs are permitted', () => {
  for (const image of catalog.images) assert.ok(F.imageOK(image));
  for (const image of ['https://example.com/a.jpg', catalog.images[0] + '?tracking=1', catalog.images[0].replace('https:', 'http:'), 'javascript:alert(1)', 'https://cdn.dummyjson.com.evil.com/photo.webp']) assert.equal(F.imageOK(image), false);
});
test('photographic catalog items survive wardrobe save and restore', () => {
  const items = catalog.pieces.map((piece, n) => ({ ...piece, id: `sample-${n}` }));
  const state = F.validate({ items, outfits: [{ id: 'look', name: 'After hours', occasion: 'Going out', itemIds: ['sample-0', 'sample-3'] }] });
  assert.deepEqual(F.validate(JSON.parse(JSON.stringify(state))), state);
  assert.equal(state.items[0].image, catalog.images[0]);
});
test('all current sample pieces have real photographic sources on REVOLVE', () => {
  assert.equal(new Set(catalog.pieces.map(piece => piece.key)).size,catalog.pieces.length);
  for (const piece of catalog.pieces) {
    assert.ok(/^https:\/\/is[48]\.revolveassets\.com\/images\/p4\/n\/uv\/[\w-]+_V1\.jpg$/.test(piece.image));
    assert.ok(piece.source.startsWith('https://www.revolve.com/'));
    assert.ok(F.photoOK(piece.image));
    assert.ok(F.photoOK(piece.alternate));
    assert.equal(catalog.byImage(piece.alternate).key,piece.key);
  }
  for(const category of ['Tops','Bottoms','Layers','Dresses','Shoes']) assert.ok(catalog.pieces.some(piece=>piece.category===category));
});
test('legacy clothing SVGs are readable for recovery but never qualify as photographs', () => {
  const old='data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E';
  assert.ok(F.imageOK(old));
  assert.equal(F.photoOK(old),false);
  const custom={id:'custom',name:'My original sketch',category:'Tops',color:'Red',image:old};
  assert.equal(catalog.migrateIllustrated([custom])[0],custom);
});
