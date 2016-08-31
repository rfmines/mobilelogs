/**
 * Middleware module to log page not found and internal server error
 * 
 * @author: Yeffry Zakizon
 * @copyright: Ooma Inc, 2014
 */

var log4js = require('log4js');
var logger4js = log4js.getLogger('applog');
var ooma_util = require('../util/ooma_util');

exports.notFound = function (req, res, next) {
    logger4js.info('Server request Not Found (404): ', req.url);
    //res.send(404, "{error: 404, description: 'Page not found.'}\r\n");
    var err = ooma_util.newError(404, 'Page not found', '');

    res.setHeader('Content-Type', 'application/json');
    res.status(err.code).send(err);
};

exports.error = function(error, req, res, next) {
    logger4js.fatal('Server request error: ', error);
    var err = ooma_util.newError(500, 'Internal server error (' + error.message + ')', '');

    res.setHeader('Content-Type', 'application/json');
    res.status(err.code).send(err);
};
