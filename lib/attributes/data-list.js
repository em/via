var ReactiveElement = require('../element')
  , utils = require('../utils');

/**
 * Bind a collection to a repeating block scoped per item
 */
module.exports = function(ui,value,template) {
  var target = this;
  target.innerHTML = '';

  ui.data.watch(value, function(collection) {
    if(!collection) return;

    // Remove any element beyond the collection length
    collection.watch('length',function(length) {
      for(var i=length, l = target.children.length-1; l >= i; --l) { 
        target.removeChild(target.children[l]);
      }
    });

    // Update or append as any numeric index changes
    collection.watch(/\d+/,function(i,item,prev) {
      if(item === undefined) return;

      var oldElem = target.children[i];

      if(item) {
        var itemui = new ReactiveElement(item, template);
        itemui.data.set('parent', ui.data);

        if(oldElem) {
          target.insertBefore(itemui.rootElement, oldElem);
          target.removeChild(oldElem);
        }
        else {
          target.appendChild(itemui.rootElement);
        }
      }
    });

  })
};


