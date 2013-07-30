/**
 * Bind a class name to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var $elem = $(this);

  var prevClass; 
  ui.data.watch(value, function(newV,preV) {
    var newClass = newV;

    var endOfPath = value.split('.').slice(-1)[0];
    if(newV === true) { newClass = endOfPath; }
    if(prevClass === true) { prevClass = endOfPath;}

    if(prevClass) {
      $elem.removeClass(prevClass);
    }
    if(newClass) {
      $elem.addClass(newClass);
    }

    prevClass = newClass; 
  });
};
