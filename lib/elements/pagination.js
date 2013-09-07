var pagination = function() {
  var self = this;

  // Default end to one full page
  this.data.set('src.end', Number(this.data.per_page));

  // Coerce per_page into a number
  this.data.synth('per_page', Number);

  // show_more function that pushes end forward by one page
  this.data.set('fn.show_more', function() {
    self.data.set('src.end', self.data.src.end + self.data.per_page);
  });


  // Showing 3 Invoices out of 100 (Show More)
  this.data.synth('info', 'src.length src.total', function(len, total) {
    return 'Showing ' + len + ' of ' + total;
  });

  this.elements.show_more = function() {
    return '<button data-onclick="parent.fn.show_more">Show More</button>';
  }


  var elem = this.rootElement;
  console.log(elem,'asdf');

  elem.addEventListener('mousewheel', scrolled);

  window.bleh = elem;

  var prevEnd;

  function scrolled(e) {

    if(self.data.src.end === prevEnd) return;


    console.log (elem.offsetHeight + elem.parentNode.scrollTop, elem.scrollHeight) ;
    if (elem.parentNode.offsetHeight + elem.parentNode.scrollTop >= elem.parentNode.scrollHeight - 20) {
      prevEnd = self.data.src.end;
      self.data.fn.show_more();
      console.log('loading more');
    }
  }
}

module.exports = pagination;
