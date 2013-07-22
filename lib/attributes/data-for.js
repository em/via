module.exports = function(ui,value) {
  var $root = $(this);
  var $empty = $root.find('empty').remove().last().children().first();

  ui.data.watch(value+'._http_status', function(status,prev) {
    if(status == 404) {
      $root.replaceWith($empty);
    }
    else if(prev == 404) {
      $empty.replaceWith($root);
    }
  });

};
