describe('CollectionPage', function(){
  // Make a fake API for storing cat trivia
  var assert = require('chai').assert,
      expect = require('chai').expect,
      Collection = require('../lib/collection'),
      Cat = require('./support/cat.model'),
      catsAPI = require('./support/cats.api'),
      cats = new Collection(Cat, 'cats/', {}, catsAPI);

  it('starts with 0 length', function() {
    var page = cats.page(3);
    expect(page.length).eq(0);
  });

  it('tracks loading states correctly', function(done) {
    var page = cats.page(3);
    expect(!!page.__loading__).eq(true);
    expect(!!page.__loaded__).eq(false);
    page.load(function() {
      expect(!!page.__loading__).eq(false);
      expect(!!page.__loaded__).eq(true);
      done();
    });
    expect(!!page.__loading__).eq(true);
    expect(!!page.__loaded__).eq(false);
  });

  describe('#load', function() {
    it('gets first page of records', function(done) {
      var page = cats.page(3);
      page.load(function() {
        expect(page.length).eq(3);
        expect(page[0].name === 'Fluffy');
        done();
      });
    });
  });

});
