/* Model matching and validated, photo-free preferences. No image warping. */
(function(root) {
  'use strict';
  const catalog = root.FitCheckModels || (typeof require === 'function' ? require('./models.js') : []);
  const choices = {
    heightClass:['short','average','tall'], build:['slim','regular','full'],
    skinTone:['light','light-medium','medium','medium-deep','deep','rich-deep'],
    hairStyle:['long','bob','short','none'], hairColor:['black','brown','blonde','gray']
  };
  const defaults = {heightCm:168,heightClass:'average',build:'regular',skinTone:'medium',hairStyle:'long',hairColor:'brown'};
  const heightClass = cm => cm < 162 ? 'short' : cm > 175 ? 'tall' : 'average';
  function validatePreferences(value) {
    if (!value || typeof value.heightCm !== 'number' || !Number.isFinite(value.heightCm) || value.heightCm < 120 || value.heightCm > 220) throw Error('Choose a height between 120 and 220 cm.');
    const clean = {heightCm:value.heightCm};
    for (const [key, options] of Object.entries(choices)) {
      const entry = key === 'heightClass' ? heightClass(value.heightCm) : value[key];
      if (!options.includes(entry)) throw Error(`Choose a supported ${key.replace(/([A-Z])/g,' $1').toLowerCase()}.`);
      clean[key] = entry;
    }
    return clean;
  }
  function loadModels(entries = catalog) {
    if (!Array.isArray(entries)) throw Error('The model library is unavailable.');
    const ids = new Set();
    return entries.map(model => {
      if (!model || typeof model.id !== 'string' || !/^[a-z0-9-]{1,100}$/.test(model.id) || ids.has(model.id) || typeof model.image !== 'string' || !/^assets\/models\/[a-zA-Z0-9_-]+\.(svg|png|webp|jpg|jpeg)$/.test(model.image)) throw Error('A model library entry is invalid.');
      const preferences = validatePreferences(model);
      if (model.heightClass !== preferences.heightClass) throw Error('Model height class does not match its height.');
      ids.add(model.id);
      return {...preferences,id:model.id,image:model.image};
    });
  }
  function pickModel(preferences, entries = catalog) {
    const p = validatePreferences(preferences);
    const models = loadModels(entries);
    if (!models.length) throw Error('No models are available yet.');
    const rank = (key, model) => Math.abs(choices[key].indexOf(p[key]) - choices[key].indexOf(model[key]));
    const score = model => Math.abs(p.heightCm-model.heightCm)/15 + rank('heightClass',model) + 3*rank('build',model) + 4*rank('skinTone',model) + (p.hairStyle===model.hairStyle?0:2) + (p.hairColor===model.hairColor?0:1);
    return models.sort((a,b) => score(a)-score(b) || a.id.localeCompare(b.id))[0];
  }
  function validateSelection(value) {
    // Keep syntactically valid IDs when a library entry is retired; UI rematches preferences.
    if (!value || typeof value.modelId !== 'string' || !/^[a-z0-9-]{1,100}$/.test(value.modelId)) throw Error('The saved model choice is invalid.');
    return {modelId:value.modelId,preferences:validatePreferences(value.preferences)};
  }
  function resolveSelection(selection, entries = catalog) {
    const saved = selection ? validateSelection(selection) : null;
    return loadModels(entries).find(model => model.id === saved?.modelId) || pickModel(saved?.preferences || defaults,entries);
  }
  const scaleForHeight = (heightCm, model) => Math.max(.96,Math.min(1.04,heightCm/model.heightCm));
  const api = {choices,defaults,heightClass,validatePreferences,loadModels,pickModel,validateSelection,resolveSelection,scaleForHeight};
  root.FitCheckModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
