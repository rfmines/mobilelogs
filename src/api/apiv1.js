/**
 * @brief Mobile Application logger - server side
 *
 * @copyright Ooma Inc, 2015
 * @author: Yeffry Zakizon
 * @changes: Dmitry Kudryavtsev
 */

let express = require('express');
let app = module.exports = express();
let logger = require('./../util/logger').getlogger('api.apiv1');
let config = require('../config');
let session = require('./session');
let events = require('./events');
let jwt = require('jsonwebtoken');
let apps = require('./uiApps');
let users = require('./uiUser');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// main routes for apiv1
app.get('/', index);

app.post('/session', session.createSession);
app.post('/event', session.validateSession,events.saveEvents);

app.post('/user', users.createUser);
app.get('/auth', users.authUser);
app.get('/user/:id', checkUiAuth, users.getUser);
app.delete('/user/:id', checkUiAuth, users.deleteUser);

app.post('/app/:groupid', checkUiAuth, apps.createApp);
app.get('/app/:groupid', checkUiAuth, apps.getApp);
app.delete('/app/:apikey', checkUiAuth, apps.deleteApp);



function index(req, res, next) {
    logger.debug('api v1 index');
    res.status(200).send('API v1 Index\r\n');
}

/* middleware check auth */
function checkUiAuth(req, res, next) {
    let bearerHeader = req.headers["authorization"];
    let auth = req.session.auth;
    let authToken = req.session.authToken;
    logger.debug('authToken0: ', authToken);

    if (typeof bearerHeader !== 'undefined') {
        let bearer = bearerHeader.split(" ");
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