module.exports = function page(ui,attrs) {
  ui.data.synth('collection', 'parent.'+attrs.collection); 

  ui.data.get('collection', function(collection) {
    ui.data.set('page', collection.page(attrs.size));

    if(attrs.number)
      ui.data.synth('page.number', 'parent.'+attrs.number); 
  });

  ui.data.synth('info', 'page.number page.length page.total page.size',
                function(n, length, total, size) {
    if(length === total)
      return 'Showing ' + total + ' of ' + total;

    var a = (n-1)*size+1;
    var b = a+length-1;
    return 'Showing ' + a + '-' + b + ' of ' + total;
  });

  return ui;
};

