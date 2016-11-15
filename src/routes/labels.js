var express = require('express');
var app = module.exports = express();
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var labelModel = require('../db/label_model');
var auth = require('../modules/auth');

app.get('/', auth.checkAuth, getLabels);
app.get('/:id', auth.checkAuth, getLabel);
app.post('/', auth.checkAuth, postLabel);
app.put('/:id', auth.checkAuth, updateLabel)
app.delete('/:id', auth.checkAuth, removeLabel);

/* Is empty */
function _E(obj) {
  if (obj === undefined || obj === null || obj === "") {
    return true;
  }
  return false;
};

function getLabel(req, res, next) {
  var labelId = req.params.id;
  try {
    label = labelModel.get(labelId).then(function(item){
      res.status(200).json({status: 'success', label: item});
    }, function(err) {
      res.status(500).json({status: 'error', message: err.message});
      return;
    });
  } catch (e) {
    logger.warn('get Label error ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
};

function getLabels(req, res, next) {
  try {
    labelModel.list().then(function (items) {
      res.status(200).json({status: 'success', labels: items});
    }, function(err){
      logger.warn('get Labels error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('get Labels error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function postLabel(req, res, next) {
  var label = req.body.label;
  if ( _E(label) || _E(label.id) || _E(label.name) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }

  try {
    labelModel.create(label).then(function (item) {
      res.status(200).json({status: 'success', label: item});
    }, function(err){
      logger.warn('create Label error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create Label error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function updateLabel(req, res, next) {
  var label = req.body.label;
  if ( _E(label) || _E(label.id) && _E(label.name) ) {
    res.status(406).json({status: 'error', message: 'Not Acceptable'});
    return;
  }
  var labelId = req.params.id;
  try {
    labelModel.update(labelId, label).then(function (item) {
      res.status(200).json({status: 'success', label: item});
    }, function(err){
      logger.warn('create Label error ', err);
      res.status(500).json({status: 'error', message: err.message});
    });
  } catch (err) {
    logger.warn('create Label error ', err);
    res.status(500).json({status: 'error', message: err.message});
  }
};

function removeLabel(req, res, next) {
  var labelId = req.params.id;
  try {
    label = labelModel.remove(labelId).then(function(item){
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
