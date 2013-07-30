/**
 * Make the element toggle a property when clicked.
 */
module.exports = function(ui,value) {
  $(this).click(function() {
    var cur = ui.data.get(value);
    ui.data.set(value, !cur);
  });
};


