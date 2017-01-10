/**
 * @brief Mobile Application logger - server side
 *
 *
 * @copyright Ooma Inc, 2015
 * @author: Yeffry Zakizon
 * @changes: Dmitry Kudryavtsev
 */
// TODO : split this file into 2(maybe more) module , because this file is too big
  // 1) UI api ( for users auth , creating users etc.)
  // 2) UI get data ( query data from UI)
  // 3) Data logging ( create CSL session , store logs/events etc)
let express = require('express');
let app = module.exports = express();
let logger = require('./../util/logger').getlogger('api.apiv1');
let config = require('../config');
let session = require('./session');
let events = require('./events');
const nonauth_limitation = 1000;

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});


app.get('/', index);

//app.post('/user', createUser);
//app.get('/auth', authUser);

app.post('/session', session.createSession);
app.post('/event', session.validateSession,events.saveEvents);

//app.get('/user/:id', checkUiAuth, getUser);
//app.delete('/user/:id', checkUiAuth, deleteUser);

//app.post('/app/:groupid', checkUiAuth, createApp);
//app.get('/app/:groupid', checkUiAuth, getApp);
//app.delete('/app/:apikey', checkUiAuth, deleteApp);

function _E(obj) {
    return oomautil.isEmpty(obj);
}

function index(req, res, next) {
    logger.debug('api v1 index');
    res.status(200).send('API v1 Index\r\n');
}

/* middleware check auth */
function checkUiAuth(req, res, next) {
    var bearerHeader = req.headers["authorization"];
    var auth = req.session.auth;
    var authToken = req.session.authToken;
    logger.debug('authToken0: ', authToken);

    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        authToken = bearer[1];
        logger.debug('auth header: ', bearerHeader);
    }

    if (authToken) {
        try {

            jwt.verify(authToken, '00MasecR3t', function (err, decoded) {

                if (err) {
                    res.status(403).json({status: 'error', message: 'Invalid authentication: ' + err.name});
                    return;
                }
                ;

                if (decoded.tag == undefined ||
                    decoded.tag !== 'mobilelogger') {
                    res.status(403).json({status: 'error', message: 'Invalid authentication'});
                    return;
                }

                req.token = authToken;
                next();
                return;
            });

        } catch (e) {
            logger.error('checkAuth error: ', e.message);
            res.status(403).json({status: 'error', message: 'Invalid authentication'});
            return;
        }
    } else if (auth == undefined || auth != 'yes') {
        logger.error('Invalid authentication');
        res.status(403).json({status: 'error', message: 'Invalid authentication'});
        return;
    } else {
        res.status(403).json({status: 'error', message: 'Invalid authentication'});
        return;
    }

};





var uuid = require('node-uuid');
var LogModel = require('../db/log_model');
var moment = require('moment');
var bcrypt = require('bcrypt');
var async = require('async');
var jwt = require('jsonwebtoken');
var request = require('request');
var decode = require('./decode');



var path = require('path');
var oomautil = require('../util/ooma_util');

//module.exports.authUserInternal = authUserInternal;
//module.exports.getAppInternal = getAppInternal;
//module.exports.getSessionsInternal = getSessionsInternal;
//module.exports.getDevicesInternal = getDevicesInternal;
//module.exports.getLogDataInternal = getLogDataInternal;
//module.exports.createAppInternal = createAppInternal;
//module.exports.createUserInternal = createUserInternal;