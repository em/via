/**
 * Bind the innerText of a single element to a synthetic attribute
 */
module.exports = function(ui,value) {
  var elem = this;

  elem.addEventListener('click', function() {
    console.log(ui);
  });

  ui.data.watch(value, function(v,p) {
    if(v === null) v = '';
    elem.innerText = ''+v;
    elem.innerHTML = elem.innerHTML.replace(/\n/g,'<br/>');
  });
};


