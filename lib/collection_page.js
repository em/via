module.exports = CollectionPage;

var Model = require('./model');

function CollectionPage(collection, size, number) {
  this.collection = collection;

  this.set({
    size: size || 50,
    number: number || 1,
    length: 0
  });


  // TODO: When this is a "watch"
  // the page loads when it's instantiated
  // which it should not...
  // This is just due to watch logic, not
  // the reload() below
  this.watch('number', function(num,prev) {
    if(!num) {
      this.root.set('number',1);
      return;
    }

    if(prev)
      this.root.reload();
  });

  this.synth('total', 'collection.total');
}

CollectionPage.prototype = [];

Model.mixin(CollectionPage, {
  query: function(params, callback) {
    params.per_page = this.get('size');
    params.page = this.get('number');

    var self = this;
    this.collection.query(params, function(err,res) {
      self.handleResponse(err, res, callback);
    });
  }
, handleResult: function(data,meta) {
    if(meta) {
      this.set('total', parseInt(meta.count));
    }

    for(var i=0, l=data.length; i < l; ++i) {
      this.collection._forced.__loaded__ = true;
      var item = new this.collection.model(this.collection._forced, this._api);
      item.handleResult(data[i]);
      this.set(i, item);
    }

    for(var i=data.length, l=this.length; i < l; ++i) {
      this.set(i, undefined);
    }

    this.set('length', data.length);
    this.trigger('loaded',data,meta);
  }
, symbolicName: function() {
    return this.collection.symbolicName();
  }
});
