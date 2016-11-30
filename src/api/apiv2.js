/*
This is new api requested by mobile team . Bug
 */
var express = require('express');
var app = module.exports = express();
var session = require('./session');
var events = require('./events');

app.post('/session', session.createSession);
app.post('/event', session.validateSession,events.saveEvents);
