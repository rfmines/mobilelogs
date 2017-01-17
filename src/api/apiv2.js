/*
This is new api requested by mobile team . Bug
 */
let express = require('express');
let logger = require('./../util/logger').getlogger('api.apiv2');
let app = module.exports = express();
let session = require('./session');
let events = require('./events');

app.get('/', index);
app.post('/session', session.createSession);
app.post('/event', session.validateSession,events.saveEvents);

function index(req, res) {
  logger.debug('api v2 index');
  res.status(200).send('API  v2 Index\r\n');
}