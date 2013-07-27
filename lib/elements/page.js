module.exports = function page(ui,attrs) {

  this.data.synth('page', 'collection size', function(c,size) {
    var page = c.page(size);

    ui.data.synth('page.size', 'size');
    ui.data.synth('page.number', 'number');

    return page;
  });

  this.data.synth('info', 'page.number page.length page.total page.size',
                function(n, length, total, size) {
    if(length === total)
      return 'Showing ' + total + ' of ' + total;

    var a = (n-1)*size+1;
    var b = a+length-1;
    return 'Showing ' + a + '-' + b + ' of ' + total;
  });
};

