'use strict';

var _ = require('lodash');
var Stock = require('./stock.model');

// Get list of stocks
exports.index = function(req, res) {
  Stock.find(function (err, stocks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(stocks);
  });
};

// Get a single stock
exports.show = function(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    if(err) { return handleError(res, err); }
    if(!stock) { return res.status(404).send('Not Found'); }
    return res.json(stock);
  });
};

// Creates a new stock in the DB.
exports.create = function(req, res) {
  Stock.create(req.body, function(err, stock) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(stock);
  });
};

// Updates an existing stock in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Stock.findById(req.params.id, function (err, stock) {
    if (err) { return handleError(res, err); }
    if(!stock) { return res.status(404).send('Not Found'); }
    var updated = _.merge(stock, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(stock);
    });
  });
};

// Deletes a stock from the DB.
exports.destroy = function(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    if(err) { return handleError(res, err); }
    if(!stock) { return res.status(404).send('Not Found'); }
    stock.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}