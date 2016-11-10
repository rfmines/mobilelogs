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


var eventNameDictionarySchema = new Schema({
  id: String,
  name: String
});

var EventNames = mongoose.model('EventNames', eventNameDictionarySchema);

module.exports = {
  get: function(id) {
    return new Promise(function (resolve, reject) {
      EventNames.findById(id, function (err, item) {
        if (err) reject( err );

        resolve( item );
      })
    });
  },
  remove: function (id) {
    return new Promise(function (resolve, reject) {
      EventNames.remove({_id: id}, function (err) {
        if (err) reject( err );

        resolve( 'ok' );
      });
    });
  },

  list: function (query) {
    if (query == null) { query = {}; }

    return new Promise(function (resolve, reject) {
      EventNames.find(query, function (err, items) {
        if (err) reject( err );

        resolve( items );
      });
    });
  },

  create: function(params) {
    return new Promise(function (resolve, reject) {
      var eventName = new EventNames(params);
      eventName.save(function(err, item) {
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

      EventNames.findById(id, function(err, item) {
        for (var key in params) {
          item[key] = params[key];
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
