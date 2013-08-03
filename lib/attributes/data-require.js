module.exports = function(ui,attr) {
  var elem = this;
  var empty = this.querySelector('empty');

  if(empty) {
    empty.parentNode.removeChild(empty);
  }

  ui.data.watch(attr+'._http_status', function(status,prev) {
    if(status == 404) {
      elem.parentNode.insertBefore(empty, elem);
      elem.parentNode.removeChild(elem);
    }
    else if(prev == 404) {
      empty.parentNode.insertBefore(elem, empty);
      empty.parentNode.removeChild(empty);
    }
  });
};

