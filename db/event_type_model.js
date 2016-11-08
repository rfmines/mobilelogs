var mongoose = require('mongoose');
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var Promise = require('promise');
var db = mongoose.connection;
var env = process.env.NODE_ENV || 'production';
var config = require('./config')[env];
var db_config = config.database;
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var eventTypeDictionarySchema = new Schema({
  id: String,
  name: String
});

var EventTypes = mongoose.model('EventTypes', eventTypeDictionarySchema);

module.exports = {
  get: function(id) {
    return new Promise(function (resolve, reject) {
      EvetnTypes.findById(id, function (err, item) {
        if (err) reject( err );

        resolve( item );
      })
    });
  },
  remove: function (id) {
    return new Promise(function (resolve, reject) {
      EvetnTypes.remove({_id: id}, function (err) {
        if (err) reject( err );

        resolve( 'ok' );
      });
    });
  },

  list: function (query) {
    if (query == null) { query = {}; }

    return new Promise(function (resolve, reject) {
      EvetnTypes.find(query, function (err, items) {
        if (err) reject( err );

        resolve( items );
      });
    });
  },

  create: function(params) {
    return new Promise(function (resolve, reject) {
      var EvetnType = new EvetnTypes(params);
      EvetnType.save(function(err, item) {
        if (err) {
          reject( err );
          return;
        }
        resolve( item );
      });
    });
  },

  update: function(id, params) {
    return new Promise(function (resolve, reject) {
      var EvetnType = new EvetnTypes(params);

      EvetnTypes.findById(id, function(err, item) {
        console.log(item);
        for (var id in params) {
          item[id] = params[id]
        }
        item.save(function(err, item) {
          if (err) {
            reject( err );
            return;
          }
          resolve( item );
        });

      });
    });
  }
};

