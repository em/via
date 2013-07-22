var utils = require('../lib/utils.js'),
    expect = require('chai').expect;

describe('utils#traverse', function(){
  it('accesses simple direct properties', function() {
    var test = {a: 123};
    expect( utils.traverse(test, 'a') ).eq(123);
  });

  it('accesses deeply nested properties', function() {
    var test = {a: {b: 123}};
    expect( utils.traverse(test, 'a.b') ).eq(123);
  });

  it('returns undefined for non-existent paths', function() {
    var test = {a: {b: 123}};
    expect( utils.traverse(test, 'a.c') ).eq(undefined);
  });

  it('returns undefined when non-object nodes in path', function() {
    var test = {a: undefined};
    expect( utils.traverse(test, 'a.b') ).eq(undefined);
  });

  it('calls function for every object in path', function() {
    var test = {a: {b: 123}};
    var sequence = [
      [test, 'a', 'b.c'],
      [test.a, 'b', 'c'],
      [test.a.b, 'c', false]
    ];

    var i = 0;
    utils.traverse(test, 'a.b.c', function(obj,key,
          nearestEmitter, shortestPath, remaining) {
      expect( [obj, key, remaining] ).eql( sequence[i++] );
    });
  });

  it('passes nearest emitter and path from it', function() {
    var test = {
      a: {
        trigger: function(){},
        b: {
          c: 123
        }
      }
    };

    var sequence = [
      [test, 'a', undefined, undefined, 'b.c']
    , [test.a, 'b', test.a, 'b', 'c']
    , [test.a.b, 'c', test.a, 'b.c', false]
    ];

    var i = 0;
    utils.traverse(test, 'a.b.c', function(deepObj, deepAttr,
                nearestEmitter, shortestPath, remaining) {
      expect( arguments ).eql( sequence[i++] );
    });
  });

  it('stops traversal and returns current value if callback returns false', function() {
    var test = {a: {b: 123}};

    var count = 0;
    var result = utils.traverse(test, 'a.b', function() {
      expect(count).eq(0);
      count++;
      return false;
    });

    expect(result).eq(test);
  });
});

