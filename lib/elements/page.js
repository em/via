module.exports = function page() {

  this.data.synth('page', 'src');
  this.data.synth('page.size', 'size');
  this.data.synth('page.number', 'number');
  this.data.set('page.number', this.data.page.number || 1);

  this.data.synth('page.length', 'page.number page.size page.total',
                  function(n,s,t) {
    if(n * s >= t) {
      return t - n * s;
    }
    return s;
  });

  this.data.synth('info', 'page.total page.size page.number',
                function(total, size, n) {
    if(total <= size)
      return 'Showing ' + total + ' of ' + total;

    var a = (n-1)*size+1;
    var b = Math.min(n*size, total);

    return 'Showing ' + a + '-' + b + ' of ' + total;
  });
};

