module.exports = ReactiveURI;

var ReactiveObject = require('./object'),
    utils = require('./utils');

// RFC 3986 Appendix B
var regex = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
//     scheme    = $2
//     authority = $4
//     path      = $5
//     query     = $7
//     fragment  = $9

function ReactiveURI(init) {
  if(typeof init === "string") init = {href: init};

  this.set(init);

  this.synth('href', 'scheme authority path query? fragment?',
  function(scheme, authority, path, query, fragment) {
    // RFC 3986 Section 5.3
    var result = '';

    if(scheme)
      result += scheme + ':';
    if(authority)
      result += '//' + authority;
    result += path;
    if(query)
      result += '?' + query;
    if(fragment)
      result += '#' + fragment;

    return result;
  });

  this.synth('scheme authority path query fragment', 'href',
  function(href) {
    var m = regex.exec(href);
    return [m[2], m[4], m[5], m[7], m[9]];
  });

  this.synth('path', 'dir file ext?', function(dir, file, ext) {
    return [dir, file].join('') + (ext ? '.' + ext : '');
  });

  this.synth('dir file ext', 'path', function(path) {
    var parts = path.split('/');
    var file = parts[parts.length-1];
    if(file) {
      parts.pop();
      parts.push('');
      return [parts.join('/')].push( file.split('.').slice(-1) );
    }

    return [parts.join('/')];
  });

  this.synth('authority', 'credentials host', function(c,h) {
    c = c && (c + '@') || '';
    return c + h;
  });

  this.synth('credentials host', 'authority', function(auth) {
    var match = auth.match(/(?:(.+?)@)?(.*)/);
    return match && match.slice(1);
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

ReactiveURI.prototype = new ReactiveObject({
  rel: function(path) {
    var result = new ReactiveURI({source:this});
    this.watch('href', function(href) {
      result.set('href', href);
    });
    result.synth('path', 'source.path', function(base) {
      return absolute(base, path);
    });
    return result;
  }
});

function absolute(base, relative) {
  var stack = base.split("/"),
      parts = relative.split("/");
  stack.pop(); // remove current file name (or empty string)
               // (omit if "base" is the current folder without trailing slash)
  for (var i=0; i<parts.length; i++) {
      if (parts[i] == ".")
          continue;
      if (parts[i] == "..")
          stack.pop();
      else
          stack.push(parts[i]);
  }
  return stack.join("/");
}
