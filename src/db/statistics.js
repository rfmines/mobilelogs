var mongoose = require('mongoose');
var db = require('./connection').db;

var logSessionSchema = mongoose.Schema({
  date: Date,
  os_name:String,
  app_version: String,
  counter:Number
}, {autoIndex: false});

var session = db.model('LogSession', logSessionSchema);

module.exports = {
  
  update: function (params) {
    return new Promise(function (resolve, reject) {
  
      session.update(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  }
};