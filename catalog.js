/* A small, fixed photographic sample collection. These are examples, not purchases. */
(function (root) {
  const photo = (category, slug) => `https://cdn.dummyjson.com/product-images/${category}/${slug}/1.webp`;
  const legacyPieces = [
    { key: 'evening-gown', name: 'The black evening gown', category: 'Dresses', color: 'Black', occasion: 'Going out', image: photo('womens-dresses', "black-women's-gown"), edit: 'AFTER HOURS' },
    { key: 'cream-knit', name: 'The boat-neck knit', category: 'Tops', color: 'Cream', occasion: 'Work', image: 'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg', edit: 'EVERYDAY ICONS' },
    { key: 'leather-jacket', name: 'The leather-look jacket', category: 'Layers', color: 'Black', occasion: 'Casual', image: 'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg', edit: 'THE FINISHING TOUCH' },
    { key: 'pointed-heels', name: 'The pointed heel', category: 'Shoes', color: 'Black', occasion: 'Going out', image: photo('womens-shoes', 'calvin-klein-heel-shoes'), edit: 'AFTER HOURS' },
    { key: 'corset-set', name: 'The corset & skirt set', category: 'Dresses', color: 'Black', occasion: 'Going out', image: photo('womens-dresses', 'corset-with-black-skirt'), edit: 'AFTER HOURS' },
    { key: 'white-shirt', name: 'The everyday V-neck', category: 'Tops', color: 'White', occasion: 'Casual', image: 'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg', edit: 'EVERYDAY ICONS' },
    { key: 'red-shoes', name: 'The red statement shoe', category: 'Shoes', color: 'Red', occasion: 'Going out', image: photo('womens-shoes', 'red-shoes'), edit: 'A LITTLE COLOR' },
    { key: 'casual-slides', name: 'The two-tone slide', category: 'Shoes', color: 'Brown', occasion: 'Casual', image: photo('womens-shoes', 'black-&-brown-slipper'), edit: 'OFF DUTY' }
  ];
  // Product photo URLs are taken from REVOLVE product galleries, not drawn assets.
  const products = [
    ['red-tee', 'Free People X Nova tee', 'Tops', 'Red', 'Casual', 'FREE-WS5542', 'free-people-x-nova-tee-in-high-risk-red', 'Free People', 'EVERYDAY ICONS'],
    ['black-pants', 'SKIMS straight-leg pant', 'Bottoms', 'Black', 'Casual', 'SIMX-WP13', 'skims-the-essential-pants-high-waist-straight-leg-pant-in-obsidian', 'SKIMS', 'THE EVERYDAY EDIT'],
    ['khaki-blazer', 'The Rivers blazer', 'Layers', 'Khaki', 'Work', 'FAVR-WO65', 'favorite-daughter-the-rivers-blazer-in-khaki', 'Favorite Daughter', 'THE FINISHING TOUCH'],
    ['white-sneakers', 'Veja Esplar sneaker', 'Shoes', 'White', 'Casual', 'VEJA-WZ161', 'veja-esplar-sneaker-in-extra-white', 'Veja', 'OFF DUTY'],
    ['black-mini', 'Skye mini dress', 'Dresses', 'Black', 'Going out', 'SPDW-WD1742', 'superdown-skye-mini-dress-in-black', 'superdown', 'AFTER HOURS'],
    ['sage-shirt', 'Full button-down hipster shirt', 'Tops', 'Sage', 'Work', 'BLD-WS372', 'bella-dahl-full-button-down-hipster-shirt-in-safari-sage', 'Bella Dahl', 'THE OFFICE EDIT'],
    ['charcoal-trousers', 'Ponte cropped straight-leg pant', 'Bottoms', 'Charcoal', 'Work', 'RRAD-WP27', 'ripley-rader-ponte-knit-cropped-straight-leg-pant-in-charcoal', 'Ripley Rader', 'THE OFFICE EDIT'],
    ['burgundy-flats', 'Rosalind ballet flats', 'Shoes', 'Burgundy', 'Going out', 'ALOH-WZ229', 'alohas-rosalind-ballet-flats-in-onix-burgundy', 'ALOHAS', 'AFTER HOURS']
  ];
  const pieces = products.map(([key, name, category, color, occasion, code, slug, brand, edit]) => ({
    key, name, category, color, occasion, brand, edit,
    image: `https://${code === 'SPDW-WD1742' ? 'is8' : 'is4'}.revolveassets.com/images/p4/n/uv/${code}_V1.jpg`,
    alternate: `https://is4.revolveassets.com/images/p4/n/uv/${code}_V2.jpg`,
    source: `https://www.revolve.com/${slug}/dp/${code}/`
  }));
  const originalSamples = [
    ['Everyday cotton tee', 'Tops', ['Cream', 'Red'], 'red-tee'],
    ['Straight-leg denim', 'Bottoms', ['Blue', 'Black'], 'black-pants'],
    ['The oversized blazer', 'Layers', ['Sand'], 'khaki-blazer'],
    ['Weekend sneakers', 'Shoes', ['White'], 'white-sneakers'],
    ['Little black dress', 'Dresses', ['Black'], 'black-mini'],
    ['Relaxed button-down', 'Tops', ['Sage'], 'sage-shirt'],
    ['Tailored trousers', 'Bottoms', ['Charcoal'], 'charcoal-trousers'],
    ['Evening ballet flats', 'Shoes', ['Burgundy'], 'burgundy-flats']
  ];
  function migrateIllustrated(items) {
    return items.map(item => {
      if (!item.image.startsWith('data:image/svg+xml;')) return item;
      const original = originalSamples.find(([name, category, colors]) => item.name === name && item.category === category && colors.includes(item.color));
      if (!original) return item;
      const replacement = pieces.find(piece => piece.key === original[3]);
      return { ...item, name: replacement.name, color: replacement.color, image: replacement.image };
    });
  }
  const images = [...pieces.flatMap(piece => [piece.image, piece.alternate]), ...legacyPieces.map(piece => piece.image)];
  const byImage = image => pieces.find(piece => piece.image === image || piece.alternate === image);
  const api = { pieces, images, byImage, migrateIllustrated };
  root.FitCheckCatalog = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
