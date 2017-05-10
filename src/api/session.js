let request = require('request');
let jwt = require('jsonwebtoken');
let logger = require('./../util/logger').getlogger('api.session');
let _E = require('./../util/ooma_util').isEmpty;
let db = require('./../db');
let dictionary = require('./dictionary');
let config = require('./../config');
let nonAuthLimitation;
if (config.env ==='devel'){
    logger.debug('Setting nonauth document limitation ='+1000+' for env = '+config.env);
   nonAuthLimitation = 100000000000;
} else{
    logger.debug('Setting nonauth document limitation ='+1000+' for env = '+config.env);
   nonAuthLimitation = 1000; // number of events(document) allowed to upload without token for IP address
}

// Create temporary session, output key is used to validate further requests

exports.createSession = function createSession(req, res) {
  let apiKey = req.body.f || req.body.apiKey || req.body.api_key;
  let devId = req.body.h || req.body.hwId || req.body.devId || req.body.dev_id;
  let osName = req.body.j || req.body.osName || req.body.os_name;
  let hwInfo = req.body.i || req.body.hwInfo || req.body.hw_info;
  let devManufacturer = req.body.q || req.body.devManufacturer|| req.body.dev_manufacturer;
  let osVersion = req.body.o || req.body.osVersion || req.body.os_version;
  let appVersion = req.body.a || req.body.appVersion || req.body.app_version;
  let appName = req.body.m || req.body.appName || req.body.app_name;
  let accessToken = req.body.w || req.body.accessToken || req.body.access_token;
  let node = req.body.node;
  let remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  try {

    if (_E(apiKey) || _E(devId)) {
      logger.debug('createSession failed apikey: %s, devid: %s', apiKey, devId);
      res.status(403).json({status: 'error', message: 'Invalid params in incoming request'});
      return;
    }
    
    db.userApps.get({apikey: apiKey}).then(function (userApp) {

      
      let newSession = {
        apikey: apiKey,
        apikey_type: userApp[0].type,
        devid: devId,
        created_date: Date.now(),
        os_name: osName,
        hw_info: hwInfo,
        devManufacturer: devManufacturer,
        os_version: osVersion,
        appVersion: appVersion,
        appName: appName,
        node: node,
        remote_ip: remoteIp,
        access_token: accessToken
      };
      
      if (accessToken !== undefined && accessToken !== null) {
        // access token exists in request body , need to check it
        logger.debug('Tryin to validate token %s for node %s',accessToken,node);
        db.accessTokens.get({access_token: accessToken}).then(function (accessToken) {
          if (accessToken.length === 0) {
            logger.debug('Token %s not found in local db, validating it on webapi',newSession.access_token);
            // Access token not found locally . Need to validate it on WebApi
            let webApiAddress,webApiPath;
            if (node){
              webApiAddress = dictionary.webApiNodeAddresses[node.toLowerCase()];
            }
            if (appName){
              webApiPath = dictionary.webApiValidationPaths[appName.toLowerCase()];
            }
            if (!webApiAddress){
              // old format without node Name , all request must be forwarded on prod
              webApiAddress = dictionary.webApiNodeAddresses.production;}
            if (!webApiPath){
              // mobile app has a lot of possible names
              // also mobile team from time to time for testing purposes changes app name
              // mostly all these names is for mobile app
              webApiPath = dictionary.webApiValidationPaths.mobile;}

            let validationUrl = webApiAddress + webApiPath + newSession.access_token;
            logger.debug('Validation url :'+validationUrl);
            request(validationUrl, function (err, response) {
              if (err) {
                throw err;
              } else {
                if (response.statusCode === 200) {
                  logger.debug('Webapi approved token %s ',newSession.access_token);
                  // Token is valid , it must be saved locally
                  db.accessTokens.create({
                    devid: devId, access_token: newSession.access_token
                  }).then(function (success) {
                    // Token saved , creating new session for valid token
                    saveSessionForValidToken(newSession, res);
                    // This is successful auth event
                    // Have to delete limitations for this remoteIp address , if they are exists
                    db.authIpLimitations.remove(remoteIp).then(function (removed) {
                      // if limitations for remote IP was in database
                      // App removed it , because of success authorization from this ip

                    }, function (err) {
                      logger.error('Error occurred , while trying to remove ip limitations.' + err);
                    })
                  }, function (err) {
                    throw err;
                  })
                } else {
                  // access token exists is request , but didn't pass validation on WebApi
                  logger.warn('Token validation %s on webApi failed.Validation url %s' ,newSession.access_token, validationUrl);

                  saveSessionForNotValidToken(newSession, res);
                }
              }
            });
          }
          else {
            // access token was found locally
            // creating new valid session
            logger.debug('Token %s found locally in database ',newSession.access_token);
            saveSessionForValidToken(newSession, res);
            // token is valid in request
            // trying to remove ipLimitations for  remote ip address from request
            db.authIpLimitations.remove(remoteIp).then(function (removed) {

            }, function (err) {
              logger.error('Error occurred , while trying to remove ip limitations.' + err);
            });
            
          }
        }, function (err) {
          if (err) {
            logger.error('Error occurred while looking for access_token ' + accessToken);
            throw err;
          }
        });
      } else {
        // token was not found in the request body
          logger.debug('Access Token not found in request');
        saveSessionForNotValidToken(newSession, res);
      }
    }, function (err) {
      logger.debug('ApiKey validation failed. ApiKey : ' + apiKey);
      res.status(403).json({status: 'error', message: err});
    }).catch(function (err) {
      throw err;
    });
  } catch (e) {
    logger.warn('createSession exception occured: ', e);
    
    res.status(500).json({status: 'error', message: e.message});
  }
};

