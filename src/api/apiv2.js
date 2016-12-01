/*
This is new api requested by mobile team . Bug
 */
var express = require('express');
var logger = require('./../util/logger').getlogger('api.apiv2');
var app = module.exports = express();
var session = require('./session');
var events = require('./events');

app.get('/', index);
app.post('/session', session.createSession);
app.post('/event', session.validateSession,events.saveEvents);

function index(req, res) {
  logger.debug('api v2 index');
  res.status(200).send('API  v2 Index\r\n');
}