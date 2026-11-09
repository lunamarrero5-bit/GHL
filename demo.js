/* Styling examples stay in the demo wardrobe, separate from personal uploads. */
(function(root){
  const fitting=root.FitCheckTryOn || (typeof require==='function'?require('./tryon-core.js'):null);
  const items=[
    ['demo-top','Cherry cotton tee','Tops','Red','Casual','red-top'],
    ['demo-pants','Black straight-leg trousers','Bottoms','Black','Casual','black-pants'],
    ['demo-blazer','Ivory tailored blazer','Layers','Ivory','Work','cream-blazer'],
    ['demo-dress','Black satin midi dress','Dresses','Black','Going out','black-dress'],
    ['demo-shoes','White leather sneakers','Shoes','White','Casual','white-sneakers']
  ].map(([id,name,category,color,occasion,file])=>({id,name,category,color,occasion,image:`assets/demo/${file}.png`,origin:'demo',availability:'ready',wears:[]}));
  const sources={};
  const references=[
    ['AGOL-WJ496','AGOLDE Harper straight jeans','Bottoms','Light blue','Casual','agolde-harper-mid-rise-relaxed-straight-jeans-in-flash','png',true],
    ['PSTL-WJ259','PISTOLA Lexi straight jeans','Bottoms','Indigo','Casual','pistola-lexi-mid-rise-relaxed-straight-jeans-in-artisan','png',true],
    ['CITI-WS83','Citizens of Humanity Kayla shirt','Tops','White','Work','citizens-of-humanity-kayla-shirt-in-optic-white','png',true],
    ['CITI-WS142','Citizens of Humanity Kayla shirt','Tops','Black','Work','citizens-of-humanity-kayla-shirt-in-black','png',true],
    ['LOVF-WD4338','Lovers and Friends Defarge dress','Dresses','Black','Going out','lovers-and-friends-defarge-dress-in-black','png',true],
    ['LOVF-WD5280','Lovers and Friends Mona fringe dress','Dresses','Wine','Going out','lovers-and-friends-mona-satin-fringe-midi-dress-in-wine-jacquard','png',true],
    ['VEJA-WZ316','Veja Campo Bold sneakers','Shoes','Cream','Casual','veja-campo-bold-sneaker-in-pierre-almond-eagle','jpg',false],
    ['ATRY-WZ64','Autry Windspin Low sneakers','Shoes','Silver & Sand','Casual','autry-windspin-low-sneaker-in-silver-sand','jpg',false],
    ['TONR-WZ207','Tony Bianco Caprice heels','Shoes','Black','Going out','tony-bianco-caprice-heel-in-black','jpg',false]
  ];
  for(const [code,name,category,color,occasion,slug,extension,edited] of references){
    const id=`demo-revolve-${code.toLowerCase()}`;
    items.push({id,name,category,color,occasion,image:`assets/demo/revolve/${code}.${extension}`,origin:'demo',availability:'ready',wears:[]});
    sources[id]={code,url:`https://www.revolve.com/${slug}/dp/${code}/`,edited};
  }
  const crops={"demo-dress":[[0.27441,0.01432],[0.72461,0.01432],[0.72461,0.98503],[0.27441,0.98503]],"demo-pants":[[0.25098,0.0306],[0.74707,0.0306],[0.74707,0.97852],[0.25098,0.97852]],"demo-blazer":[[0.01208,0.01178],[0.98792,0.01178],[0.98792,0.9838],[0.01208,0.9838]],"demo-top":[[0.07577,0.02445],[0.92673,0.02445],[0.92673,0.98549],[0.07577,0.98549]],"demo-shoes":[[0.05859,0.04785],[0.94141,0.04785],[0.94141,0.96289],[0.05859,0.96289]]};
  function wardrobe(){return items.map(item=>({...item,wears:[],fitting:{...fitting.defaults(item),points:crops[item.id] || [[0,0],[1,0],[1,1],[0,1]]}}));}
  function addExamples(existing){const ids=new Set(existing.map(item=>item.id));return [...existing,...wardrobe().filter(item=>sources[item.id]&&!ids.has(item.id))];}
  const api={items,images:items.map(item=>item.image),wardrobe,sources,addExamples,initialSelection:['demo-top','demo-pants','demo-shoes']};
  root.FitCheckDemo=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
