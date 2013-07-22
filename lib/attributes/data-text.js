/**
 * Bind the innerText of a single element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var $elem = $(this);
  $elem.click(function() {
    console.log(ui);
  });

  ui.data.watch(value, function(v,p) {
    if(v === null) v = '';
    $elem.text(''+v);
    $elem.html($elem.html().replace(/\n/g,'<br/>'));
  });
};


