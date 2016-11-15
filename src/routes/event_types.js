"use strict";
const express = require('express');
const app = module.exports = express();
const log4js = require('log4js');
const logger = log4js.getLogger('applog');
const eventTypeModel = require('../db/event_type_model');
const auth = require('../modules/auth');

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

    let eventId = req.params.id;
    try {
      let eventType = eventTypeModel.get(eventId).then((item) => {
        res.status(200).json({status: 'success', event_type: item});
      }).catch((err) => {
        res.status(500).json({status: 'error', message: err.message});
        return;
      });
    } catch (e) {
      logger.warn('get EventType error ${e}', e);
      res.status(500).json({status: 'error', message: e.message});
    }

  };

  function getEventTypes(req, res, next) {

    try {
      let eventType = eventTypeModel.list().then((items) => {
        res.status(200).json({status: 'success', event_types: items});
      }).catch((err) => {
        res.status(500).json({status: 'error', message: err.message});
        return;
      });
    } catch (e) {
      logger.warn('get EventTypeList error ${e}', e);
      res.status(500).json({status: 'error', message: e.message});
    }

  };

  function postEventType(req, res, next) {
    let eventType = req.body.event_type;
    if (_E(eventType) || _E(eventType.id) || _E(eventType.name)) {
      res.status(406).json({status: 'error', message: 'Not Acceptable'});
      return;
    }
    try {
      eventTypeModel.create(eventType).then((item) => {
        res.status(200).json({status: 'success', event_type: item});
      }).catch((err) => {
        logger.warn('create EventType error ${err}', err);
        res.status(500).json({status: 'error', message: err.message});
      });
    } catch (err) {
      logger.warn('create EventType error ${err}', err);
      res.status(500).json({status: 'error', message: err.message});
    }
  };

  function updateEventType(req, res, next) {
    let eventType = req.body.event_type;
    if (_E(eventType) || _E(eventType.id) && _E(eventType.name)) {
      res.status(406).json({status: 'error', message: 'Not Acceptable'});
      return;
    }
    let eventId = req.params.id;
    try {
      eventTypeModel.update(eventId, eventType).then((item) => {
        res.status(200).json({status: 'success', event_type: item});
      }).catch((err) => {
        logger.warn('create eventType error ${err}', err);
        res.status(500).json({status: 'error', message: err.message});
      });
    } catch (err) {
      logger.warn('create eventType error ${err}', err);
      res.status(500).json({status: 'error', message: err.message});
    }
  };

  function removeEventType(req, res, next) {

    let eventId = req.params.id;
    try {
      let eventType = eventTypeModel.remove(eventId).then((item) => {
        res.status(200).json({status: 'success'});
      }).catch((err) => {
        res.status(500).json({status: 'error', message: err.message});
        return;
      });
    } catch (e) {
      logger.warn('delete event type error ${e}');
      res.status(500).json({status: 'error', message: e.message});
    }
  };


