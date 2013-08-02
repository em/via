/**
 * Bind a class name to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var elem = this;

  var staticClass = elem.className;
  ui.data.watch(value, function(newV,preV) {
    var newClass = newV;

    var endOfPath = value.split('.').slice(-1)[0];
    if(newV === true) { newClass = endOfPath; }
    if(!newV) { newClass = '';}

    elem.className = [staticClass,newClass].join(' ').trim();
  });
};
