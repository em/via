module.exports = ReactiveURI;

var ReactiveObject = require('./object'),
    utils = require('./utils');

function ReactiveURI(init) {
  this.set(init);

  this.synth('host', 'hostname port', function(h,p) {
    return h && p && [h,p].join(':');
  });

  this.synth('hostname', 'host', function(host) {
    return host && host.split(':')[0]
  });

  this.synth('port', 'host', function(host) {
    return host && host.split(':')[1]
  });

  this.synth('query', 'search', function(search, prev) {
    var match = (''+search).match(/\?(.+?)(?:#|$)/);
    return match && match[1] || '';
  });

  this.synth('search', 'query', function(query) {
    if(!query) return '';
    return '?'+query;
  });

  this.synth('query', 'params', function(params) {
    var str = [];
    for(var p in params) {
      if(params[p] !== undefined) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
      }
    }
    return str.join("&");
  });

  this.synth('params', 'query', function(query) {
    if(!query) return {};

    query = query.replace('+',' ');

    var params = {}, tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(query)) {
      params[decodeURIComponent(tokens[1])]
      = decodeURIComponent(tokens[2]);
    }

    return params;
  });

}

ReactiveURI.prototype = new ReactiveObject();
