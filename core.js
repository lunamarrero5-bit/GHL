/* Pure wardrobe rules shared by the website and regression tests. */
(function (root) {
  'use strict';
  const categories = ['Tops', 'Bottoms', 'Layers', 'Shoes', 'Dresses'];
  const occasions = ['Casual', 'Work', 'Going out'];
  const day = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dateOK = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(`${s}T12:00:00Z`).toISOString().slice(0, 10) === s;
  const textOK = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  const unique = (xs) => new Set(xs).size === xs.length;
  function validate(data) {
    if (!data || !Array.isArray(data.items) || !Array.isArray(data.outfits) || data.items.length > 1000 || data.outfits.length > 1000) throw Error('This is not a supported FitCheck backup.');
    if (!data.items.every(i => i && textOK(i.id, 100) && textOK(i.name, 60) && textOK(i.color, 30) && categories.includes(i.category) && occasions.includes(i.occasion) && typeof i.image === 'string' && i.image.length < 2000000 && /^data:image\/(svg\+xml;charset=utf-8,|(?:jpeg|png|webp);base64,)/.test(i.image) && (i.availability === undefined || ['unknown','ready','laundry'].includes(i.availability)) && (i.wears === undefined || (Array.isArray(i.wears) && i.wears.length <= 10000 && i.wears.every(d => dateOK(d) && d <= day()) && unique(i.wears))))) throw Error('A clothing item has invalid data.');
    if (!unique(data.items.map(i => i.id))) throw Error('Duplicate clothing IDs in backup.');
    const ids = new Set(data.items.map(i => i.id));
    if (!data.outfits.every(o => o && textOK(o.id,100) && textOK(o.name,60) && occasions.includes(o.occasion) && Array.isArray(o.itemIds) && o.itemIds.length > 0 && unique(o.itemIds) && o.itemIds.every(id => ids.has(id)))) throw Error('An outfit contains invalid or missing pieces.');
    if (!unique(data.outfits.map(o => o.id))) throw Error('Duplicate outfit IDs in backup.');
    const outfitIds = new Set(data.outfits.map(o => o.id));
    if (data.plans !== undefined && (!Array.isArray(data.plans) || data.plans.length > 2000 || !data.plans.every(p => p && textOK(p.id,100) && outfitIds.has(p.outfitId) && dateOK(p.date)) || !unique(data.plans.map(p => p.id)))) throw Error('Calendar data is invalid.');
    return { items: data.items.map(i => ({ id:i.id, name:i.name, category:i.category, color:i.color, occasion:i.occasion, image:i.image, availability:i.availability || 'unknown', wears:i.wears || [] })), outfits: data.outfits.map(o => ({id:o.id,name:o.name,occasion:o.occasion,itemIds:[...o.itemIds]})), plans: (data.plans || []).map(p => ({id:p.id,outfitId:p.outfitId,date:p.date})) };
  }
  const lastWorn = i => (i.wears || []).slice().sort().at(-1) || '';
  const underused = (i, today = day()) => !lastWorn(i) || (Date.parse(`${today}T12:00:00Z`) - Date.parse(`${lastWorn(i)}T12:00:00Z`)) / 86400000 >= 30;
  function suggest(items, { occasion = 'Casual', weather = 'mild', rediscover = true } = {}) {
    if (!occasions.includes(occasion)) return { looks: [], message: 'Your catalog does not confirm any formal or black-tie attire. Add suitable pieces before planning this dress code; a work look is not a substitute.' };
    const pool = items.filter(i => i.availability !== 'laundry');
    const score = i => (i.occasion === occasion ? 10 : 0) + (rediscover && underused(i) ? 5 : 0) - (i.wears || []).length * 0.1;
    const by = category => pool.filter(i => i.category === category && (i.occasion === occasion || category === 'Shoes' || category === 'Layers')).sort((a,b) => score(b)-score(a)).slice(0,30);
    const tops=by('Tops'), bottoms=by('Bottoms'), dresses=by('Dresses'), shoes=by('Shoes'), layers=by('Layers');
    if (!shoes.length || (!dresses.length && (!tops.length || !bottoms.length))) return { looks: [], message: 'There isn’t a complete outfit for this occasion among your available pieces. Add suitable tops and bottoms (or a dress), plus shoes, or update laundry status in My closet.' };
    if (weather === 'cold' && !layers.length) return {looks:[], message:'No available layer is in your closet for chilly conditions. Add a jacket or update its laundry status, or change conditions if you will be indoors.'};
    const combos=[];
    for (const dress of dresses) for (const shoe of shoes) combos.push([dress,shoe]);
    for (const top of tops) for (const bottom of bottoms) for (const shoe of shoes) { if (combos.length >= 1500) break; combos.push([top,bottom,shoe]); }
    const result=combos.map((pieces,index) => {
      const all = weather === 'cold' ? [...pieces,layers[index % layers.length]] : pieces;
      return { itemIds:all.map(i => i.id), score:all.reduce((sum,i) => sum+score(i),0), occasion, weather };
    }).sort((a,b)=>b.score-a.score).slice(0,3);
    return { looks:result, message: result.length === 1 ? 'One complete combination found. Add more pieces to unlock alternatives.' : `${result.length} combinations from your closet. Swap pieces to make them yours.` };
  }
  const api = { validate, suggest, underused, lastWorn, day, dateOK };
  if (typeof module !== 'undefined') module.exports = api;
  root.FitCheck = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
