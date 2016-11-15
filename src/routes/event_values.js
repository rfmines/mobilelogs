"use strict";
const express = require('express');
const app = module.exports = express();
const log4js = require('log4js');
const logger = log4js.getLogger('applog');
const eventValueModel = require('../db/event_value_model');
const auth = require('../modules/auth');

app.get('/', auth.checkAuth, getEventValues);
app.get('/:id', auth.checkAuth, getEventValue);
app.post('/', auth.checkAuth, postEventValue);
app.put('/:id', auth.checkAuth, updateEventValue)
app.delete('/:id', auth.checkAuth, removeEventValue);

/* Is empty */
function _E(obj) {
  if (obj === undefined || obj === null || obj === "") {
    return true;
  }
  return false;
}

function getEventValue(req, res, next) {
  let eventId = req.params.id;
  try {
    let eventType = eventValueModel.get(eventId).then(function(item){
    res.status(200).json({status: 'success', event_value: item});
  }, function(err) {
    res.status(500).json({status: 'error', message: err.message});
    return;
  });
} catch (e) {
  logger.warn('get EventValue error ', e);
  res.status(500).json({status: 'error', message: e.message});
}

  };

function getEventValues(req, res, next) {
  try {
    let eventType = eventValueModel.list().then(function(items){
      res.status(200).json({status: 'success', event_values: items});
    }, function(err) {
      res.status(500).json({status: 'error', message: err.message});
      return;
    });
  } catch (e) {
    logger.warn('get EventValueList error ', e);
    res.status(500).json({status: 'error', message: e.message});
  }

};

function postEventValue(req, res, next) {
  let eventType = req.body.event_value;
  if ( _E(eventType) || _E(eventType.id) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }
  try {
    eventValueModel.create(eventType).then(function (item) {
      res.status(200).json({status: 'success', event_value: item});
    }, function(err){
      logger.warn('create EventValue error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create EventValue error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function updateEventValue(req, res, next) {
  let eventType = req.body.event_value;
  if ( _E(eventType) || _E(eventType.id) && _E(eventType.values) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }
  let eventId = req.params.id;
  try {
    eventValueModel.update(eventId, eventType).then(function (item) {
      res.status(200).json({status: 'success', event_value: item});
    }, function(err){
      logger.warn('create eventType error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create eventType error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function removeEventValue(req, res, next) {
  let eventId = req.params.id;
  try {
    let eventType = eventValueModel.remove(eventId).then(function(item){
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

