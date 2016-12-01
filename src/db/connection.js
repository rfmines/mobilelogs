var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var logger = require('./../util/logger').getlogger('db.connection');
var db = mongoose.connection;
var env = process.env.NODE_ENV || 'production';
var config = require('./config');
var db_config = config[env].database;

if (config.showQuery) {
  mongoose.set('debug', true);
}

db.on('error', function (err) {
  logger.fatal('Database connection error : ', err)
});

db.on('connected', function () {
  logger.info('Database connected ' + 'mongodb://' + db_config.host + '/' + db_config.db, {user: db_config.user});
});

db.on('open', function () {
  logger.info('Connection to database has been opened');
});

db.on('disconnecting', function () {
  logger.info('Disconnecting from database ');
});

db.on('disconnected', function () {
  logger.info('Database disconnected');
});

db.on('reconnected', function (ref) {
  logger.warn('Reconnected to database. Ref:' + ref);
});

db.on('close', function () {
  logger.warn('Connection to database has been closed. Trying to reopen');
  connectWithRetry();
});

function connectWithRetry() {

  mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db,
    {
      user: db_config.user,
      pass: db_config.password,
      server: config.connectionAdditionalOptions.server
    } , function (err){
      if (err) {
        logger.error('Failed to connect to mongo - retrying in 5 sec. Database error message : '+err);
        setTimeout(connectWithRetry,5000);
      } else {
        logger.info('Connection established successfully');
      }
    });
}

connectWithRetry();

exports.db  = db ;
exports.checkDbConnection = function checkDbConnection() {
  return (db.readyState === 1);
};

