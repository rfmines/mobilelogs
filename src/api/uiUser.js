
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
                    }, '00MasecR3t', {expiresIn: 2 * 3600});

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