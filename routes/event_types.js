var express = require('express');
var app = module.exports = express();
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var eventModel = require('../db/event_type_model');
//var async = require('async');

//app.post('/', postEventType);
//app.delete('/', deleteEventType);
app.get('/', getEventType);
app.get('/list', getEventTypes);

/* Is empty */
function _E(obj) {
  if (obj === undefined || obj === null || obj === "") {
    return true;
  }
  return false;
}

function getEventType(req, res, next) {
    try {
      eventName = eventModel.getEventType(eventId)
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
    console.log('staring event types');
    try {
      console.log('getting event types')
      var eventTypes = eventModel.listEventTypes()
      if ( !eventTypes ) { eventTypes = {} }
      console.log((eventTypes.id))
      res.status(200).json({status: 'success', name: eventTypes});
    } catch (e) {
      logger.warn('getEventTypes error ', e);
      res.status(500).json({status: 'error', message: e.message});
    }
  };
