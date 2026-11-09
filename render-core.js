/* Vendor-neutral try-on orchestration. Cache is session-local; daily attempt budget persists. */
(function(root) {
  'use strict';
  function cacheKey(modelId, garmentIds) {
    return JSON.stringify([modelId,[...new Set(garmentIds)].sort()]);
  }
  function createRenderer({provider,storage,limit=5,now=()=>new Date(),timeoutMs=30000,reserveLock=fn=>fn()}) {
    const cache = new Map(), pending = new Map();
    const usageKey = 'fitcheck-render-usage-v1';
    function usage() {
      const today = now().toISOString().slice(0,10);
      const raw = storage.getItem(usageKey);
      if (raw === null) return {day:today,count:0};
      const saved = JSON.parse(raw);
      if (!saved || !/^\d{4}-\d{2}-\d{2}$/.test(saved.day) || !Number.isInteger(saved.count) || saved.count < 0) throw Error('Render allowance could not be read. Your collage is still available.');
      return saved.day === today ? saved : {day:today,count:0};
    }
    async function render({modelId,modelImage,garments}) {
      if (!modelId || !modelImage || !Array.isArray(garments) || !garments.length || garments.some(g=>!g.id || !g.image)) throw Error('Choose a model and at least one garment.');
      const sorted = [...garments].sort((a,b)=>a.id.localeCompare(b.id));
      const key = cacheKey(modelId,sorted.map(g=>g.id));
      // IDs are the public cache key; invalidate if a photo changed under an existing ID.
      const signature = JSON.stringify([modelImage,sorted.map(g=>[g.id,g.image])]);
      if (cache.get(key)?.signature === signature) return cache.get(key).imageUrl;
      const requestKey = JSON.stringify([key,signature]);
      if (pending.has(requestKey)) return pending.get(requestKey);
      const task = (async () => {
        await reserveLock(() => {
          const budget = usage();
          if (budget.count >= limit) throw Error(`Daily limit reached (${limit} render attempts). Try again tomorrow; your collage is still available.`);
          // Count attempts, including failures, before invoking any vendor.
          storage.setItem(usageKey,JSON.stringify({...budget,count:budget.count+1}));
        });
        let timer;
        try {
          const imageUrl = await Promise.race([
            Promise.resolve().then(()=>provider.renderOutfit({modelImage,garments:sorted.map(g=>g.image)})),
            new Promise((_,reject)=>{ timer=setTimeout(()=>reject(Error('Rendering timed out. Please retry.')),timeoutMs); })
          ]);
          if (typeof imageUrl !== 'string' || !/^(https:\/\/|data:image\/(png|jpeg|webp);base64,|blob:)/.test(imageUrl)) throw Error('The provider returned an unsupported image.');
          cache.delete(key); cache.set(key,{signature,imageUrl});
          if (cache.size>20) cache.delete(cache.keys().next().value);
          return imageUrl;
        } finally { clearTimeout(timer); }
      })();
      pending.set(requestKey,task);
      try { return await task; } finally { pending.delete(requestKey); }
    }
    return {render,cacheKey,remaining:()=>Math.max(0,limit-usage().count),invalidate:({modelId,garments})=>cache.delete(cacheKey(modelId,garments.map(g=>g.id)))};
  }
  function createPreviewController({renderer,onState,onImage,onClear}) {
    let version = 0;
    return {
      reset() { version++; onClear(); onState({status:'idle'}); },
      async render(request) {
        const current = ++version;
        onClear(); onState({status:'loading'});
        try {
          const imageUrl = await renderer.render(request);
          if (version === current) { onImage(imageUrl); onState({status:'ready'}); }
        } catch(error) {
          if (version === current) { onClear(); onState({status:'error',message:error.message || 'Rendering failed. Please retry.'}); }
        }
      }
    };
  }
  const api = {cacheKey,createRenderer,createPreviewController};
  root.FitCheckRender = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
