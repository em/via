describe('Via.Element', function() {
  it('accepts dom element as template using its innerHTML', function() {
    var elem = document.createElement('test');
    var ui = new Via.Element({}, elem);
    expect(ui.rootElement.outerHTML).eq('<test></test>');
  });

  it('uses default template defined on custom element', function() {
     var custom = function() {};
     custom.template = '<div class="custom"></div>';
     var template = '<custom></custom>';
     var ui = new Via.Element({}, {elements: {custom: custom}, template: template});
    expect(ui.rootElement.outerHTML).eq(custom.template);
  });

  it('can be replaced directly with another custom element', function() {
    var a = function() {};
    a.template = '<div class="a"></div>';
    var b = function() {};
    b.template = '<div class="b"></div>';


    var template = '<a><b></b></a>';
    var ui = new Via.Element({}, {elements: {a:a,b:b}, template: template});
    expect(ui.rootElement.outerHTML).eq(b.template);
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

  it('synthesizes element data from attributes', function() {
    var template = '<custom a="path" b="literal"></custom>';
    var custom = function(ui, data) {
      return '<div class="custom"></div>';
    };
    var ui = new Via.Element({parent:{path: 'value'}}, {elements: {custom: custom}, template: template});
    expect(ui.data.a).eq('value');
    expect(ui.data.b).eq('literal');
  });

});
