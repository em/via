describe('Via.URI', function() {
  var Via = require('../lib/via'),
      expect = require('chai').expect;

  var uri;
  beforeEach(function() {
    uri = new Via.URI({});
  });

  it('host via hostname and port', function() {
    uri.set({
      hostname: 'example.net'
    , port: '8080'
    });
    expect(uri.host).eq('example.net:8080');
  });

  it('hostname and port via host', function() {
    uri.set('host', 'example.net:8080');
    expect(uri.hostname).eq('example.net');
    expect(uri.port).eq('8080');
  });

  it('query via search', function() {
    uri.set('search', '?a=1#fragment');
    expect(uri.query).eq('a=1');
  });

  it('search via query', function() {
    uri.set('query', 'a=1');
    expect(uri.search).eq('?a=1');
  });

  it('query via params', function() {
    uri.set('params', {a:1,b:2});
    expect(uri.query).eq('a=1&b=2');
  });

  it('params via query', function() {
    uri.set('query', 'a=1&b=2');
    expect(uri.params).eql({a:'1',b:'2'});
  });
});
