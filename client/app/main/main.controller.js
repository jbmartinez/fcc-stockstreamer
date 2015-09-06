'use strict';

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    // var symbol = 'YHOO';
    var startDate = '2015-01-01';
    var endDate = '2015-09-06';
    // var query = [
    //   'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20=%20%22',
    //   symbol, 
    //   '%22%20and%20startDate%20%3D%20%22',
    //   startDate,
    //   '%22%20and%20endDate%20%3D%20%22',
    //   endDate,
    //   '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
    // ];
    // query = query.join('');
    
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
        console.log(data);
        chart.addSeries({
          data: data,
          pointStart: Date.UTC.apply(Date, startDate.split('-')),
          pointInterval: 24 * 3600 * 1000 // one day
        });
      }).error(function(err) {
        console.error(err);
      });
    }

    // var data = [];
    // $http.get(query).success(function(res) {
    //   data = res.query.results.quote
    //     .map(function(item) {
    //       return Number(item.Close);
    //     });
    //   console.log(data);
    //   chart.addSeries({
    //     data: data,
    //     pointStart: Date.UTC.apply(Date, startDate.split('-')),
    //     pointInterval: 24 * 3600 * 1000 // one day
    //   });
    // }).error(function(err) {
    //   console.error(err);
    // });
    
    // var chartContainer = $('#chart');
    // var chart = chartContainer.highcharts({
    var chart = new Highcharts.Chart({
      chart: {
        renderTo: 'chart',
        type: 'line'
      },
      legend: {
        enabled: true
      },
      // series: [{
      //   // data:  [100, 112, 105, 110],
      //   data: data.splice(5,100),
      //   // pointStart: Date.UTC(2010, 0, 1),
      //   pointStart: Date.UTC.apply(Date, startDate.split('-')),
      //   pointInterval: 24 * 3600 * 1000 // one day
      // }],
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
      performQuery($scope.newThing);
      // $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
