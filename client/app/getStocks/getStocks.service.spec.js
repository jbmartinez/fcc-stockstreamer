'use strict';

describe('Service: getStocks', function () {

  // load the service's module
  beforeEach(module('workspaceApp'));

  // instantiate service
  var getStocks;
  beforeEach(inject(function (_getStocks_) {
    getStocks = _getStocks_;
  }));

  it('should do something', function () {
    expect(!!getStocks).toBe(true);
  });

});
