/* Original, unbranded photographic demo assets. Never mixed into the personal wardrobe. */
(function(root){
  const fitting=root.FitCheckTryOn || (typeof require==='function'?require('./tryon-core.js'):null);
  const items=[
    ['demo-top','Cherry cotton tee','Tops','Red','Casual','red-top'],
    ['demo-pants','Black straight-leg trousers','Bottoms','Black','Casual','black-pants'],
    ['demo-blazer','Ivory tailored blazer','Layers','Ivory','Work','cream-blazer'],
    ['demo-dress','Black satin midi dress','Dresses','Black','Going out','black-dress'],
    ['demo-shoes','White leather sneakers','Shoes','White','Casual','white-sneakers']
  ].map(([id,name,category,color,occasion,file])=>({id,name,category,color,occasion,image:`assets/demo/${file}.png`,origin:'demo',availability:'ready',wears:[]}));
  const crops={"demo-dress":[[0.27441,0.01432],[0.72461,0.01432],[0.72461,0.98503],[0.27441,0.98503]],"demo-pants":[[0.25098,0.0306],[0.74707,0.0306],[0.74707,0.97852],[0.25098,0.97852]],"demo-blazer":[[0.01208,0.01178],[0.98792,0.01178],[0.98792,0.9838],[0.01208,0.9838]],"demo-top":[[0.07577,0.02445],[0.92673,0.02445],[0.92673,0.98549],[0.07577,0.98549]],"demo-shoes":[[0.05859,0.04785],[0.94141,0.04785],[0.94141,0.96289],[0.05859,0.96289]]};
  function wardrobe(){return items.map(item=>({...item,wears:[],fitting:{...fitting.defaults(item),points:crops[item.id] || [[0,0],[1,0],[1,1],[0,1]]}}));}
  const api={items,images:items.map(item=>item.image),wardrobe,initialSelection:['demo-top','demo-pants','demo-shoes']};
  root.FitCheckDemo=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
