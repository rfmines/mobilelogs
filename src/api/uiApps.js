let logger = require('./../util/logger').getlogger('api.uiApps');
let oomautil = require('./../util/ooma_util');
let userApps = require('./../db/userApp');
function _E(obj) {
    return oomautil.isEmpty(obj);
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
exports.createApp =function createApp(req, res, next) {
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
exports.createAppInternal = function createAppInternal(req, cb) {

    let groupid = req.params.groupid;
    let userid = req.body.userid || req.query.userid;

    if (_E(userid) || _E(groupid)) {
        logger.error('Invalid userid or groupid');
        if (cb) {
            cb(new Error('Invalid userid or groupid'))
        }
        return;
    }

    let appname = req.body.appname || req.query.appname;
    let apptype = req.body.apptype || req.query.apptype;
    let os = req.body.os || req.query.os;

    if (_E(appname) || _E(apptype) || _E(os)) {
        logger.error('Invalid params');
        if (cb) {
            cb(new Error('Invalid params'))
        }
        return;
    }

    try {
        let ObjectId = require('mongoose').Types.ObjectId;
        let logUserApp = {
            groupid: new ObjectId(groupid),
            userid: new ObjectId(userid),
            name: appname,
            type: apptype,
            os: os,
            apikey: uuid.v1()
        };

        userApps.create(logUserApp)
            .then(function(createResult){
                logger.debug('create new app success: ', createResult);
                if (cb) {
                    cb(null, userApp)
                }
            });

    } catch (e) {
        logger.error('createUser exception occured: ', e);
        if (cb) {
            let error = new Error(e.message);
            error.code = 500;
            cb(error, null);
        }
    }
};

/* requires params
 * - groupid (group id)
 *
 */
exports.getApp = function getApp(req, res, next) {
    let groupid = req.params.groupid;

    getAppInternal(groupid, function (err, logUserApp) {
        if (err) {
            res.status(err.code).json({status: 'error', message: err.message});
            return;
        }
        res.status(200).json({status: 'success', data: logUserApp});
    });
};

/* 
 * Get application information
 * 
 * input:
 * - groupid 
 *
 */
exports.getAppInternal = function getAppInternal(groupid, cb) {

    if (_E(groupid)) {
        if (cb) {
            let error = new Error('Invalid groupid');
            error.code = 403;
            cb(error, null);
        }
        return;
    }
    try {
        let ObjectId = require('mongoose').Types.ObjectId;
        let query = {groupid: new ObjectId(groupid), removed: {$ne: true}};

        userApps.get(query)
            .then(function (queryResult) {
                if (cb) {
                    cb(null, queryResult);
                }})
            .catch(function (err) {
                if (err) {
                    logger.error(err.message);
                    if (cb) {
                        let error = new Error(err.message);
                        error.code = 403;
                        cb(error, null);
                    }
                }
            });

    } catch (e) {
        logger.warn('getAppInternal exception occured: ', e);
        if (cb) {
            let error = new Error(e.message);
            error.code = 500;
            cb(error, null);
        }
    }
};

/* requires params
 * - userid (logUserId)
 *
 */
exports.deleteApp = function deleteApp(req, res, next) {

    deleteAppInternal(req, function (err, logUserApp) {
        if (err) {
            res.status(err.code).json({status: 'error', message: err.message});
            return;
        }
        res.status(200).json({status: 'success', data: logUserApp});
    });
};

exports.deleteAppInternal = function deleteAppInternal(req, cb) {
    let apikey = req.params.apikey || req.body.apikey || req.query.apikey;

    if (_E(apikey)) {
        if (cb) {
            let error = new Error('Invalid user apikey');
            error.code = 403;
            cb(error, null);
        }
        return;
    }

    try {
        let query = {apikey: apikey};
        userApps.get(query)
            .then(function(userApp){
              return userApp.update(userApp[0]._id,{removed: true})
            })
            .catch(function(err){throw err;})
            .then(function (updateResult) {
                logger.debug('Delete group success.'+JSON.stringify(userApp[0]));
                if (cb){
                    cb(null,updateResult)
                }
            })
            .catch(function (err) {
                throw err;
            });

    } catch (e) {
        logger.warn('deleteAppInternal exception occured: ', e);
        if (cb) {
            let error = new Error(e.message);
            error.code = 500;
            cb(error, null);
        }
    }
};