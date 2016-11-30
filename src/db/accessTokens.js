var mongoose = require('mongoose');
var db = require('./connection').db;

var validTokensSchema = mongoose.Schema({
  access_token: String ,
  devid: String
}, {timestamps:true, autoIndex:false});

var validTokens = db.model('ValidToken', validTokensSchema);

module.exports = {
  get: function (query) {
    return new Promise(function (resolve, reject) {
      if (!query) {
        query = {};
      }
      validTokens.find(query, function (err, items) {
        if (err) reject(err);
        resolve(items);
      })
    });
  },
    
  create: function (params) {
    return new Promise(function (resolve, reject) {
      var validTokens = new validTokens(params);
      validTokens.save(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  }
};