describe('[data-list]', function() {
  // TODO: You should be able to use top level primitives 
  // without wrapping them up in objects like this.
  var numbers = new Via.Array([{i:1},{i:2},{i:3}]);

  it('creates elements for each item', function() {
    var template = '<ul data-list="numbers"><li data-text="i"></li></ul>';
    var ui = new Via.Element({numbers: numbers}, template);

    var html = '<ul><li>1</li><li>2</li><li>3</li></ul>';
    expect(ui.rootElement.outerHTML).eq(html);
  });
});
