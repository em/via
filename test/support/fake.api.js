if(typeof module !== 'undefined') {
  module.exports = FakeAPI;
}

function FakeAPI(mock) {
  this.mock = mock || {};
  this.baseUrl = '';
}

FakeAPI.prototype.request = function(method, uri, data, callback) {
  var str = ''+method+' '+uri;

  if(!this.mock.hasOwnProperty(str)) {
    throw 'fake API "'+str+'" not mocked';
  }
  else {
    var res = this.mock[str];
    if(typeof res === 'function') {
      res = res(data);
    }
    res = res || {};

    setTimeout(function() {
      if(res.error) {
        callback(res.error);
      }
      else {
        res.meta = res.meta || {};
        res.meta.status = res.meta.status || 200;
        callback(null, res);
      }
    });
  }
};
