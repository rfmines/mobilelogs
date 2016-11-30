var mongoose = require('mongoose');
var db = require('./connection').db;
var ObjectId = mongoose.Schema.ObjectId;
var userAppSchema = mongoose.Schema({
  groupid: ObjectId,
  userid: ObjectId,
  name: String,
  type: String,
  os: String,
  apikey: String,
  removed: Boolean
});

var userApps = db.model('UserApp', userAppSchema);

module.exports = {
  get: function (query) {
    return new Promise(function (resolve, reject) {
      userApps.find(query, function (err, item) {
        if (err) reject(err);
        if (!item) reject('Apikey not found');
        resolve(item);
      })
    });
  },
  remove: function (id) {
    return new Promise(function (resolve, reject) {
      userApps.remove({_id: id}, function (err) {
        if (err) reject(err);
        
        resolve('ok');
      });
    });
  },
  
  list: function (query) {
    if (query == null) {
      query = {};
    }
    
    return new Promise(function (resolve, reject) {
      userApps.find(query, function (err, items) {
        if (err) reject(err);
        
        resolve(items);
      });
    });
  },
  
  create: function (params) {
    return new Promise(function (resolve, reject) {
      var userApp = new userApps(params);
      userApp.save(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  },
  
  update: function (id, params) {
    return new Promise(function (resolve, reject) {
      
      userApp.findById(id, function (err, item) {
        for (var key in params) {
          item[key] = params[key];
        }
        item.save(function (err, item) {
          if (err) {
            reject(err);
            return;
          }
          
          resolve(item);
        });
        
      });
    });
  }
};