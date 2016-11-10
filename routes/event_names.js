var express = require('express');
var app = module.exports = express();
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var eventNameModel = require('../db/event_name_model');
var auth = require('../modules/auth');

app.get('/', auth.checkAuth, getEventNames);
app.get('/:id', auth.checkAuth, getEventName);
app.post('/', auth.checkAuth, postEventName);
app.put('/:id', auth.checkAuth, updateEventName)
app.delete('/:id', auth.checkAuth, removeEventName);

/* Is empty */
function _E(obj) {
  if (obj === undefined || obj === null || obj === "") {
    return true;
  }
  return false;
};

function getEventName(req, res, next) {
  var eventId = req.params.id;
  try {
    eventName = eventNameModel.get(eventId).then(function(item){
      res.status(200).json({status: 'success', event_name: item});
    }, function(err) {
      res.status(500).json({status: 'error', message: err.message});
      return;
    });
  } catch (e) {
    logger.warn('get EventName error ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
};

function getEventNames(req, res, next) {
  try {
    eventNameModel.list().then(function (items) {
      res.status(200).json({status: 'success', event_names: items});
    }, function(err){
      logger.warn('get EventNames error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('get EventNames error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function postEventName(req, res, next) {
  var eventName = req.body.event_name;
  if ( _E(eventName) || _E(eventName.id) || _E(eventName.name) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }

  try {
    eventNameModel.create(eventName).then(function (item) {
      res.status(200).json({status: 'success', event_name: item});
    }, function(err){
      logger.warn('create EventName error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create EventName error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function updateEventName(req, res, next) {
  var eventName = req.body.event_name;
  if ( _E(eventName) || _E(eventName.id) && _E(eventName.name) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }
  var eventId = req.params.id;
  try {
    eventNameModel.update(eventId, eventName).then(function (item) {
      res.status(200).json({status: 'success', event_name: item});
    }, function(err){
      logger.warn('create EventName error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create EventName error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function removeEventName(req, res, next) {
  var eventId = req.params.id;
  try {
    eventName = eventNameModel.remove(eventId).then(function(item){
      res.status(200).json({status: 'success'});
    }, function(err) {
      res.status(500).json({status: 'error', message: err.message});
      return;
    });
  } catch (e) {
    logger.warn('delete event name error ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
};
