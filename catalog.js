/* A small, fixed photographic sample collection. These are examples, not purchases. */
(function (root) {
  const photo = (category, slug) => `https://cdn.dummyjson.com/product-images/${category}/${slug}/1.webp`;
  const pieces = [
    { key: 'evening-gown', name: 'The black evening gown', category: 'Dresses', color: 'Black', occasion: 'Going out', image: photo('womens-dresses', "black-women's-gown"), edit: 'AFTER HOURS' },
    { key: 'cream-knit', name: 'The boat-neck knit', category: 'Tops', color: 'Cream', occasion: 'Work', image: 'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg', edit: 'EVERYDAY ICONS' },
    { key: 'leather-jacket', name: 'The leather-look jacket', category: 'Layers', color: 'Black', occasion: 'Casual', image: 'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg', edit: 'THE FINISHING TOUCH' },
    { key: 'pointed-heels', name: 'The pointed heel', category: 'Shoes', color: 'Black', occasion: 'Going out', image: photo('womens-shoes', 'calvin-klein-heel-shoes'), edit: 'AFTER HOURS' },
    { key: 'corset-set', name: 'The corset & skirt set', category: 'Dresses', color: 'Black', occasion: 'Going out', image: photo('womens-dresses', 'corset-with-black-skirt'), edit: 'AFTER HOURS' },
    { key: 'white-shirt', name: 'The everyday V-neck', category: 'Tops', color: 'White', occasion: 'Casual', image: 'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg', edit: 'EVERYDAY ICONS' },
    { key: 'red-shoes', name: 'The red statement shoe', category: 'Shoes', color: 'Red', occasion: 'Going out', image: photo('womens-shoes', 'red-shoes'), edit: 'A LITTLE COLOR' },
    { key: 'casual-slides', name: 'The two-tone slide', category: 'Shoes', color: 'Brown', occasion: 'Casual', image: photo('womens-shoes', 'black-&-brown-slipper'), edit: 'OFF DUTY' }
  ];
  const api = { pieces, images: pieces.map(piece => piece.image) };
  root.FitCheckCatalog = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
