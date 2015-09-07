'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, $q, socket) {
    $scope.awesomeThings = [];
    
    $scope.error = '';
    $scope.symbols = [];

    var deffered = $q.defer();
    var date = new Date();
    // gets the date 180 days ago
    var date2 = new Date(date - 1000 * 60 * 60 * 24 * 180);
    var startDate = date2.toISOString().slice(0, 10);
    var endDate = date.toISOString().slice(0, 10);

    function performQuery(symbol) {
      var data = [];
      var query = [
        'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20=%20%22',
        symbol, 
        '%22%20and%20startDate%20%3D%20%22',
        startDate,
        '%22%20and%20endDate%20%3D%20%22',
        endDate,
        '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
      ];
      query = query.join('');

      $http.get(query).success(function(res) {
        data = res.query.results.quote
          .map(function(item) {
            return Number(item.Close);
          });

        data = {
          name: symbol,
          data: data,
          pointStart: Date.UTC.apply(Date, startDate.split('-')),
          pointInterval: 24 * 3600 * 1000 // one day
        };

        chart.addSeries(data);
        // they're waiting for the data
        console.log('data', data);
        deffered.resolve(data);
      }).error(function(err) {
        $scope.error = err.description;
        console.error(err);
        deffered.reject(err);
      });

      // I promise you'll get the data :)
      return deffered.promise;
    }

    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'chart',
        type: 'line'
      },
      legend: {
        enabled: true
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e of %b'
        }
      }
    });

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addStock = function() {
      if($scope.newThing === '') {
        return;
      }
      var pos = $scope.symbols.indexOf($scope.newThing);
      if (pos >= 0) {
        console.log('already exists!');
        return;
      }
      performQuery($scope.newThing.toUpperCase()).then(function(data) {
        console.log(data);
        $scope.symbols.push(data.name);
        $http.post('/api/stocks', data);
        $scope.newThing = '';
        deffered = $q.defer();
      });
    };

    $scope.deleteStock = function(symbol) {
      $http.delete('/api/stocks/' + symbol).success(function() {
        var pos = $scope.symbols.indexOf(symbol);
        $scope.symbols.splice(pos, 1);
      });
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
