describe('Via.Window', function() {
  var Via = require('../lib/via'),
      expect = require('chai').expect;

  var rwin;
  beforeEach(function() {
    var fakeWindow = {
      location: {
        href: 'http://example.net/path?hello=world'
      } 
    , addEventListener: function() {}
    };
    rwin = new Via.Window(fakeWindow);
  });

  it('gets url from location', function() {
    expect(rwin.location.href).eq(rwin.actual.location.href);
  });

  it('treats initial params as defaults', function() {
  });

  it('does a pushState when query params change', function() {
  });
});
