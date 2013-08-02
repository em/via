/**
 * Bind an input val to a synthetic attribute 
 */
module.exports = function(ui,value) {
  var elem = this;

  ui.data.watch(value, function(v) {
    $elem.val(v);
  });

  $elem.change(function() {
    console.log(ui, value, $elem.val());
    ui.data.set(value, $elem.val());
  });
};
