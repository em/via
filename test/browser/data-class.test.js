describe('[data-class]', function() {
  it('adds a class named after the value of the property', function() {
    var ui = new Via.Element({hello:'world'}, '<div data-class="hello" class="dontmindme">empty</div>');
    expect(ui.rootElement.className).eq('dontmindme world');
  });

  it('treats boolean values as a class toggle of the property name', function() {
    var ui = new Via.Element({hello:true}, '<div data-class="hello" class="dontmindme">empty</div>');
    expect(ui.rootElement.className).eq('dontmindme hello');
    ui.data.set('hello', false);
    expect(ui.rootElement.className).eq('dontmindme');
  });

  it('only uses the last property in a path for boolean classes', function() {
    var ui = new Via.Element({classes:{hello:true}}, '<div data-class="classes.hello" class="dontmindme">empty</div>');
    expect(ui.rootElement.className).eq('dontmindme hello');
  });


});
