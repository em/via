/**
 * Bind a class name to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var $elem = $(this);

  var prevClass; 
  ui.data.watch(value, function(v) {
    if(prevClass) {
      $elem.removeClass(prevClass);
    }
    $elem.addClass(v);
    prevClass = v; 
  });
};
