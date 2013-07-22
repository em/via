describe('Via.Element', function() {
  it('accepts dom element as template using its innerHTML', function() {
    var elem = document.createElement('test');
    var ui = new Via.Element({}, elem);
    expect(ui.rootElement.outerHTML).eq('<test></test>');
  });

  it('TODO: uses default template for the data', function() {
    // var data = {
    //   symbolicName: function() {
    //     return 'test';
    //   }
    // };

    // var ui = new Via.Element({}, elem);
    // expect(ui.rootElement.innerHTML).eq('<test></test>');
  });

  it('accepts template as second argument', function() {
    var template = '<a><b></b></a>';
    var ui = new Via.Element({}, template);
    expect(ui.rootElement.outerHTML).eq(template);
  });

  it('can handle descendent custom elements', function() {
    var template = '<div><custom></custom></div>';
    var custom = function() {
      return '<div class="custom"></div>';
    };
    var ui = new Via.Element({}, {elements: {custom: custom}, template: template});
    expect(ui.rootElement.outerHTML).eq('<div><div class="custom"></div></div>');
  });

  it('can handle custom attrs on root element', function() {
    var template = '<div data-text="test"></div>';
    var ui = new Via.Element({test:123}, template);
    expect(ui.rootElement.outerHTML).eq('<div>123</div>');
  });

  it('can handle custom element as root', function() {
    var template = '<custom anattrtoo="123"></custom>';
    var custom = function(ui, data) {
      return '<div class="custom"></div>';
    };
    var ui = new Via.Element({}, {elements: {custom: custom}, template: template});
    expect(ui.rootElement.outerHTML).eq('<div class="custom"></div>');

  });
});
