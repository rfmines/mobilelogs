var mongoose = require('mongoose');
var db = require('./connection').db;

var logSessionSchema = mongoose.Schema({
  apikey: String,
  apikey_type:String,
  devid: String,
  created_date: Date,
  os_name: String, 	// IOS, ANDROID, WP, BLACKBERRY
  hw_info: String, // [iPhone 5s, iPhone 5c, iPhone 6, Nexus 6, galaxy 6]
  devManufacturer: String, //[Apple, Samsung, HTC]
  os_version: String, // 8.3, 5.2
  appVersion: String,
  appName: String,
  node: String,
  remote_ip: String,
  access_token: String
}, {autoIndex: false});

var session = db.model('LogSession', logSessionSchema);

module.exports = {
    
  create: function (params) {
    return new Promise(function (resolve, reject) {
      var newSession = new session(params);
      newSession.save(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  }
};