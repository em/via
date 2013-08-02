/**
 * Make the element toggle a property when clicked.
 */
module.exports = function(ui,attr) {
  this.addEventListener('click', function() {
    var cur = ui.data.get(attr);
    ui.data.set(attr, !cur);
  });
};

