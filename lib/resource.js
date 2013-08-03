module.exports = ReactiveResource;

var ReactiveObject = require('./object')
  , ReactiveURI = require('./uri')
  , utils = require('./utils');


function ReactiveResource(init) {
  this.set(init);
  this.location = new ReactiveURI(this.location);
  this.synth('url', 'location.href');

  // this.watch('autoload url', function(autoload, url) {
  //   if(autoload) this.root.reload();
  // });

  this.watch('autosave data', function(autosave, data) {
    if(autosave) this.root.save();
  });

  this.synth('id', 'location.file');
}

ReactiveResource.prototype = new ReactiveObject({
  save: function(callback) {
    this.set('invalid', true);

    if(this.url) {
      var body = this.format.stringify(res);
      this.request('put', body, function(err, res) {
        this.set('response', this.format.parse(res));
      });
    }
    else if(this.parent) {
      var body = this.format.stringify(res);
      this.request('post', body, function(err, res) {
        this.set('response', this.format.parse(res));
      });
    }

  }
, load: function(callback) {
    if(this.__loaded__) return;
    this.__loaded__ = true;

    var self = this;
    this.watch('url', function(url) {
      self.request('get', url, null, function(err, res) {
        self.set('response', res);
        callback && callback(err, res);
      });
    });
  }
, reload: function() {
    this.set('outdated', true);
  }
, request: function(method, url, data, callback) {
    // var request = require('request');
    // api.request(method, url, data, callback);
  }
, format: JSON
});
