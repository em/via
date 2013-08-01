/**
 * Bind the innerHTML of an element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var $elem = $(this);

  ui.data.watch(value, function(v) {
    if(v.then) {
      v.then(function(html) {
        $elem.html(html);
      });
    }
    else {
      $elem.html(v);
    }

  });
};


