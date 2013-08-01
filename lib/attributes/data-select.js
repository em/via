var ReactiveElement = require('../element');


/**
 * Bind a property to selection which can be set by clicking
 * other [data-select="invoice"]
 * TODO: Use delegation on the element associated
 *       with the data that actually changes.
 *       The path tells us the delegation root!
 */

module.exports = function(ui,attr) {

  ui.data.watch('parent.selection', function(newV, preV) {

    if( same(ui.data.get(attr), newV) ) {
      ui.data.set('selected', true);
    }
    else {
      ui.data.set('selected', false);
    }
  });

  this.addEventListener('click', function(event) {
    ui.data.set('parent.selection', ui.data.get(attr));
  });
}

function same(a,b) {
  if(a === b) return true;

  if(a && typeof a.compare === 'function') {
    return a.compare(b);
  }

  return false;
}
