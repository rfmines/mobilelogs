var mongoose = require('mongoose');
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var Promise = require('promise');

var db = mongoose.connection;

var env = process.env.NODE_ENV || 'production';
var config = require('./config')[env];
var db_config = config.database;

// db.on('error', function (err) {
//   logger.fatal('log_model error connecting to mongodb: ', err)
// });

// db.on('connected', function () {
//   logger.info('Database connected ');
// })
// db.on('disconnected', function () {
//   logger.info('Database disconnected');
// })

// mongoose.connect('mongodb://' + db_config.host + '/'+ db_config.db, {user: db_config.user, pass: db_config.password});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var labelDictionarySchema = new Schema({
  id: String,
  key: String,
  name: String
});

var Label = mongoose.model('Label', labelDictionarySchema);

module.exports = {
  get: function(id) {
    return new Promise(function (resolve, reject) {
      Label.findById(id, function (err, item) {
        if (err) reject( err );

        resolve( item );
      })
    });
  },
  remove: function (id) {
    return new Promise(function (resolve, reject) {
      Label.remove({_id: id}, function (err) {
        if (err) reject( err );

        resolve( 'ok' );
      });
    });
  },

  list: function (query) {
    if (query == null) { query = {}; }

    return new Promise(function (resolve, reject) {
      Label.find(query, function (err, items) {
        if (err) reject( err );

        resolve( items );
      });
    });
  },

  create: function(params) {
    return new Promise(function (resolve, reject) {
      var label = new Label(params);
      label.save(function(err, item) {
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

      Label.findById(id, function(err, item) {
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
