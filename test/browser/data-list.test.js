describe('[data-list]', function() {
  var cats = new Via.Collection(Cat, 'cats/', {}, catsAPI);
  var list;
  beforeEach(function() {
    list = cats.page(3);
  });

  it('creates elements for each item', function() {
    var template = '<ul data-list="cats"><li data-text="cat.name"></li></ul>';
    var ui = new Via.Element(list, template);

    list.load(function() {
      var html = '<ul><li>Fluffy</li><li>Scratch</li><li>Leonard</li></ul>';
      expect(ui.rootElement.outerHTML).eq(html);
    });
  });
});
