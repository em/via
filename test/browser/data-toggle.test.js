describe('[data-toggle]', function() {
  it('toggles a boolean property when clicked', function() {
    var ui = new Via.Element({}, '<div data-toggle="bool">empty</div>');
    $(ui.rootElement).click();
    expect(ui.data.bool).eq(true);
    $(ui.rootElement).click();
    expect(ui.data.bool).eq(false);
  });
});
