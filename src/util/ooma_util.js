/**
 * Helper functions
 * 
 * @author: Yeffry Zakizon
 * @copyright: Ooma Inc, 2014
 */

var log4js = require('log4js');
var logger = log4js.getLogger('kazooproxy');
var util = require('util');

 /** Create new error with
 */
function newError(code, message, user_data) {
    var error = new Error();
    error.message = message;
    error.code = code;
    error.status = 'error';
    if (user_data !== undefined) {
        error.user_data = user_data;
    };
    
    return error;
}

function isEmpty(obj) {
	if (obj === undefined) {
		return true;
	}
	if (obj == null) {
		return true;
	};

	try {
		if (obj == "undefined") {
			return true;
		}
		if (obj.length == 0) {
			return true;
		}

		if (Object.keys(obj).length == 0) {
			return true;
		}
	}  catch (e) {
		return false;
	}
	
	return false;
}

/** Send response to app server
 */
function sendErrorResponseToClient(res, err) {
    logger.debug('sendErrorResponseToClient: ', util.inspect(err));
    res.setHeader('Content-Type', 'application/json');
    res.send(err.code, err);
}

/** Send response to app server
 */
function sendResponseToClient(res, body) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.send(body);
    } catch (e) {
        logger.fatal('sendResponseToClient UNABLE to send response to client! Error: ', e.message);
    }
}

exports.newError = newError;
exports.isEmpty = isEmpty;
exports.sendErrorResponseToClient = sendErrorResponseToClient;
exports.sendResponseToClient = sendResponseToClient;