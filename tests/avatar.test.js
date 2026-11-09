const { test } = require('node:test');
const assert = require('node:assert/strict');
const Avatar = require('../avatar-core.js');
const F = require('../core.js');
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
test('uploaded photographs are allowed while external product photos cannot become owned pieces', () => {
  for(const image of ['data:image/jpeg;base64,aGVsbG8=','data:image/png;base64,aGVsbG8=','data:image/webp;base64,aGVsbG8=']) assert.ok(F.photoOK(image));
  for(const image of ['https://example.com/a.jpg','https://is4.revolveassets.com/images/p4/n/uv/SIMX-WP13_V1.jpg','javascript:alert(1)']) assert.equal(F.photoOK(image),false);
});
test('earlier sample URLs remain readable for recovery but never enter outfit suggestions', () => {
  const example={id:'old',name:'Earlier example',category:'Tops',color:'Red',occasion:'Casual',image:'https://is4.revolveassets.com/images/p4/n/uv/FREE-WS5542_V1.jpg'};
  const data=F.validate({items:[example],outfits:[]});
  assert.equal(data.items[0].origin,'unconfirmed');
  assert.equal(F.isOwned(data.items[0]),false);
  assert.equal(F.suggest(data.items).looks.length,0);
});
test('legacy SVGs are recoverable but never qualify as uploaded garment photographs', () => {
  const old='data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E';
  assert.ok(F.imageOK(old));assert.equal(F.photoOK(old),false);
});
test('US setup accepts feet and inches and stores canonical centimeters', () => {
  const result=Avatar.fromUS({...input(),feet:5,inches:6,chest:34,waist:28,hips:38,inseam:'',shoulders:''});
  assert.equal(result.height,167.64);assert.equal(result.chest,86.36);assert.equal(result.unit,'in');
  assert.deepEqual(result.estimated,['inseam','shoulders']);
  assert.equal(Avatar.heightLabel(result.height),'5 ft 6 in');
});
test('US setup rejects fractional feet and overflowing height inches', () => {
  const data={...input(),feet:5,inches:6,chest:34,waist:28,hips:38,inseam:30,shoulders:15};
  assert.throws(()=>Avatar.fromUS({...data,feet:5.5}));assert.throws(()=>Avatar.fromUS({...data,inches:12}));
  assert.throws(()=>Avatar.fromUS({...data,waist:''}));
});
test('a feet-only height assumes zero additional inches', () => {
  const p=Avatar.fromUS({...input(),feet:6,inches:'',chest:36,waist:30,hips:38,inseam:'',shoulders:''});
  assert.equal(p.height,182.88);assert.equal(Avatar.heightLabel(p.height),'6 ft 0 in');
});
test('avatar gradient IDs are scoped so separate previews do not overwrite appearance', () => {
  const home=Avatar.svg(input(),'','home');const setup=Avatar.svg(input({skin:Avatar.tones[5]}),'','setup');
  assert.ok(home.includes('fc-home-skin'));assert.ok(setup.includes('fc-setup-skin'));
  assert.ok(!home.includes('fc-setup-skin'));
});
