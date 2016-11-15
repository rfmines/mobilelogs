var server = require('./server');
var config = require('./config');
var instanceName = 'applog';
var log4js = require('log4js');

if (config.syslog !== undefined) {

  config.syslog.appenders[0].tag = 'proxy';
  var sylog_appender = '../../../../util/log4js-syslog-appender';
  log4js.loadAppender(sylog_appender);
  log4js.addAppender(log4js.appenders[sylog_appender](config.syslog.appenders[0]), instanceName);
  console.log('mobile logs logging to syslog');
}  

if (config.log_file !== undefined) {
  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file(config.log_file), instanceName);
};

var logger = log4js.getLogger(instanceName);

if (config.log_level == undefined) {
  config.log_level = 'DEBUG';
}

process.env.NODE_ENV = process.env.NODE_ENV||'production'
/* production should always use ERROR */
if (process.env.NODE_ENV == "production") {
  config.log_level = 'INFO';
} 

/* Overwrite log level */
if (process.env.LOG_LEVEL != undefined) {
  config.log_level = process.env.LOG_LEVEL;
};


console.log('%s log set to: ', instanceName, config.log_level);
logger.setLevel(config.log_level);


var shutdown = function(s) {
  logger.info("Received kill signal, shutting down gracefully.");
  s.close(function() {
    logger.info("Exiting now.");
    process.exit()
  }); 

  // if after 
  setTimeout(function() {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit()
  }, 33*1000);
}

console.log('starting app in %s', process.env.NODE_ENV)
var http_port = process.env.APPLOG_PORT || process.env.PORT || config.local.http_port || 8000;

var s = server.listen(http_port, function() {
  console.log("%s server is running on http port %d", instanceName, http_port);
});


/*Kill signal*/
process.on ('SIGTERM', function(){shutdown(s)});
/* Ctrl-C */
process.on('SIGINT', function(){shutdown(s)});
