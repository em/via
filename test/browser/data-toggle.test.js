describe('[data-toggle]', function() {
  it('toggles a boolean property when clicked', function() {
    var ui = new Via.Element({}, '<div data-toggle="bool">empty</div>');
    click(ui.rootElement);
    expect(ui.data.bool).eq(true);
    click(ui.rootElement);
    expect(ui.data.bool).eq(false);
  });
});

function click(el){
  var ev = document.createEvent("MouseEvent");
  ev.initMouseEvent(
    "click",
    true /* bubble */, true /* cancelable */,
    window, null,
    0, 0, 0, 0, /* coordinates */
    false, false, false, false, /* modifier keys */
    0 /*left*/, null
  );
  el.dispatchEvent(ev);
}
