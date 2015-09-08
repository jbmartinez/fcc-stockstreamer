'use strict';

// this factory fetches stock data from yahoo finance service
angular.module('workspaceApp')
  .factory('getStocks', function ($http, $q) {

    // builds the url used to fetch the data using YQL
    function buildQuery(symbol, startDate, endDate) {
      var query = [
        'https://query.yahooapis.com/v1/public/yql?',
        'q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20=%20%22',
        symbol, 
        '%22%20and%20startDate%20%3D%20%22',
        startDate,
        '%22%20and%20endDate%20%3D%20%22',
        endDate,
        '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
      ];
      return query.join('');
    }

    function performQuery(symbol, startDate, endDate) {
      var deffered = $q.defer();
      var data = [];
      var query = buildQuery(symbol, startDate, endDate);

      $http.get(query).success(function(res) {
        // get rid of unused info and keep date and close price
        data = res.query.results.quote
          .map(function(item) {
            var dateArr = item.Date.split('-');
            // javascipt months are zero-based
            dateArr[1]--;
            return [Date.UTC.apply(Date, dateArr), Number(item.Close)];
          });

        data = {
          name: symbol,
          data: data.reverse(),
        };

        // they're waiting for the data
        deffered.resolve(data);
      }).error(function(err) {
        console.error(err);
        deffered.reject(err);
      });

      // I promise you'll get the data :)
      return deffered.promise;
    }

    // Public API here
    return {
      fetch: performQuery
    };
  });
