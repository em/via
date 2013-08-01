var ReactiveElement = require('../element');

/**
 * Bind a collection to a repeating block scoped per item
 */
module.exports = function(ui,value,template) {
  var target = $(this).empty();

  ui.data.watch(value, function(collection) {
    if(!collection) return;

    // Remove any element beyond the collection length
    collection.watch('length',function(length) {
      var $list = $(target);
      var $children = $list.children();
      $children.each(function(i) {
        if(i >= length) { 
          $(this).remove();
        }
      });
    });

    // Update or append as any numeric index changes
    collection.watch(/\d+/,function(i,item,prev) {
      if(item === undefined) return;

      var $list = $(target);
      var $children = $list.children();
      var oldElem = $children.get(i);

      if(item) {
        var itemui = new ReactiveElement(item, template);
        itemui.data.set('parent', ui.data);
        var $e = $(itemui.rootElement);

        window.dbinv = itemui;

        if(oldElem) {
          $(oldElem).replaceWith($e);
        }
        else {
          $e.appendTo(target);
        }
      }
    });

  })
};


