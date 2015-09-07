'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, $q, socket) {
    $scope.error = '';
    $scope.stocks = [];

    var chart;
    var deffered = $q.defer();
    var date = new Date();
    // gets the date 180 days ago
    var date2 = new Date(date - 1000 * 60 * 60 * 24 * 180);
    var startDate = date2.toISOString().slice(0, 10);
    var endDate = date.toISOString().slice(0, 10);
    
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    function buildQuery(symbol) {
      var query = [
        'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20=%20%22',
        symbol, 
        '%22%20and%20startDate%20%3D%20%22',
        startDate,
        '%22%20and%20endDate%20%3D%20%22',
        endDate,
        '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
      ];
      return query.join('');
    }

    function performQuery(symbol) {
      var data = [];
      var query = buildQuery(symbol);

      $http.get(query).success(function(res) {
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
        $scope.error = err.description;
        console.error(err);
        deffered.reject(err);
      });

      // I promise you'll get the data :)
      return deffered.promise;
    }
    
    function updateChart(ev, item) {
      if (ev === 'created') {
        chart.addSeries(item);
      }
      if (ev === 'deleted') {
        createChart();
      }
    }

    createChart();

    $http.get('/api/stocks').success(function(stocks) {
      $scope.stocks = stocks;
      createChart();
      socket.syncUpdates('stock', $scope.stocks, updateChart);
    });

    function createChart() {
      chart = new Highcharts.Chart({
        chart: {
          renderTo: 'chart',
          type: 'line'
        },
        credits: {
          enabled: false,
        },
        exporting: {
            enabled: false
        },
        series: $scope.stocks,
        legend: {
          enabled: true
        },
        title: {
          text: ''
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%e of %b'
          }
        }
      });
    }

    $scope.addStock = function() {
      if($scope.newStock === '') {
        return;
      }

      var exists = $scope.stocks.some(function(stock) {
        return stock.name === $scope.newStock.toUpperCase();
      });

      if (exists) {
        console.log('already exists!');
        return;
      }

      performQuery($scope.newStock.toUpperCase()).then(function(data) {
        // $scope.stocks.push(data);
        console.log($scope.stocks);
        $http.post('/api/stocks', data);
        $scope.newStock = '';
        deffered = $q.defer();
      });
    };

    $scope.deleteStock = function(symbol) {
      $http.delete('/api/stocks/' + symbol).success(function() {
        $scope.stocks = $scope.stocks.filter(function(stock) {
          return stock.name !== symbol;
        });
        createChart();
      });
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
