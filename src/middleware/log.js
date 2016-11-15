/**
 * Middleware module to log every new http request
 * 
 * @author: Yeffry Zakizon
 * @copyright: Ooma Inc, 2014
 */

var log4js = require('log4js');
var logger4js = log4js.getLogger('applog');

exports.logger = function logger(req, res, next) {
    //logger4js.debug('Request: ' + req.method + ' ' + req.url + ' params:  ' + JSON.stringify(req.params, null, 4) + ' body: ' + JSON.stringify(req.body, null, 4));
    logger4js.debug('Request: ' + req.method + ' ' + req.url);
    next();
}