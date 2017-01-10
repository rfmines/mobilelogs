

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
        if (cb) {
            cb(new Error('Invalid userid or groupid'))
        }
        ;
        return;
    }
    ;

    var appname = req.body.appname || req.query.appname;
    var apptype = req.body.apptype || req.query.apptype;
    var os = req.body.os || req.query.os;
    ;

    if (_E(appname) || _E(apptype) || _E(os)) {
        logger.error('Invalid params');
        if (cb) {
            cb(new Error('Invalid params'))
        }
        ;
        return;
    }
    ;

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

        logUserApp.save(function (err, userApp) {
            if (err) {
                logger.error('Unable to create new app %s. error: %s', appname, err.message);
                if (cb) {
                    cb(err);
                }
                ;
                return;
            }
            ;

            logger.debug('create new app success: ', userApp);
            if (cb) {
                cb(null, userApp)
            }
            ;
            //res.status(201).json({status: 'success', data: { id: userApp._id, apikey: userApp.apikey}});
        });
    } catch (e) {
        logger.error('createUser exception occured: ', e);
        if (cb) {
            var error = new Error(e.message);
            error.code = 500;
            cb(error, null);
        }
        ;
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