module.exports = function(ui,attr) {
  
  this.addEventListener('click', function(e) {
    var fn = ui.data.get(attr);

    console.log(fn,attr);

    if(typeof fn === 'function') {
      fn();
    }
    else {
      // error?
    }
  });
};
