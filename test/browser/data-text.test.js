describe('[data-text]', function() {
  it('initializes', function() {
    var ui = new Via.Element({test:123}, '<div data-text="test">empty</div>');
    expect(ui.rootElement.innerText).eq('123');
  });

  it('updates', function() {
    var ui = new Via.Element({}, '<div data-text="test">empty</div>');
    ui.data.set('test', 123);
    expect(ui.rootElement.innerText).eq('123');
  });

  it('uses empty string for null', function() {
    var ui = new Via.Element({test:null}, '<div data-text="test">empty</div>');
    expect(ui.rootElement.innerText).eq('');
  });
});
