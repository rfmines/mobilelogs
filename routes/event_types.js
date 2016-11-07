
var express = require('express');
var app = module.exports = express();
//var async = require('async');

//app.post('/', postEventType);
//app.delete('/', deleteEventType);
app.get('/', getEventType);
app.get('/list',getEventTypes);

/* Is empty */
function _E(obj) {
	if (obj === undefined || obj === null || obj === "") {
		return true;
	}
	return false;
}

function getEventType(req, res, next) {
	var apiKey = req.body.f;
	var sessionId = req.body.s;
	var eventId = req.body.h;

	if (_E(apiKey) || _E(sessionid) || _E(eventid)) {
		res.status(403).json({status: 'error', message: 'Invalid params'});
		return;
	}

	try {
		eventName = eventTypeDictionaySchema.methods.getEventType(eventId)
		if (err) {
			res.status(403).json({status: 'error', message: 'Invalid session id', description: err.name});
			return;
		} else {
			res.status(200).json({status: 'success', name: eventName});
		}
	} catch (e) {
		logger.warn('getEventType error ', e);
		res.status(500).json({status: 'error', message: e.message});
	}
};

function getEventTypes(req, res, next) {
	var apiKey = req.body.f;
	var sessionId = req.body.s;
	var eventId = req.body.h;


	if (_E(apiKey) || _E(sessionid) || _E(eventid)) {
		res.status(403).json({status: 'error', message: 'Invalid params'});
		return;
	}

	try {
		var eventTypes = eventTypeDictionaySchema.methods.listEventTypes(eventId)
		if (err) {
			res.status(403).json({status: 'error', message: 'Invalid session id', description: err.name});
			return;
		} else {
			res.status(200).json({status: 'success', name: eventTypes});
		}
	} catch (e) {
		logger.warn('getEventType error ', e);
		res.status(500).json({status: 'error', message: e.message});
	}
}
