module.exports = ReactiveElement;

var ReactiveObject = require('./object')
  , Via = require('./via')
  , utils = require('./utils')
  , globalElements = require('./elements')
  , globalAttributes = require('./attributes');

// Only place we should be using jQuery 
// TODO: Get rid of
if(typeof jQuery !== 'undefined')
  var $ = jQuery;

/**
 * Represents a single UI instance for a model's ever changing data.
 */
function ReactiveElement(data, options) {
  options = options || {};

  var parent = options.parent || this;

  this.data = new ReactiveObject({ui:this, url: Via.window.location});
  this.children = {};

  function Elements() {}
  function Attributes() {}
  Elements.prototype = parent.elements;
  Attributes.prototype = parent.attributes;
  this.elements = new Elements();
  this.attributes = new Attributes();

  // Accept new custom elements from options
  if(options.elements) {
    this.elements.set(options.elements);
  }

  // Accept new custom elements from options
  if(options.attributes) {
    this.attributes.set(options.attributes);
  }

  // Allow string in lieu of options for a template
  if(typeof options === 'string') {
    options = {template: options};
  }
  // Handle dom elements (anything with an outerHTML) 
  else if(options && options.outerHTML) {
    options = {template: options};
  }

  // If the template is an element, take the outerHTML
  if(options.template && options.template.outerHTML) {
    options.template = options.template.outerHTML;
  }

  // Accept direct data if it has a symbolic name
  // by assigning it to an empty object with a single
  // property of that name
  if(data.symbolicName) {
    var name = data.symbolicName();
    this.data.set(name, data);
  }
  else if(typeof data === 'object') {
    this.data.set(data);
  }
  else {
    // fail
  }

  this.template = options.template;
  this.rootElement = $(this.template)[0];

  var rootTagName = this.rootElement.tagName.toLowerCase();
  var implFn = options.impl || this.elements[rootTagName];

  if(implFn) {
    var elemattrs = {};
    for(var i=0, attrs=this.rootElement.attributes,
         l=attrs.length; i < l; i++) {
      var attr = attrs.item(i);
      elemattrs[attr.nodeName] = attr.nodeValue;
    }

    if(this.rootElement.children.length) {
      this.template = this.rootElement.innerHTML;
    }
    else if(implFn.template) {
      this.template = implFn.template;
    }

    this.rootElement = $(this.template).get(0);

    var result = implFn.call(this,
                    this, elemattrs, this.template);

    if(typeof result === 'string') {
      this.rootElement = $(result).get(0);
    }
    else if(result && result.nodeName) {
      this.rootElement = result;
    }
  }

  this.build();
  return this;
};

ReactiveElement.prototype = new ReactiveObject({
  find: function(selector) {
    return $(this.rootElement).find(selector);
  }
 , build: function(options) {
    var self = this;

    var $dom = $(this.rootElement);

    $dom.data('recurly', self.data);
    $dom.data('recurly_ui', self);
    
    // TODO: More efficient approach using querySelectorAll if available
    function recurseChildren(node) {
      var tagName = node.tagName && node.tagName.toLowerCase();

      if(self.elements[tagName]) {
        var template = node.outerHTML;
        var newElem = new ReactiveElement({parent: self.data}, {template: template, parent: self});
        if(node === self.rootElement) {
          self.rootElement = newElem.rootElement;
        }
        else {
          node.parentNode.insertBefore(newElem.rootElement, node);
          node.parentNode.removeChild(node);
        }
      }
      else {
        for (var i = 0; i < node.childNodes.length; i++) {
          var child = node.childNodes[i];
          recurseChildren(child);
        }
      }
    }

    recurseChildren(this.rootElement);

    // Any data- attributes we find in the template but don't have handlers for.
    // Make them map to the equivalent non-data attribute of the same name.
    var matchedTplAttrs = $dom.html();
    matchedTplAttrs = matchedTplAttrs && matchedTplAttrs.match(/data-(\w+)[^\w]/gi) || [];
    matchedTplAttrs = utils.map(matchedTplAttrs, function(match) {
      return match.match(/-(\w+)/)[1]; } );
    utils.each(matchedTplAttrs, function(i,attrName) {
      if(!self.attributes[attrName]) {
        self.attributes[attrName] = function(ui, keypath) {
          var $elem = $(this);
          ui.data.watch(keypath, function(value) {
            $elem.attr(attrName, value);
          });
        }
      }
    });

    // This is a temporary hack for data-list
    // Run attributes that use the third template argument last
    // See issue #34
    for(var i = 3; i > 1; --i) {

      // Handle all custom attribute in template
      for(var attrName in this.attributes) {
        var impl = this.attributes[attrName];

        if(typeof impl !== 'function') continue;
        if(impl.length !== i) continue;

        function buildAttr() {
          var value = $(this).attr('data-'+attrName);
          var template = this.innerHTML;
          self.attributes[attrName].call(this, self, value, template);
          
          $(this).removeAttr('data-'+attrName);
        }

        if($dom.is('[data-'+attrName+']')) {
          buildAttr.call(this.rootElement);
        }

        $dom.find('[data-'+attrName+']').each(buildAttr);
      }
    }

    return $dom;
 }
 , elements: new ReactiveObject(globalElements)
 , attributes: new ReactiveObject(globalAttributes)
});
