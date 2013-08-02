var utils = require('./utils');

module.exports = API;

var isNode = true;
if(typeof window !== 'undefined') {
  isNode = false;
}

/**
 * Abstract API interface used by Model and Collection
 */
function API(baseUrl, authKey) {
  this.baseUrl = baseUrl;
  this.authKey = authKey;

  API.defaultAPI = this;
}

API.prototype = {
  jsonpRequest: (function() {
    var count = 1;
    return function(method, url, data, callback){
      if(method == 'POST' || method == 'PUT') {
        var body = JSON.stringify(data);
        data = {_body: body};
      }
     
      data = data || {};

      utils.extend(data, {
        _method: method,
        _token: this.authKey,
        js_version: exports.version
      });

      url += '?' + utils.urlParams(data);

      url += '&' + Math.round(Math.random() * 0xffffffff);

      var opts = opts || {};
      var param = opts.param || 'callback';
      var timeout = null != opts.timeout ? opts.timeout : 60000;
      var enc = encodeURIComponent;
      var target = document.getElementsByTagName('script')[0];
      var script;
      var timer;

      // generate a unique id for this request
      var id = count++;

      if (timeout) {
        timer = setTimeout(function(){
          cleanup();
          callback && callback(new Error('Timeout'));
        }, timeout);
      }

      function cleanup(){
        script.parentNode.removeChild(script);
        delete window['recurly_jsonp_' + id];
      }

      window['recurly_jsonp_' + id] = function(data,headers){
        if (timer) clearTimeout(timer);
        cleanup();
        callback && callback(null, data, headers);
      };

      // add qs component
      url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc('recurly_jsonp_' + id + '');
      url = url.replace('?&', '?');

      // debug('jsonp req "%s"', url);

      // create script
      script = document.createElement('script');
      script.src = url;
      target.parentNode.insertBefore(script, target);
    };
     
  })()

/**
 * Common request implementation only for node environment
 * uses "request" module with BasicAuth
 */
, nodeRequest: function(method, uri, data, callback) {
    var request = require('request');
    var apiKey = this.authKey;

    request({
      method: method
    , uri: this.baseUrl + uri 
    , data: JSON.stringify(data)
    , headers: {
         'Authorization'  : "Basic "+(new Buffer(apiKey+':')).toString('base64')
       , 'Accept'         : 'application/json'
       , 'Content-Type'   : 'application/json'
       , 'Content-Length' : (data) ? data.length : 0
      }
    }
    , function(err, res, body) {
      if(err) {
        callback(err);
      }
      else if(res.statusCode >= 200 && res.statusCode < 300) {
        callback(null, JSON.parse(body.toString()));
      }
      else if(res.statusCode === 404) {
        callback(null, {meta: {status: 404}});
      }
      else {
        callback(new Error(body));
      }
    });
  }

/**
 * Common request interface that simply delegates
 * to either nodeRequest or browserRequest given
 * the environment
 */
, request: function(method, uri, data, callback) {
    return (isNode ? this.nodeRequest : this.jsonpRequest)
      .call(this, method, uri, data, callback);
  }
};
