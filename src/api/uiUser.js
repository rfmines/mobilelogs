let oomautil = require('./../util/ooma_util');
let logger = require('./../util/logger').getlogger('api.uiUser');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let usersAndGroups = require('./../db/usersAndGroups');

function _E(obj) {
    return oomautil.isEmpty(obj);
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

exports.authUser = function authUser(req, res) {

    authUserInternal(req, res, function (err, logUser) {
        if (err) {
            res.status(err.code).json({status: 'error', message: err.message});
            return;
        }
        res.status(200).json({status: 'success', data: logUser});
    });

};

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

exports.authUserInternal = function authUserInternal(req, res, cb) {
    let username = req.body.username;
    let password = req.body.password;

    if (_E(username) || _E(password)) {
        if (cb) {
            let error = new Error('Invalid username or password');
            error.code = 403;
            cb(error, null);
        }
        ;
        return;
    }
    ;

    try {
        logger.info('New login with username: ' + username);
        let query = {email: username};

        logger.debug('authUserInternal query: ', query);
        usersAndGroups.findOneUser(query, function (err, logUser) {
            if (err) {
                if (cb) {
                    let error = new Error(err.message);
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
                    let error = new Error('No record found');
                    error.code = 403;
                    cb(error, null);
                }
                ;
                return;
            }
            ;
            logger.debug('authUserInternal  ', logUser);

            let match = bcrypt.compareSync(password, logUser.password);
            if (match) {

                /* Update login_expired field */
                usersAndGroups.updateUser({_id: logUser._id}, {$currentDate: {last_login: true}}, function (err, logUserUpdated) {
                    if (err) {
                        logger.error('Error while update last_login date for username: ', logUser.username);
                    }
                    ;

                    let authToken = jwt.sign({
                        _id: logUser._id,
                        username: logUser.username,
                        tag: 'mobilelogger'
                    }, '00MasecR3t', {expiresIn: 2 * 3600});

                    /* Write to request session */
                    req.session.username = logUser.username;
                    req.session.userid = logUser._id;
                    req.session.groupid = logUser.groups[0];
                    req.session.auth = 'yes';
                    req.session.authToken = authToken;

                    let userData = {
                        username: logUser.username,
                        _id: logUser._id,
                        authToken: authToken,
                        groups: logUser.groups
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
};

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

exports.createUser = function createUser(req, res, next) {
    createUserInternal(req, function (err, user) {
        if (err) {
            res.status(401).json({status: 'error', mesasge: err.message});
        } else {
            res.status(201).json({status: 'success'});
        }

    });
};

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

exports.createUserInternal = function createUserInternal(req, cb) {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    if (_E(username) || _E(password) || _E(email)) {
        if (cb) {
            cb(new Error('Invalid params'));
        }
        return;
    }
    ;
    try {
        /* Look if email has been created */

        usersAndGroups.findOneUser({email: email}).then(function (user) {
            if (user) {
                logger.error('createUserInternal email: %s is exists', email);
                if (cb) {
                    cb(new Error('Email already exists'))
                }
                ;
                return;
            }
            let rounds = 10;
            let salt = bcrypt.genSaltSync(rounds);
            let hash = bcrypt.hashSync(password, salt);
            let logUser = {
                username: username,
                password: hash,
                email: email,
                apikey: uuid.v1()
            };
            // logic was developed by Yeffry
            // main propose to create new user and assign ooma group to him
            logger.debug('createUser: ', logUser);
            // creating new user
            usersAndGroups.createUser(logUser)
                .then(function (newUser) {
                    logUser._id = newUser._id;
                    // adding user to ooma group
                    return usersAndGroups.updateGroup({name: 'ooma'}, {
                        ownerid: newUser._id,
                        $push: {members: newUser._id}
                    });
                })
                .catch(function (err) {
                    throw err;
                })
                .then(function () {
                    // querying ooma group to get mongo _id of it
                    return usersAndGroups.findOneGroup({name: 'ooma'})
                })
                .catch(function (err) {
                    throw err;
                })
                .then(function (group) {
                    // assigning ooma group to user
                    return usersAndGroups.updateUser({_id: logUser._id}, {$push: {groups: group._id}})
                })
                .catch(function (err) {
                    throw err;
                });

        })
    } catch (e) {
        logger.error('createUser exception occured: ', e);
        if (cb) {
            cb(new Error(e.message));
        }
    }

};

/** GET API  get user information
 *
 * input params
 * - id (LogUserId)
 *
 */
exports.getUser = function getUser(req, res, next) {
    let id = req.params.id;
    if (_E(id)) {
        res.status(403).json({status: 'error', message: 'Invalid id'});
        return;
    }
    try {
        let ObjectId = require('mongoose').Types.ObjectId;
        let query = {_id: new ObjectId(id)};
        usersAndGroups.findOneUser(query, function (err, logUser) {
            if (err) {
                res.status(500).json({status: 'error', message: err.message});
                return;
            }
            logUser.password = '';
            logger.debug('getUser  ', logUser);
            res.status(200).json({status: 'success', data: logUser});
        });
    } catch (e) {
        logger.warn('getUser exception occured: ', e);
        res.status(500).json({status: 'error', message: e.message});
    }
};

/** DELETE API  delete user
 *
 * input params
 * - id (LogUserId)
 *
 */
exports.deleteUser = function deleteUser(req, res, next) {
    let id = req.params.id;
    if (_E(id)) {
        res.status(403).json({status: 'error', message: 'Invalid id'});
        return;
    }
    try {
        let ObjectId = require('mongoose').Types.ObjectId;
        let query = {_id: new ObjectId(id)};
        usersAndGroups.deleteUser(query, function (err, logUser) {
            if (err) {
                res.status(500).json({status: 'error', message: err.message});
                return;
            }
            res.status(200).json({status: 'success', data: logUser});
        });

    } catch (e) {
        logger.warn('deleteUser exception occured: ', e);
        res.status(500).json({status: 'error', message: e.message});
    }
};