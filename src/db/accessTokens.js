let mongoose = require('mongoose');
let db = require('./connection').db;

let validTokensSchema = mongoose.Schema({
  access_token: String ,
  devid: String
}, {timestamps:true, autoIndex:false});

let validTokens = db.model('ValidToken', validTokensSchema);

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

        validTokens.findOneAndUpdate({access_token:params.access_token},params,{upsert:true},function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  }
};