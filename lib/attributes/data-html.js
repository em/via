/**
 * Bind the innerHTML of an element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var $elem = $(this);

  ui.data.watch(value, function(v) {
    $elem.html(v);

  });
};


