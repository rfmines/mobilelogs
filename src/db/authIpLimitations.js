let mongoose = require('mongoose');
let db = require('./connection').db;
let Schema = mongoose.Schema;
let Non_Auth_User_Limitation_Schema = Schema({
  devid: String,
  remote_ip: String,
  doc_limit: Number
},{timestamps:true, autoIndex:false});

let authLimits = db.model('AuthLimitation', Non_Auth_User_Limitation_Schema);

module.exports = {
  get: function (query) {
    return new Promise(function (resolve, reject) {
      if (!query) {
        query = {};
      }
      authLimits.find(query, function (err, items) {
        if (err) reject(err);
        resolve(items);
      })
    });
  },
  
  create: function (params) {
    return new Promise(function (resolve, reject) {
      var newAuthLimits = new authLimits(params);
      newAuthLimits.save(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  } ,
  remove: function (remote_ip) {
    return new Promise(function (resolve, reject) {
      authLimits.remove({remote_ip: remote_ip}, function (err) {
        if (err) reject( err );
        resolve( 'ok' );
      });
    });
  },
  update: function(query , updateOptions){
    return new Promise(function (resolve, reject) {
      authLimits.findOneAndUpdate(query,updateOptions, function (err) {
        if (err) reject( err );
        resolve( 'ok' );
      });
    });
  }
};