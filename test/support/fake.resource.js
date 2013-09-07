if(typeof module !== 'undefined') {
  module.exports = FakeResource;
  ReactiveResource = require('../../lib/resource');
  FakeAPI = require('./fake.api');
}


function FakeResource(init,mock) {
  ReactiveResource.call(this, init);

  if(mock instanceof FakeAPI)
    this.FakeAPI = mock;
  else
    this.fakeAPI = new FakeAPI(mock);
}

FakeResource.prototype = new ReactiveResource({
  request: function() {
    return this.fakeAPI.request.apply(this.fakeAPI, arguments);
  }
});