function saveSessionForValidToken(newSession, res) {
  
  try {
    db.session.create(newSession).then(function (sessionDocument) {
      let authToken = jwt.sign({
        _id: sessionDocument._id,
        apikey: newSession.apikey,
        tag: 'mobilelogger',
        token_access: 1,
          node:newSession.node,
        devid: newSession.devid
      }, '00MasecR3t', {expiresIn: 60}); // valid only 1 minute
      logger.debug('New session was created for token %s. Session_id %s',newSession.access_token,sessionDocument._id);
      res.status(201).json({status: 'success', data: {_id: authToken}});
    }, function (err) {
      logger.error('Error occurred when trying to create new session for valid token.Error :' + err);
      throw err;
    })
  }
  catch (e) {
    res.status(500).json({status: 'Internal error'});
  }
  
}

function saveSessionForNotValidToken(newSession, res) {
  try {
    
    let validation_query = {remote_ip: newSession.remote_ip};
    db.authIpLimitations.get(validation_query).then(function (limitations) {
      logger.debug('Checking remote ip %s in database for limitations',newSession.remote_ip );

      if ((!limitations[0] && newSession.remote_ip !== undefined && newSession.remote_ip !== null ) || (limitations[0].doc_limit < nonAuthLimitation)) {
        // Limitation do not exists or number of uploaded documents less then limitation on it
        if (!limitations) {
          logger.debug('Limitations for IP %s was not found.Creating new session ',newSession.remote_ip);
          let newLimitation = {
            devid: newSession.devid,
            remote_ip: newSession.remote_ip,
            doc_limit: 0
          };
          db.authIpLimitations.create(newLimitation).then(function (newLimitation) {
          }, function (err) {
            logger.error('Error occurred while trying to save new limitations for IP address %s. ',newSession.remote_ip);
            logger.error('Document :' + JSON.stringify(newLimitation));
            logger.error('Error :' + err);
          })
        }
        // In parallel creating new session
        db.session.create(newSession).then(function (sessionDocument) {
          let authToken = jwt.sign({
            _id: sessionDocument._id,
            apikey: newSession.apikey,
            tag: 'mobilelogger',
            token_access: 0,
            devid: newSession.devid
          }, '00MasecR3t', {expiresIn: 60}); // valid only 1 minute

          res.status(201).json({status: 'success', data: {_id: authToken}});
        }, function (err) {
          logger.error('Error occurred when trying to create new session for NOT valid token.Error :' + err);
          throw err;
        });
      }
      else {
        logger.debug('Sending reject for creating session. Limitation was reached for this IP address ' + JSON.stringify(limitations));
        res.status(403).json({status: 'error', message: 'You reach limitation for non-auth users'})
      }
    }, function (err) {
      logger.error('Error occurred while trying to fetch limitations from database.Error : ' + err);
      throw err;
    })
    
  } catch (e) {
    res.status(500).json({status: 'Internal error'});
  }
}

exports.validateSession = function validateSession(req, res, next) {
  try {
    
    let apiKey = req.body.f || req.headers.apiKey || req.headers.apikey || req.body.apiKey || req.body.api_key || req.headers.api_key;
    let sessionId = req.body.s || req.headers.sessionId || req.headers.sessionid || req.body.sessionId;
    let devId = req.body.h || req.headers.hwId || req.headers.hwid || req.body.hwId;
    let data = req.body.d || req.body.events;

    if (_E(apiKey) || _E(sessionId) || _E(devId) || _E(data)) {
      res.status(403).json({status: 'Error', message: 'Invalid incoming params'});
      return;
    } else {
      jwt.verify(sessionId, '00MasecR3t', function (err, decoded) {
        if (err) {
          res.status(403).json({status: 'error', message: 'SessionId is not valid', description: err.name});
          return;
        }
        if (decoded.apikey !== apiKey || decoded.devid !== devId) {
          res.status(403).json({status: 'error', message: 'SessionId do not match with other params '});
          return;
        } else {
          // sessionId is valid
          // adding in request information about
          req.body.tokenAccess = decoded.token_access;
          req.body.sessionId = decoded._id;
          req.body.devid = decoded.devid;
          req.body.node=decoded.node;
          next();
        }
      });
    }
  } catch (e) {
    logger.error('Error occurred.Error : ' + e);
    res.status(500).json({status: 'Error', message: 'Internal error'})
  }
};
