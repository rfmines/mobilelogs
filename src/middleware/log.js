/**
 * Middleware module to log every new http request
 * 
 * @author: Yeffry Zakizon
 * @copyright: Ooma Inc, 2014
 */

let loggerjs = require('./../util/logger').getlogger('middleware.log');

exports.logger = function logger(req, res, next) {
    //logger4js.debug('Request: ' + req.method + ' ' + req.url + ' params:  ' + JSON.stringify(req.params, null, 4) + ' body: ' + JSON.stringify(req.body, null, 4));
    loggerjs.debug('Request: ' + req.method + ' ' + req.url);
    next();
};