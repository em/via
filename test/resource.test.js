describe('Via.Resource', function() {
  var Via = require('../lib/via'),
      expect = require('chai').expect,
      FakeResource =  require('./support/fake.resource');

  beforeEach(function() { 
  });

  var mock = {
    'get http://example.net/greeting.json': {
      hello: 'world'
    }
  };

  it('binds url and location.href', function() {
    var url = 'http://example.net/greeting.json';
    var r = new FakeResource({
      url: url 
    });
    expect(url).eq(r.url).eq(r.location.href);
  });

  it('loads', function(done) {
    var r = new FakeResource({
      url: 'http://example.net/greeting.json' 
    }, mock);

    r.load(function() {
      expect(r.response.hello).eq('world');
      done();
    });
  });

  it('can autoload when params changes', function(done) {
    var stub = {
      'get http://example.net/greeting.json': {
        hello:'world'
      }
    , 'get http://example.net/greeting.json?message=dude': {
        hello:'dude'
      }
    }; 

    var resource = new FakeResource({
      url: 'http://example.net/greeting.json' 
    }, stub);

    resource.load();

    var count = 0;
    resource.watch('response.hello', function(hello) {
      count++;

      if(count === 1) {
        expect(hello).eq('world');
      }
      if(count === 2) {
        expect(hello).eq('dude');
        done();
      }
    });

    resource.set('location.params.message', 'dude');
  });

  it('default post does http post', function() {
  });

  it('default get does http get', function() {
  });

});
