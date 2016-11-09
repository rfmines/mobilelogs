var express = require('express');
var app = module.exports = express();
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var eventTypeModel = require('../db/event_type_model');
var auth = require('../modules/auth');

app.get('/', auth.checkAuth, getEventTypes);
app.get('/:id', auth.checkAuth, getEventType);
app.post('/', auth.checkAuth, postEventType);
app.put('/:id', auth.checkAuth, updateEventType)
app.delete('/:id', auth.checkAuth, removeEventType);

/* Is empty */
function _E(obj) {
  if (obj === undefined || obj === null || obj === "") {
    return true;
  }
  return false;
}

function getEventType(req, res, next) {
  const eventId = req.params.id;
  try {
    eventType = eventTypeModel.get(eventId).then(function(item){
    res.status(200).json({status: 'success', event_type: item});
  }, function(err) {
    res.status(500).json({status: 'error', message: err.message});
    return;
  });
} catch (e) {
  logger.warn('get EventType error ', e);
  res.status(500).json({status: 'error', message: e.message});
}

  };

function getEventTypes(req, res, next) {
  try {
    eventType = eventTypeModel.list().then(function(item){
      res.status(200).json({status: 'success', event_type: item});
    }, function(err) {
      res.status(500).json({status: 'error', message: err.message});
      return;
    });
  } catch (e) {
    logger.warn('get EventTypeList error ', e);
    res.status(500).json({status: 'error', message: e.message});
  }

};

function postEventType(req, res, next) {
  var eventType = req.body.event_type;
  if ( _E(eventType) || _E(eventType.id) || _E(eventType.name) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }
  try {
    eventTypeModel.create(eventType).then(function (item) {
      res.status(200).json({status: 'success', event_type: item});
    }, function(err){
      logger.warn('create EventType error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create EventType error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function updateEventType(req, res, next) {
  var eventType = req.body.event_type;
  if ( _E(eventType) || _E(eventType.id) && _E(eventType.name) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }
  var eventId = req.params.id;
  try {
    eventTypeModel.update(eventId, eventType).then(function (item) {
      res.status(200).json({status: 'success', event_type: item});
    }, function(err){
      logger.warn('create eventType error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create eventType error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function removeEventType(req, res, next) {
  var eventId = req.params.id;
  try {
    eventType = eventTypeModel.remove(eventId).then(function(item){
      res.status(200).json({status: 'success'});
    }, function(err) {
      res.status(500).json({status: 'error', message: err.message});
      return;
    });
  } catch (e) {
    logger.warn('delete event type error ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
};

