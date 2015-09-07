'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StockSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  data: [Number],
  pointStart: Number,
  pointInterval: Number,
  active: Boolean
});

// Schema.path('name').index({ unique: true });

module.exports = mongoose.model('Stock', StockSchema);