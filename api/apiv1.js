/**
 * @brief Mobile Application logger - server side
 *
 *
 * @copyright Ooma Inc, 2015
 * @author: Yeffry Zakizon
 * @changes: Dmitry Kudryavtsev
 */
var express = require('express');
var app = module.exports = express();
var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var config = require('../config');
var shortid = require('shortid');
var uuid = require('node-uuid');
var LogModel = require('../db/log_model');
var moment = require('moment');
var bcrypt = require('bcrypt');
var async = require('async');
var jwt = require('jsonwebtoken');
var request = require('request');
var decode = require('./decode');
var nonauth_limitation = 1000;

var log_db = LogModel.log_db;
var LogFile = LogModel.LogFile;
var LogFileSession = LogModel.LogFileSession;
var LogUser = LogModel.LogUser;
var LogUserApp = LogModel.LogUserApp;
var LogAuthLim = LogModel.LogAuthLim;
var LogValToken = LogModel.LogValToken;
var LogLogSession = LogModel.LogLogSession;
var LogLogData = LogModel.LogLogData;
var LogEvent = LogModel.LogEvent;
var LogGroup = LogModel.LogGroup;
var getLabelName = decode.getLabelName;
var getEventNameAndType = decode.getEventNameAndType;
var decodeEventValue = decode.decodeEventValue;

var path = require('path');
var oomautil = require('../util/ooma_util');
var done = false;

module.exports.authUserInternal = authUserInternal;
module.exports.getAppInternal = getAppInternal;
module.exports.getSessionsInternal = getSessionsInternal;
module.exports.getDevicesInternal = getDevicesInternal;
module.exports.getLogDataInternal = getLogDataInternal;
module.exports.createAppInternal = createAppInternal;
module.exports.createUserInternal = createUserInternal;

function _E(obj) {
  return oomautil.isEmpty(obj);
}

