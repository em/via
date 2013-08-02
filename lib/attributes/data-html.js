/**
 * Bind the innerHTML of an element to a synthetic attribute
 */
module.exports = function(ui,attr) {
  var elem = this;

  ui.data.watch(attr, function(value) {
    if(value.then) {
      value.then(function(html) {
        elem.innerHTML = html;
      });
    }
    else {
      elem.innerHTML = value;
    }

  });
};


