var Via = require('../lib/via'),
    expect = require('chai').expect;

describe('Via.Object', function() {
  var cat;
  beforeEach(function() {
    cat = new Via.Object({
      first_name: 'Fluffy',
      last_name: 'Brown'
    });
  });

  describe('#get', function() {
    it('gets simple direct attributes', function() {
      expect(cat.get('first_name')).eq('Fluffy');
    });

    it('accepts callback to require arguments ', function() {
      expect(cat.get('first_name')).eq('Fluffy');
    });
  });


  describe('#set', function() {
    it('accepts simple key/value arguments', function() {
      cat.set('hello', 'world');
      expect(cat.hello).eq('world');
    });

    it('accepts object and sets for each property', function() {
      cat.set({
        hello: 'world'
      , goodbye: 'cruel world'
      });
      expect(cat.hello).eq('world');
      expect(cat.goodbye).eq('cruel world');
    });

    it('accepts space separated list of keys and array of values', function() {
      cat.set('hello goodbye', ['world', 'cruel world']);
      expect(cat.hello).eq('world');
      expect(cat.goodbye).eq('cruel world');
    });
  });

  describe('#watch', function() {
    it('walks keypaths', function(done) {
      var stray = new Via.Object({best_friend: cat});

      stray.watch('best_friend.first_name', function(first_name) {
        expect(first_name).eq(cat.first_name);
        done();
      });
    });

    it('callsback immediately', function() {
      var called;
      cat.watch('first_name', function(first) {
        expect(first).eq('Fluffy');
        called = true;
      });
      expect(called).eq(true);
    });

    it('only calls if all arguments are defined', function() {
      var called = false;
      cat.watch('a b c', function() {
        called = true;
      });
      expect(called).eq(false);
      cat.set({a: 1, b:2});
      expect(called).eq(false);
      cat.set({c: 3});
      expect(called).eq(true);
    });

    it('adds only one set event per input', function() {
      var preEventCount = Object.keys(cat._events).length;
      cat.watch('cat_code first_name', function(){});
      expect(cat._events['set:cat_code'].length).eq(1);
      var postEventCount = Object.keys(cat._events).length;
      expect(postEventCount - preEventCount).eq(2);
    });

    it('cleans up events on old subpaths when high level nodes change', function() {
      var strayA = new Via.Object({name: 'Fluffy'});
      var strayB = new Via.Object({name: 'Scratch'});
      var obj = new Via.Object({friend: strayA});
      obj.watch('friend.name', function() {});
      expect(strayA._events['set:name'].length).eq(1);
      expect(strayB._events['set:name']).eq(undefined);
      obj.set('friend', strayB);
      expect(strayA._events['set:name'].length).eq(0);
      expect(strayB._events['set:name'].length).eq(1);
    });

    it('callsback on set', function(done) {
      cat.watch('cat_code', function(code) {
        expect(code).eq('test');
        done();
      });

      cat.set('cat_code', 'test');
    });

    it('constructs callback arguments from input values', function(done) {
      cat.watch('first_name last_name', function(first,last) {
        expect(first).eq('Fluffy');
        expect(last).eq('Brown');
        done();
      });
    });

    it('monitors any change on the model if no attribute specified', function(done) {
      cat.watch(function(arg) {
        expect(arg).eq(undefined);
        expect(this).eq(cat);
        done();
      });
    });

    it('interpolates strings with embedded {keypath} notation', function(done) {
      cat.watch('Hello, {first_name}', function(greeting) {
        expect(greeting).eq('Hello, Fluffy');
        done();
      });
    });

    it('requires all inputs to be defined', function() {
      var called = false;
      cat.watch('first_name something_undefined', function(a,b) {
        called = true;
      });

      expect(called).eq(false);
    });

    it('allows undefined inputs with a "?" suffix', function(done) {
      cat.watch('first_name something_undefined?', function(a,b) {
        expect(b).eq(undefined);
        done();
      });
    });

    it('forces literals with "!" suffix', function(done) {
      cat.watch('first_name 10!', function(name,num) {
        expect(name).eq('Fluffy');
        expect(num).eq('10');
        done();
      });
    });

    describe('#stop', function() {
      it('removes all events', function() {
        var obj = new Via.Object({name: 'Fluffy'});
        var mtr = obj.watch('name', function(){});
        mtr.stop();
        expect(obj._events['set:name'].length).eq(0);
      });

      it('does not propagate undefined', function(done) {
        var obj = new Via.Object({name: 'Fluffy'});
        obj.watch('name', function(name){
          expect(name).eq('Fluffy');
          done(); // Only once!
          this.stop();
        });
      });
    });
  });

  describe('#synth', function() {
    it('sets resultant attribute', function() {
      var obj = new Via.Object({first_name: 'Fluffy', last_name: 'Brown'});
      obj.synth('full_name', 'first_name last_name', function(first,last) {
        return first + ' ' + last;
      });
      expect( obj.get('full_name') ).eq('Fluffy Brown');
    });

    it('defaults to straight equality', function() {
      var obj = new Via.Object({a:1});
      obj.synth('b','a');
      expect(obj.get('b')).eq(1);
    });

    it('defaults to reverse straight equality', function() {
      var obj = new Via.Object({a:1});
      obj.synth('b','a');
      obj.set('b',2);
      expect(obj.get('a')).eq(2);
    });


    it('can handle sets', function() {
      var obj = new Via.Object({a:1});
      obj.synth('b c','a', function(c) {
        return [c+1,c+2];
      });

      expect(obj.b).eq(2);
      expect(obj.c).eq(3);
    });

    it('can handle reversed sets', function() {
      var obj = new Via.Object({a:4});
      obj.synth('a','b c', function(b,c) {
        return b+c;
      }, function(a) {
        return [a/2,a/2];
      });

      expect(obj.a).eq(4);
      expect(obj.b).eq(2);
      expect(obj.c).eq(2);
    });

  });

});


