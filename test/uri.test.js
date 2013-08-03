describe('Via.URI', function() {
  var Via = require('../lib/via'),
      expect = require('chai').expect;

  var uri;
  beforeEach(function() {
    uri = new Via.URI({});
  });

  // it('parses authority', function() {
  //   uri.set('authority', '//user:pass@example.net');
  //   expect(uri.host).eq('example.net');
  //   console.log(uri);
  //   expect(uri.credentials).eq('user:pass');
  //   uri.set('authority', '//apikey@example.net');
  //   expect(uri.credentials).eq('apikey');
  //   uri.set('authority', 'missingslashes.net');
  //   expect(uri.host).eq('missingslashes.net');
  //   expect(uri.authority).eq('//missingslashes.net');
  // });

  // it('builds authority', function() {
  //   uri.set({
  //     credentials: 'user:pass'
  //   , host: 'example.net'
  //   });

  //   expect(uri.authority).eq('//user:pass@example.net');
  // });


  // it('host via hostname and port', function() {
  //   uri.set({
  //     hostname: 'example.net'
  //   , port: '8080'
  //   });
  //   expect(uri.host).eq('example.net:8080');
  // });

  // it('host via hostname with no port', function() {
  //   uri.set({
  //     hostname: 'example.net'
  //   });
  //   expect(uri.host).eq('example.net');
  // });
// 
//   it('hostname and port via host', function() {
//     uri.set('host', 'example.net:8080');
//     expect(uri.hostname).eq('example.net');
//     expect(uri.port).eq('8080');
//   });

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

  it('parses href', function() {
    uri.set('href', 'http://user:pass@example.net:8080/oh/hi.txt?q=there#lol');
    expect(uri.scheme).eq('http');
    expect(uri.authority).eq('user:pass@example.net:8080');
    expect(uri.path).eq('/oh/hi.txt');
    expect(uri.query).eq('q=there');
    expect(uri.search).eq('?q=there');
    expect(uri.fragment).eq('lol');
  });

  it('builds href', function() {
    uri.set({
      scheme: 'http'
    , authority: 'user:pass@example.net:8080'
    , path: '/oh/hi.txt'
    , query: 'q=there'
    , fragment: 'lol'
    });
    expect(uri.href).eq('http://user:pass@example.net:8080/oh/hi.txt?q=there#lol');
  });
});
