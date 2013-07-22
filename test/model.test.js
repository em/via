describe('Model', function() {
  var assert = require('chai').assert,
      expect = require('chai').expect,
      catsAPI = require('./support/cats.api'),
      Cat = require('./support/cat.model');

  describe('#mixin', function(){
    // TODO
  });

  describe('#build', function(){
    var cat = new Cat();
    it('passes existing instance straight through', function(){
      expect( Cat.build(cat) ).eq(cat);
    });

    it('makes a fresh instance from raw params', function(){
      var freshCat = Cat.build({hello: 'mrow'});
      expect(freshCat instanceof Cat).eq(true);
      expect(freshCat.get('hello')).eq('mrow');
    });
  });

  describe('#isNew', function(){
    var cat = new Cat();
    it('returns true if not loaded', function(){
      assert.equal(cat.isNew(), true);
    });
  });

  describe('#load', function(){
    it('initializes', function(done){
      var cat = new Cat({id:1}, catsAPI);
      cat.load(function() {
        assert(cat.name, 'Fluffy');
        done();
      });
    });

    it('completes immediately if already loaded', function(done){
      var cat = new Cat({id:1}, catsAPI);
      cat.load(function() {
        // Make sure second load
        // doesn't call request
        cat._api = {request: function() {
          assert.fail()
        }};
        cat.load(done);
      });
    });

    it('piggybacks off pending request if already loading', function(done){
      var cat = new Cat({id:1}, catsAPI);
      cat.load();
      assert.equal(cat.__loading__, true);
      // This should not be called again
      // because the next load piggy backs
      // off the pending one
      cat._api = {request: function() {
        assert.fail()
      }};
      cat.load(done);
    });

    // it('returns false if not loaded', function(){
    //   var model = new recurly.Model();
    //   assert.equal(cat.isNew(), true);
    // });
  });

  describe('#save', function(){

    context('with normal association', function() {
      var cat;
      beforeEach(function() {
        cat = new Cat({best_friend:{id:2}}, catsAPI)
        cat._hasOne('best_friend', Cat);
      });

      it('doesn\'t reload as nested', function(done) {
        cat.best_friend.on('reloaded', function() {
          assert.fail();
        });
        cat.save(done);
      });
    });

    context('with nested association', function() {
      var cat;
      beforeEach(function() {
        cat = new Cat({best_friend:{id:2}}, catsAPI)
        cat._hasOne('best_friend', Cat, true);
      });

      it('fakes load of nested record', function(done) {
        cat.best_friend.on('loaded', function() {
          done();
        });
        cat.save();
      });

      it('saves nested record', function(done) {
        cat.best_friend.on('saved', function() {
          done();
        });
        cat.save();
      });

    });

    context('new record', function() {
      var cat;
      beforeEach(function() {
        cat = new Cat({}, catsAPI)
      });

      it('creates it', function(done) {
        cat.save(function(err,res) {
          assert.equal(cat.was, 'created');
          assert.equal(cat.id, 2);
          done(err);
        });
      });

      it('triggers "saved" event', function(done) {
        cat.on('saved', function() {
          done();
        });
        cat.save();
      });

      it('triggers "created" event', function(done) {
        cat.on('created', function() {
          done();
        });
        cat.save();
      });
    });

    context('existing record', function() {
      var cat;
      beforeEach(function() {
        cat = new Cat({id:1}, catsAPI)
      });
 
      it('updates it', function(done) {
        cat.id = 1;
        cat.load(function() {
          cat.save(function(err,res) {
            assert.equal(cat.was, 'updated');
            assert.equal(cat.id, 1);
            done(err);
          });
        });
      });

      it('triggers "saved" event', function(done) {
        cat.on('saved', function() {
          done();
        });
        cat.save();
      });

      it('triggers "updated" event', function(done) {
        cat.on('updated', function() {
          done();
        });
        cat.save();
      });

      it('triggers "loaded" event', function(done) {
        cat.on('loaded', function() {
          done();
        });
        cat.save();
      });
    });

  });
})
