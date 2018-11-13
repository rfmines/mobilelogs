let log4js = require('log4js');
let config = require('./../config');


log4js.configure({
  appenders: config.loggerConfig.log4jsAppenders
});

exports.getlogger = function getLogger4Module (moduleName){
  return log4js.getLogger('CSL.'+moduleName);
};