function _S(obj) {
  if (_E(obj)) {
    return ""
  } else {
    return obj
  }
  ;
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

/* API that called from app server */
app.get('/', index);

app.post('/user', createUser);
app.get('/auth', authUser);

//app.use(checkAuth);

app.get('/user/:id', checkAuth, getUser);
app.delete('/user/:id', checkAuth, deleteUser);

app.post('/app/:groupid', checkAuth, createApp);
app.get('/app/:groupid', checkAuth, getApp);
app.delete('/app/:apikey', checkAuth, deleteApp);

app.post('/session', createSession);
app.post('/log', saveLogData);
app.post('/event', saveEvent);


app.get('/log/:devid', checkAuth, getLogData);



function index(req, res, next) {
  logger.debug('api index');
  res.status(200).send('API Index\r\n');
}

/* middleware check auth */
function checkAuth(req, res, next) {
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
/*
 * Check if API key is found in database
 * input: apikey
 * Output: cb(error, LogUser)
 */
function isAPIKeyValid(apikey, cb) {

  if (apikey == undefined) {
    logger.debug('isAPIKeyValid invalid apikey');
    if (cb) {
      cb(new Error('Invalid apikey'), null);
    }
    ;
  }
  ;


  try {
    var query = {apikey: apikey};

    LogUserApp.findOne(query, function (err, logUserApp) {
      if (err) {
        if (cb) {
          cb(err);
        }
        ;
        return;
      }
      ;

      if (_E(logUserApp)) {
        if (cb) {
          cb(new Error('No record found'), null);
        }
        ;
        return;
      }
      ;

      if (cb) {
        cb(null, logUserApp);
      }
      ;

    });


  } catch (e) {
    logger.warn('isAPIKeyValid exception occured: ', e);
    if (cb) {
      cb(new Error(e.message), null);
    }
    ;

  }
}

/**
 * REST API to authenticate user
 *
 * input body:
 * - username
 * - password
 *
 * output:
 * Return http response
 */

function authUser(req, res, next) {
  authUserInternal(req, res, function (err, logUser) {
    if (err) {
      res.status(err.code).json({status: 'error', message: err.message});
      return;
    }
    res.status(200).json({status: 'success', data: logUser});
  });

}

/**
 * INTERNAL API to authenticate user
 *
 * input
 * - username
 * - password
 *
 * output:
 *  cb(err, user);
 */

function authUserInternal(req, res, cb) {
  var username = req.body.username;
  var password = req.body.password;

  if (_E(username) || _E(password)) {
    if (cb) {
      var error = new Error('Invalid username or password');
      error.code = 403;
      cb(error, null);
    }
    ;
    return;
  }
  ;


  try {
    logger.info('New login with username: ' + username);
    var query = {email: username};

    logger.debug('authUserInternal query: ', query);
    LogUser.findOne(query, function (err, logUser) {
      if (err) {
        if (cb) {
          var error = new Error(err.message);
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;

      if (logUser == null || logUser.length == 0) {
        logger.warn('authUserInternal return no records');
        if (cb) {
          var error = new Error('No record found');
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;
      logger.debug('authUserInternal  ', logUser);

      var match = bcrypt.compareSync(password, logUser.password);
      if (match) {

        /* Update login_expired field */
        LogUser.update({_id: logUser._id}, {$currentDate: {last_login: true}}, {multi: false}, function (err, logUserUpdated) {
          if (err) {
            logger.error('Error while update last_login date for username: ', logUser.username);
          }
          ;

          var authToken = jwt.sign({
            _id: logUser._id,
            username: logUser.username,
            tag: 'mobilelogger'
          }, '00MasecR3t', {expiresInMinutes: 2 * 3600});


          /* Write to request session */
          req.session.username = logUser.username;
          req.session.userid = logUser._id;
          req.session.groupid = logUser.groups[0];
          req.session.auth = 'yes';
          req.session.authToken = authToken;

          var userData = {
            username: logUser.username,
            _id: logUser._id,
            authToken: authToken,
            groups: logUser.groups,
            authToken: authToken
          };
          logger.info('User "%s" authenticated. User data: %s', req.session.username, JSON.stringify(userData, null, 4));
          if (cb) {
            cb(null, userData)
          }
          ;
        });

      } else {
        if (cb) {
          cb(new Error('Password not match', null))
        }
        ;
      }

    });

  } catch (e) {
    logger.warn('authUserInternal exception occured: ', e);
    if (cb) {
      var error = new Error(err.message);
      error.code = 500;
      cb(error, null);
    }
    ;
  }
}


/**
 * PUT API create user
 *
 * input body:
 * - username
 * - password
 * - email
 *
 * output:
 * Return http response
 */

function createUser(req, res, next) {
  createUserInternal(req, function (err, user) {
    if (err) {
      res.status(401).json({status: 'error', mesasge: err.message});
    } else {
      res.status(201).json({status: 'success'});
    }

  });
}

/**
 * INTERNAL API create user
 * We only have one group 'ooma'. This new username will be added to 'ooma' group
 *
 * input:
 * - username
 * - password
 * - email
 *
 * output:
 * cb(err, newuser)
 */

function createUserInternal(req, cb) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  if (_E(username) || _E(password) || _E(email)) {
    if (cb) {
      cb(new Error('Invalid params'));
    }
    return;
  }
  ;

  /* TODO: hash password with bcrypt */
  try {
    /* Look if email has been created */

    var find = LogUser.findOne({email: email});
    find.exec(function (err, user) {
      if (user) {
        logger.error('createUserInternal email: %s is exists', email);
        if (cb) {
          cb(new Error('Email already exists'))
        }
        ;
        return;
      }


      var rounds = 10;
      var salt = bcrypt.genSaltSync(rounds);
      var hash = bcrypt.hashSync(password, salt);
      var logUser = new LogUser({
        username: username,
        password: hash,
        email: email,
        apikey: uuid.v1()
      });
      logger.debug('createUser: ', logUser);

      logUser.save(function (err, logUser) {
        if (err) {
          logger.error('Unable to create new user' + username);
          if (cb) {
            cb(err);
          }
          return;
        }
        ;

        LogGroup.findOneAndUpdate({name: 'ooma'}, {
          ownerid: logUser._id,
          $push: {members: logUser._id}
        }, {upsert: true}, function (err, logGroup) {
          if (err) {
            logger.error('Error updating group');
            if (cb) {
              cb(err);
            }
            return;
          }

          logger.debug('Adding group id to user');
          LogGroup.findOne({name: 'ooma'}, function (err, logGroup) {
            LogUser.findOneAndUpdate({_id: logUser._id}, {$push: {groups: logGroup._id}}, {upsert: false}, function (err, logUser) {
              logUser.groupid = logGroup._id;
              if (cb) {
                cb(null, logUser);
              }
              return;
            });
          });

        });

      });
    });
  } catch (e) {
    logger.error('createUser exception occured: ', e);
    if (cb) {
      cb(new Error(e.message));
    }
  }

}


/** GET API  get user information
 *
 * input params
 * - id (LogUserId)
 *
 */
function getUser(req, res, next) {
  var id = req.params.id;

  if (_E(id)) {
    res.status(403).json({status: 'error', message: 'Invalid id'});
    return;
  }
  ;

  try {

    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {_id: new ObjectId(id)};


    LogUser.findOne(query, function (err, logUser) {
      if (err) {
        res.status(500).json({status: 'error', message: err.message});
        return;
      }
      ;

      logUser.password = '';
      logger.debug('getUser  ', logUser);

      res.status(200).json({status: 'success', data: logUser});
    });


  } catch (e) {
    logger.warn('getUser exception occured: ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
}

/** DELETE API  delete user
 *
 * input params
 * - id (LogUserId)
 *
 */
function deleteUser(req, res, next) {
  var id = req.params.id;

  if (_E(id)) {
    res.status(403).json({status: 'error', message: 'Invalid id'});
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {_id: new ObjectId(id)};


    LogUser.remove(query, function (err, logUser) {
      if (err) {
        res.status(500).json({status: 'error', message: err.message});
        return;
      }
      ;


      res.status(200).json({status: 'success', data: logUser});
    });

  } catch (e) {
    logger.warn('deleteUser exception occured: ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
}


/**
 * POST API Create new application logger
 * @see createAppInternal
 *
 * input params:
 * - groupid (groupid id)
 *
 * input body:
 * - appname (application name)
 * - apptype (alpha, beta, store)
 * - os (Mobile operating system {ios, android, windowsphone, blackberry})
 *
 * output:
 * Return http response
 */
function createApp(req, res, next) {
  logger.debug('createApp');
  createAppInternal(req, function (err, userApp) {
    if (err) {
      res.status(403).json({status: 'error', message: err.message});
      return;
    }
    res.status(201).json({status: 'success', data: {id: userApp._id, apikey: userApp.apikey}});
  });
}

/**
 * POST API Create new application logger
 * Each application will have unique api key.  This api key is used to store log
 *
 * input params:
 * - groupid (groupid)
 *
 * input body:
 * - appname (application name)
 * - apptype (alpha, beta, store)
 * - os (Mobile operating system {ios, android, windowsphone, blackberry})
 *
 * output:
 * cb(err, newApplication)
 */
function createAppInternal(req, cb) {

	var groupid = req.params.groupid;
	var userid = req.body.userid || req.query.userid;

	if (_E(userid) || _E(groupid)) {
		logger.error('Invalid userid or groupid');
		if (cb) { cb(new Error('Invalid userid or groupid'))};
		return;
	};

	var appname = req.body.appname || req.query.appname;
	var apptype = req.body.apptype || req.query.apptype;
	var os = req.body.os || req.query.os;;

	if (_E(appname) || _E(apptype) || _E(os)) {
		logger.error('Invalid params');
		if (cb) { cb(new Error('Invalid params'))};
		return;
	};

	try {
		var ObjectId = require('mongoose').Types.ObjectId;
		var logUserApp = new LogUserApp({
			groupid: new ObjectId(groupid),
			userid: new ObjectId(userid),
			name: appname,
			type: apptype,
			os: os,
			apikey: uuid.v1()
		});

		logUserApp.save(function(err, userApp) {
			if (err) {
				logger.error('Unable to create new app %s. error: %s', appname, err.message);
				if (cb) {cb(err);};
				return;
			};

			logger.debug('create new app success: ', userApp);
			if (cb) { cb(null, userApp)};
			//res.status(201).json({status: 'success', data: { id: userApp._id, apikey: userApp.apikey}});
		});
	} catch (e) {
		logger.error('createUser exception occured: ', e);
		if (cb) {
				var error = new Error(e.message);
				error.code = 500;
				cb(error, null);
			};
	}

}

/* requires params
 * - groupid (group id)
 *
 */
function getApp(req, res, next) {
  var groupid = req.params.groupid;


  getAppInternal(groupid, function (err, logUserApp) {
    if (err) {
      res.status(err.code).json({status: 'error', message: err.message});
      return;
    }
    res.status(200).json({status: 'success', data: logUserApp});
  });
}

/* 
 * Get application information
 * 
 * input:
 * - groupid 
 *
 */
function getAppInternal(groupid, cb) {

  if (_E(groupid)) {
    if (cb) {
      var error = new Error('Invalid groupid');
      error.code = 403;
      cb(error, null);
    }
    ;
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {groupid: new ObjectId(groupid), removed: {$ne: true}};

    var find = LogUserApp.find(query);
    find.sort({os: 1, name: 1});

    find.exec(function (err, logUserApp) {

      if (err) {
        logger.error(err.message);
        if (cb) {
          var error = new Error(err.message);
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;

      if (logUserApp == null || logUserApp.length == 0) {
        if (cb) {
          var error = new Error('No record found');
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;

      logger.debug('getAppInternal  ', logUserApp);

      if (cb) {
        cb(null, logUserApp);
      }
      ;
      //res.status(200).json({status: 'success', data: logUserApp});
    });

  } catch (e) {
    logger.warn('getAppInternal exception occured: ', e);
    if (cb) {
      var error = new Error(e.message);
      error.code = 500;
      cb(error, null);
    }
    ;
    return;
  }
}


/* requires params
 * - userid (logUserId)
 *
 */
function deleteApp(req, res, next) {
  var userid = req.params.userid;


  deleteAppInternal(req, function (err, logUserApp) {
    if (err) {
      res.status(err.code).json({status: 'error', message: err.message});
      return;
    }
    res.status(200).json({status: 'success', data: logUserApp});
  });


}


function deleteAppInternal(req, cb) {

  var apikey = req.params.apikey || req.body.apikey || req.query.apikey;

  if (_E(apikey)) {
    if (cb) {
      var error = new Error('Invalid user apikey');
      error.code = 403;
      cb(error, null);
    }
    ;
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {apikey: apikey};

    LogUserApp.update(query, {removed: true}, {multi: false}, function (err, logUserApp) {
      logger.debug('deleteAppInternal delete: ', logUserApp);
      if (cb) {
        cb(err, logUserApp);
      }
      ;
    });
  } catch (e) {
    logger.warn('deleteAppInternal exception occured: ', e);
    if (cb) {
      var error = new Error(e.message);
      error.code = 500;
      cb(error, null);
    }
    ;
    return;
  }
}
/* Create temporary session, output key is used to validate request 
 * input body
 * - apikey (apikey)
 * - devid (device id)
 * - created_date: Date,
 - os: String, 	// IOS, ANDROID, WP, BLACKBERRY
 - devtype: String, // [iPhone 5s, iPhone 5c, iPhone 6, Nexus 6, galaxy 6]
 - devManufacturer: String, //[Apple, Samsung, HTC]
 - osVersion: String // 8.3, 5.2
 });

 * output:
 * - sessionkey
 */
function createSession(req, res, next) {
  var apikey = req.body.f;
  var devid = req.body.h;
  var os_name = req.body.j;
  var hw_info = req.body.i;
  var devManufacturer = req.body.q;
  var os_version = req.body.o;
  var appVersion = req.body.a;
  var appName = req.body.m;
  var access_token = req.body.w;
  var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (_E(apikey) || _E(devid)) {
    logger.debug('createSession apikey: %s, devid: %s', apikey, devid)
    res.status(403).json({status: 'error', message: 'Invalid params'});
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {apikey: apikey, devid: devid};

    LogUserApp.findOne(query, function (err, logUserApp) {
      if (err) {
        res.status(500).json({status: 'error', message: err.message});
        return;
      }
      ;

      var loginSession = new LogLogSession({
        apikey: apikey,
        devid: devid,
        created_date: Date.now(),
        os_name: os_name,
        hw_info: hw_info,
        devManufacturer: devManufacturer,
        os_version: os_version,
        appVersion: appVersion,
        appName: appName,
        remote_ip: remote_ip
      });
      var req = {loginSession: loginSession};
      if (access_token != undefined) {
        LogValToken.findOne({access_token: access_token}, function (err, acc_token_cb) {
          if (err) {
            logger.error('Checking access token exception occured: ', err);
          }
          if (!acc_token_cb) {
            if (appName.toLowerCase() == 'office') {
              var url_validation_req = 'https://apiv2.ooma.com/v1/preferences?access_token=' + access_token;
            }

            else {
              var url_validation_req = 'https://apiv2.ooma.com/v1/res/preferences/system?access_token=' + access_token;
            }
            request(url_validation_req, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                LogAuthLim.remove({remote_ip: remote_ip}, function (err, res_cb) {
                  if (err) {
                    logger.error('Clear limitation exception occured: ', err);
                  }
                })
                var val_token = new LogValToken({
                  access_token: access_token,
                  devid: devid,
                  ins_date: Date.now()
                })
                val_token.save(val_token, function (err, resp) {
                    if (err) {
                      logger.error('Save access token exception occured: ', err);
                    }
                  }
                )
                saveSessionForValidToken(req, res, function (err, resp) {
                  if (err) {
                    logger.error('Save session  exception occured: ', err);
                  }
                });
              }
              else {
                saveSessionForNotValidToken(req, res, function (err, resp) {
                  if (err) {
                    logger.error('Save session  exception occured: ', err);
                  }
                });
              }
            })
          }
          if (acc_token_cb) {
            LogAuthLim.remove({remote_ip: remote_ip}, function (err, res_cb) {
              if (err) {
                logger.error('Clear limitation exception occured: ', err);
              }
            })
            saveSessionForValidToken(req, res, function (err, resp) {
              if (err) {
                logger.error('Save session  exception occured: ', err);
              }
            });
          }
        })
      }
      else {
        saveSessionForNotValidToken(req, res, function (err, resp) {
          if (err) {
            logger.error('Save session  exception occured: ', err);
          }
        });
      }
    })
  } catch (e) {
    logger.warn('createSession exception occured: ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
}

function saveSessionForValidToken(req, res, cb) {
  var loginSession = req.loginSession;
  var new_loginSession = new LogLogSession({
    apikey: loginSession['apikey'],
    devid: loginSession['devid'],
    created_date: loginSession['created_date'],
    os_name: loginSession['os_name'],
    hw_info: loginSession['hw_info'],
    devManufacturer: loginSession['devManufacturer'],
    os_version: loginSession['os_version'],
    appVersion: loginSession['appVersion'],
    appName: loginSession['appName']
  })
  try {
    new_loginSession.save(new_loginSession, function (err, session) {
      if (err) {
        logger.error('Save session with valid token error: ', err)
        logger.error('Session params: ', new_loginSession)

      }
      ;
      var authToken = jwt.sign({
        _id: session._id,
        apikey: loginSession['apikey'],
        tag: 'mobilelogger',
        'token_access': 1,
        'devid': loginSession['devid']
      }, '00MasecR3t', {expiresInMinutes: 1});
      res.status(201).json({status: 'success', data: {_id: authToken}});
    });
  }
  catch (e) {
    res.status(500).json({status: 'error'});
  }

}

function saveSessionForNotValidToken(req, res, cb) {
  var loginSession = req.loginSession;
  var validation_query = {remote_ip: loginSession['remote_ip']};
  LogAuthLim.findOne(validation_query, function (err, limitation) {
    if (err) {
      res.status(500).json({status: 'error', message: err.message});
      logger.error('Limitation save error : ', err);
      return;
    }
    ;
    if ((!limitation && loginSession['remote_ip'] != undefined ) || limitation['doc_limit'] < nonauth_limitation) {

      if (!limitation) {
        var new_auth_lim = new LogAuthLim({
          devid: loginSession['devid'],
          remote_ip: loginSession['remote_ip'],
          doc_limit: 0
        })
        new_auth_lim.save(new_auth_lim, function (err, limit_save_cb) {
          if (err) {
            logger.error('New Limitation save error : ', err);
          }
          ;
        })
      }

      var new_loginSession = new LogLogSession({
        apikey: loginSession['apikey'],
        devid: loginSession['devid'],
        created_date: loginSession['created_date'],
        os_name: loginSession['os_name'],
        hw_info: loginSession['hw_info'],
        devManufacturer: loginSession['devManufacturer'],
        os_version: loginSession['os_version'],
        appVersion: loginSession['appVersion'],
        appName: loginSession['appName']
      })
      new_loginSession.save(new_loginSession, function (err, session) {
        if (err) {
          res.status(500).json({status: 'error', message: err.message});
          return;
        }
        ;

        logger.debug('createSession  ', session);
        var authToken = jwt.sign({
          _id: session._id,
          apikey: loginSession['apikey'],
          tag: 'mobilelogger',
          'token_access': 0,
          'devid': loginSession['devid']
        }, '00MasecR3t', {expiresInMinutes: 1});
        res.status(201).json({status: 'success', data: {_id: authToken}});
      })
    }
    else {
      logger.info('Session request was rejected, more info :', loginSession)
      res.status(403).json({status: 'error', message: 'You reach limitation for non-auth users'})
    }
  })
}

function getSessionsInternal(req, cb) {

  var apikey = req.params.apikey || req.query.apikey;
  if (_E(apikey)) {
    if (cb) {
      var error = new Error('Invalid user apiKey');
      error.code = 403;
      cb(error, null);
    }
    ;
    return;
  }
  ;

  try {

    var ObjectId = require('mongoose').Types.ObjectId;
    var devid = req.body.devid || req.query.devid;
    var query = {apikey: apikey};
    var page = req.body.page || req.query.page;
    var limit = req.body.limit || req.query.limit;

    if (_E(devid) == false) {
      query.devid = devid
    }
    ;
    logger.debug('getSessionInternal query: ', query);
    var find = LogLogSession.find(query);
    find.sort({created_date: -1});

    if (_E(limit)) {
      limit = 10;
    }
    if (_E(page)) {
      page = 0;
    }

    find.limit(limit);
    find.skip(page * limit);

    find.exec(function (err, logSessions) {
      if (err) {
        if (cb) {
          var error = new Error(err.message);
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;

      if (logSessions == null || logSessions.length == 0) {
        if (cb) {
          var error = new Error('No record found');
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;

      if (cb) {
        cb(null, logSessions);
      }
      ;
    });

  } catch (e) {
    logger.warn('logSessions exception occured: ', e);
    if (cb) {
      var error = new Error(e.message);
      error.code = 500;
      cb(error, null);
    }
    ;
    return;
  }
}

function getDevicesInternal(req, cb) {

  var apikey = req.params.apikey || req.query.apikey;
  if (_E(apikey)) {
    if (cb) {
      var error = new Error('Invalid user apiKey');
      error.code = 403;
      cb(error, null);
    }
    ;
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {apikey: apikey};
    var page = req.body.page || req.query.page;
    var limit = req.body.limit || req.query.limit;

    logger.debug('getDevicesInternal query: ', query);
    var find = LogLogSession.find().distinct("devid", {apikey: apikey});


    find.exec(function (err, logSessions) {
      if (err) {
        if (cb) {
          var error = new Error(err.message);
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;

      if (logSessions == null || logSessions.length == 0) {
        if (cb) {
          var error = new Error('No record found');
          error.code = 403;
          cb(error, null);
        }
        ;
        return;
      }
      ;


      var outSessions = [];
      async.each(logSessions, function (devid, callback) {
        var session;
        var find3 = LogLogSession.findOne({devid: devid}).sort({_id: 1});
        find3.exec(function (err, session) {
          if (!err) {

            var find2 = LogLogData.find().distinct("phone_number", {devid: devid});
            find2.exec(function (err, phone_numbers) {
              if (!err) {
                if (session != undefined) {
                  logger.debug('Got phone_numbers: ', phone_numbers);
                  session.phone_number = phone_numbers;
                } else {
                  session = {devid: devid, phone_number: phone_numbers};
                }
                outSessions.push(session);
              } else {
                logger.error('Find phone_numbers error: ', err.message);
              }

              callback();
            });

          }
        });


      }, function (err) {
        logger.debug('Done getting all phone_number, outSessions: ', outSessions);
        if (cb) {
          /* sort based on latest date */
          outSessions.sort(function (a, b) {
            return b.created_date - a.created_date;
          })
          cb(null, outSessions);
        }
        ;
      });
    });

  } catch (e) {
    logger.warn('getDevicesInternal exception occured: ', e);
    if (cb) {
      var error = new Error(e.message);
      error.code = 500;
      cb(error, null);
    }
    ;
    return;
  }
}
/*	POST API g to database
 * 
 *  input body:
 *  {
 apikey: String,
 sessionid: String,
 devid: String,
 data: [{
 level: int,
 log: String
 }];
 }
 *
 */
function saveLogData(req, res, next) {
  var apikey = req.body.f;
  var sessionid = req.body.s;
  var devid = req.body.h;
  var data = req.body.d;
  var app_version = req.body.a;
  var os_version = req.body.o;
  var app_name = req.body.m;
  var devManufacturer = req.body.q;
  var hw_info = req.body.i;
  var os_name = req.body.j;
  var phone_number = req.body.p;
  var phone_ext = req.body.x;
  var access_token = req.body.w;
  var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (_E(apikey) || _E(devid) || _E(sessionid) || _E(data)) {
    logger.info('saveLogData apikey: %s, devid: %s, sessionid: %s, data: %s', apikey, devid, sessionid, JSON.stringify(data, null, 4));
    res.status(403).json({status: 'error', message: 'Invalid params'});
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;

    jwt.verify(sessionid, '00MasecR3t', function (err, decoded) {
        if (err) {
          res.status(403).json({status: 'error', message: 'Invalid session id', description: err.name});
          return;
        }
        if (decoded.apikey != apikey) {
          res.status(403).json({status: 'error', message: 'Invalid session id'});
          return;
        }
        if (decoded.devid != devid) {
          res.status(403).json({status: 'error', message: 'Invalid session id'});
          return;
        }

        for (var i = 0; i < data.length; i++) {
          if (data[i] == undefined) {
            continue;
          }
          ;

          var logData = new LogLogData({
            sessionid: new ObjectId(decoded._id),
            apikey: apikey,
            devid: devid,
            created_date: Date.now(),
            client_date: new Date(data[i].c * 1000),
            level: data[i].v,
            log: data[i].l,
            processid: data[i].y,
            tag: data[i].g,
            db_id: data[i].b,
            phone_number: phone_number,
            phone_ext: phone_ext,
            // geolocation: data[i].gl,
            // motion: data[i].mo,
            remote_ip: remote_ip,
            local_ip: data[i].r,
            app_version: app_version,
            os_version: os_version,
            app_name: app_name,
            devManufacturer: devManufacturer,
            hw_info: hw_info,
            os_name: os_name

          });
          logData.save(function (err, log) {
            if (err) {
              logger.error('saveLog exception occured: ', err, 'inc data: ', req.body);
            }
            ;
            if (decoded.token_access == 0 && !err) {
              LogAuthLim.findOneAndUpdate({remote_ip: remote_ip}, {
                $inc: {doc_limit: 1},
                devid: devid
              }, function (err, res_cb) {
                if (err) {
                  logger.error('saveLog exception occured: ', err, 'inc data: ', req.body);
                }
              })
            }
          });
        }
        ;
        res.status(200).json({status: 'success'});
      }
    )

  } catch (e) {
    logger.warn('saveLogData exception occured: ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
}


/*
 *  input body:
 *  { 
 sessionid: String,
 devid: String
 data: [{
 event_name: ,
 event_data: { 	action: String,
 label: String,
 value: String
 },
 tag: String,
 phone_number: String,
 phone_ext: String,
 local_ip: String
 }];
 }
 *
 */
function saveEvent(req, res, next) {
  var apikey = req.body.f;
  var sessionid = req.body.s;
  var devid = req.body.h;
  var data = req.body.d;
  var app_version = req.body.a;
  var os_version = req.body.o;
  var app_name = req.body.m;
  var devManufacturer = req.body.q;
  var hw_info = req.body.i;
  var os_name = req.body.j;
  var phone_number = req.body.p;
  var phone_ext = req.body.x;
  var access_token = req.body.w;
  var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


  if (_E(apikey) || _E(devid) || _E(sessionid) || _E(data)) {
    res.status(403).json({status: 'error', message: 'Invalid params'});
    return;
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    jwt.verify(sessionid, '00MasecR3t', function (err, decoded) {
      if (err) {
        res.status(403).json({status: 'error', message: 'Invalid session id', description: err.name});
        return;
      }
      if (decoded.apikey != apikey) {
        res.status(403).json({status: 'error', message: 'Invalid session id'});
        return;
      }
      if (decoded.devid != devid) {
        res.status(403).json({status: 'error', message: 'Invalid session id'});
        return;
      }

      for (var i = 0; i < data.length; i++) {
        if (data[i] == undefined) {
          continue;
        }
        ;
        var logEvent = null;
        var decode_event = [];
        var event_data = null;
        var event_data_array = [];
        try {
          event_data = data[i].e;
        } catch (e) {
          logger.warn('saveEvent exception occured: ', e);
          continue;
        }
        for (var j = 0; j < event_data.length; j++) {
          try {
            var call_duration;
            var remote_number;
            var call_direction;
            event_data_array.push({
              label: getLabelName(event_data[j].z),
              value: decodeEventValue(event_data[j].z, event_data[j].k)
            })
            // this is experemental block of code , to move out call_duration and remote phone_number from array to main body

            if (data[i].t == 30010) { // for RT_CALL_END

              if (getLabelName(event_data[j].z) == 'Remote number') {
                remote_number = event_data[j].k;
                event_data_array.pop()
              }
              if (getLabelName(event_data[j].z) == 'Call duration') {
                call_duration = event_data[j].k;
                event_data_array.pop()
              }
              if (getLabelName(event_data[j].z) == 'Call direction') {
                call_direction = decodeEventValue(event_data[j].z, event_data[j].k);
                event_data_array.pop()
              }
            }
            else {
              call_duration = undefined;
              remote_number = undefined;
              call_direction = undefined;
            }
            // end

          } catch (e) {
            logger.warn('saveEvent exception occured: ', e);
            continue;
          }
        }
        if (data[i].t == undefined) {
          data[i].t = 99999;
        }
        decode_event = getEventNameAndType(data[i].t)


        logEvent = new LogEvent({
          sessionid: new ObjectId(decoded._id),
          devid: devid,
          created_date: Date.now(),
          client_date: new Date(data[i].c * 1000),
          event_name: decode_event[1],
          event_type: decode_event[0],
          event_data: event_data_array,
          tag: data[i].g,
          db_id: data[i].b,
          phone_number: phone_number,
          phone_ext: phone_ext,
          remote_number: remote_number,
          call_duration: call_duration,
          call_direction: call_direction,
          // geolocation: data[i].gl,
          // motion: data[i].mo,
          remote_ip: remote_ip,
          local_ip: data[i].r,
          app_version: app_version,
          os_version: os_version,
          app_name: app_name,
          devManufacturer: devManufacturer,
          hw_info: hw_info,
          os_name: os_name

        });
        logEvent.save(function (err, log) {
          if (err) {
            logger.error('saveEvent exception occured: ', err)
          }
          ;
          if (decoded.token_access == 0 && !err) {
            LogAuthLim.findOneAndUpdate({remote_ip: remote_ip}, {
              $inc: {doc_limit: 1},
              devid: devid
            }, function (err, res_cb) {
              if (err) {
                logger.error('saveLog exception occured: ', err, 'inc data: ', req.body);
              }
            })
          }
          ;
        });
      }
      res.status(200).json({status: 'success'});
    });
  } catch (e) {
    logger.warn('saveEvent exception occured: ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
}

function levelToString(level) {
  switch (level) {
    case 0:
      return 'EMERGENCY';
      break;
    case 1:
      return 'ALERT';
      break;
    case 2:
      return 'CRITICAL';
      break;
    case 3:
      return 'ERROR';
      break;
    case 4:
      return 'WARNING';
      break;
    case 5:
      return 'NOTICE';
      break;
    case 6:
      return 'INFO';
      break;
    case 7:
      return 'DEBUG';
      break;
    default:
      return 'UNKNOWN';
      break;
  }
}


/* GET API Get Log Data
 * requires params
 * - devid
 * - format (html/json)
 *
 * requires body:
 * - format (html/json)
 * - start_date
 * - end_date
 * - today
 * - phone_number
 * - phone_extension
 *
 */

function getLogData(req, res, next) {
  var devid = req.params.devid;
  var format = req.body.format;
  var start_date = req.body.start_date;
  var end_date = req.body.end_date;
  var today_only = req.body.today_only;
  var phone_number = req.body.phone_number;
  var phone_extension = req.body.phone_extension;

  if (_E(devid)) {
    res.status(403).json({status: 'error', message: 'Invalid devid'});
    return;
  }
  ;

  if (_E(format)) {
    format = 'html';
  }
  ;

  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {devid: devid};

    if (_E(phone_number) == false) {
      query.phone_number = phone_number;
    }
    if (_E(phone_extension) == false) {
      query.phone_extension = phone_extension;
    }
    if (_E(today_only) == false && today_only == 'yes') {
      var today = moment().startOf('day');
      var tomorrow = moment(today).add(1, 'days');
      logger.debug('today only = yes');

      query.client_date = {$gte: today.toDate(), $lt: tomorrow.toDate()}
    }
    ;

    if (_E(start_date) == false) {
      var d = parseInt(start_date, 10);
      var today = moment().startOf('day');
      if (d < 0) {
        end_date = moment(today).subtract(d, 'days').toDate();
      }
      ;
      if (_E(end_date)) {

        end_date = moment(today).add(1, 'days').toDate();
      }
      logger.debug('start_date = ', start_date);
      logger.debug('end_date = ', end_date);

      query.client_date = {$gte: new Date(start_date), $lt: new Date(end_date)};
    }


    //logger.debug('getLogData query: ', query);

    var find = LogLogData.find(query);
    find.exec(function (err, logdata) {
      if (err) {
        res.status(500).json({status: 'error', message: err.message});
        return;
      }
      ;

      if (format === 'json') {
        res.status(200).json({status: 'success', data: logdata});
        return;
      }

      res.writeHead(200, {'Content-Type': 'text/html'});


      for (var i = 0; i < logdata.length; i++) {
        var data = logdata[i];

        if (data.tag == 'sip') {
          res.write('<ul style="background-color: #FFBBCC;" >');
        } else {
          if (i % 2 == 0) {
            res.write('<ul style="background-color: #FFCCFF;" >');
          } else {
            res.write('<ul style="background-color: #99FFCC;" >');
          }
        }

        res.write('<li style="font-size:14;"> <pre> [' + levelToString(data.level) + '] [Date: ' + data.client_date + '] [local_ip: ' + data.local_ip + '] [remote_ip: ' + data.remote_ip + '] [phone_number: ' + data.phone_number + '] [ext: ' + data.phone_ext + '] [tag: ' + data.tag + '] </pre> </li>');
        res.write('<pre>' + data.log + '</pre>');

        res.write('</ul>');
      }

      res.end();
    });

  } catch (e) {
    logger.warn('getLog exception occured: ', e);
    res.status(500).json({status: 'error', message: e.message});
  }
}

function getLogDataInternal(req, cb) {
  var apikey = req.params.apikey;
  var sessionid = req.body.sessionid || req.query.sessionid;
  var devid = req.body.devid || req.query.devid;
  var start_date = req.body.start_date || req.query.start_date;
  var end_date = req.body.end_date || req.query.end_date;
  var today_only = req.body.today_only || req.query.today_only;
  var phone_number = req.body.phone_number || req.query.phone_number;
  var phone_extension = req.body.phone_extension || req.query.phone_extension;
  var tag = req.body.tag || req.query.tag;
  var severity = req.body.severity || req.query.severity;
  var log_text = req.body.log_text || req.query.log_text;
  var page = req.body.page || req.query.page;
  var limit = req.body.limit || req.query.limit;

  if (_E(apikey)) {
    res.status(403).json({status: 'error', message: 'Invalid apikey'});
    return;
  }
  ;


  try {
    var ObjectId = require('mongoose').Types.ObjectId;
    var query = {apikey: apikey};
    if (_E(devid) == false) {
      query.devid = devid;
    }
    ;

    if (_E(sessionid) == false) {
      query.sessionid = sessionid;
    }
    if (_E(phone_number) == false) {
      query.phone_number = phone_number;
    }
    if (_E(phone_extension) == false) {
      query.phone_ext = phone_extension;
    }
    if (_E(today_only) == false && today_only == 'yes') {
      var today = moment().startOf('day');
      var tomorrow = moment(today).add(1, 'days');
      query.client_date = {$gte: today.toDate(), $lt: tomorrow.toDate()}
    }
    ;

    if (_E(log_text) == false) {
      query.$text = {$search: log_text};
    }

    var s = parseInt(start_date, 10);
    var e = parseInt(end_date, 10);
    var today = moment().startOf('day');

    if (s != undefined && s != NaN) {
      start_date = moment(today).subtract(s, 'days').toDate();
    } else {
      start_date = today;
    }
    if (e != undefined && !isNaN(e)) {
      if (e == 0) {
        end_date = moment(today).add(1, 'days').toDate();
      } else {
        end_date = moment(today).subtract(e, 'days').toDate();
      }
    } else {
      if (_E(end_date)) {
        end_date = moment(today).add(1, 'days').toDate();
      }
    }

    if (_E(sessionid) && _E(start_date) == false) {
      query.client_date = {$gte: new Date(start_date), $lt: new Date(end_date)};
    }


    if (_E(tag) == false) {
      query.tag = tag;
    }
    if (_E(severity) == false && severity != "-1") {
      query.level = severity;
    }
    logger.debug('getLogData query: ', query);


    var find = LogLogData.find(query).sort({_id: 1, sessionid: 1, client_date: 1});

    if (_E(limit)) {
      limit = 500;
    }
    if (limit == "0") {
      limit = Number.MAX_VALUE
    }
    ;

    LogLogData.count(query, function (err, count) {
      if (err) {
        logger.error(err);
        if (cb) {
          cb(err, null);
        }
        ;
        return;
      }
      ;


      var skip = 0;
      if (page != undefined && page == "last") {
        skip = count - limit;

        page = Math.ceil(count / limit);
      } else {
        if (_E(page) || parseInt(page, 10) < 0) {
          page = 0;
        }

        skip = parseInt(page, 10) * limit;
        if (skip >= count) {
          skip = count - limit;
        }
        ;
      }

      if (count <= limit) {
        skip = 0;
      }

      find.limit(limit);
      find.skip(skip);

      find.exec(function (err, logdata) {
        if (err) {
          if (cb) {
            var error = new Error(err.message);
            error.code = 500;
            cb(error, null);
          }
          ;
          return;
        }
        ;
        if (cb) {
          cb(null, logdata, page);
        }
        ;
      });

    });

  } catch (e) {
    logger.warn('getLog exception occured: ', e);
    if (cb) {
      var error = new Error(e.message);
      error.code = 500;
      cb(error, null);
    }
    ;
  }

}

