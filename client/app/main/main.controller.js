'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, $timeout, socket, getStocks) {
    $scope.error = '';
    $scope.stocks = [];

    var chart;
    var date = new Date();
    // gets the date 180 days ago
    var date2 = new Date(date - 1000 * 60 * 60 * 24 * 180);
    var startDate = date2.toISOString().slice(0, 10);
    var endDate = date.toISOString().slice(0, 10);

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
        },
        yAxis: {
          title: {
            text: 'price ($)'
          }
        }
      });
    }

    // handles socket events updating the chart accordingly
    function updateChart(ev, item) {
      if (ev === 'created') {
        chart.addSeries(item);
      }
      if (ev === 'deleted') {
        createChart();
      }
    }

    // verifies if the symbols is already on the chart and add it if not exists
    $scope.addStock = function() {
      if($scope.newStock === '') {
        return;
      }

      var exists = $scope.stocks.some(function(stock) {
        return stock.name === $scope.newStock.toUpperCase();
      });

      if (exists) {
        return;
      }

      getStocks.fetch($scope.newStock.toUpperCase(), startDate, endDate)
        .then(function(data) {
          console.log(data);
          $http.post('/api/stocks', data);
          $scope.newStock = '';
        })
        .catch(function(err) {
          $scope.error = err.description;
          console.error(err);
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

    // let's start the fun!
    createChart();

    // fetch the stock data used by other clients and
    // set the socket to listen on updates
    $http.get('/api/stocks').success(function(stocks) {
      $scope.stocks = stocks;
      createChart();
      socket.syncUpdates('stock', $scope.stocks, updateChart);
    });

    $timeout(function() {
      socket.unsyncUpdates('stock');
      alert('Our server resources are limited, we disconnected you after five ' +
            'minutes. Please, refresh the page to continue using.');
    }, 1000 * 60 * 5);

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stock');
    });
  });
