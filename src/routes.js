
/**
 * @brief Mobile Application logger - server side
 * 
 * Routes website path
 *
 * @file: routes.js
 * @copyright Ooma Inc, 2015
 * @author: Yeffry Zakizon
 */

var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var api = require('./api/apiv1');

function _S(obj){
	if( obj == undefined || obj == null) { return ''} else { return obj};
}

exports.index = function index(req, res, next) {
    var auth = req.session.auth;

    if (auth != undefined && auth == 'yes')  {
        res.redirect('/console');
        return;
    };

    res.render('pages/index.ejs', {authenticated: _S(auth)});
}

exports.check = function check(req, res, next) {
    res.status(200).send('200 OK\r\n');
}

exports.login = function login(req, res, next) {
	if (req.method == "GET") {
		var auth = req.session.auth;
        
    	res.render('pages/login.ejs', {message: req.flash('message'), authenticated: _S(auth)});
    } else {

        api.authUserInternal(req, res, function(err, logUser) {
            if (err) {
                req.flash('message', 'Invalid username or Password.');
                logger.info('auth success err: ', err.message);
                req.session.destroy(function(err){
                    if (err) {
                        logger.info('session destroy error ', err);
                    }
                 });
                res.status(200).json({status:'error', message: 'Invalid username or Password'});
                return;
            };
            
            logger.info('Username %s login success userid: %s, groupid: %s', logUser.username, req.session.userid, req.session.groupid, req.session.authToken);
            res.status(200).json({status:'success'});
        });
    	
    }
}

exports.logout = function logout(req, res, next) {
    var username = req.username;
	req.session.destroy(function(err){
        if (err) {
            logger.error('Username %s logout error: ', username, err.message);
        } else {
            logger.info('Username %s logout success', username);
        }
	});

	res.redirect('/');

}

exports.signup = function signup(req, res, next) {
    var auth = req.session.auth;
    if (req.method == "GET") {
        res.render('pages/signup.ejs', {message: req.flash('message'), authenticated: _S(auth)});
    } else if (req.method == "POST") {
        var code = req.body.code;

        if (code != "!ooma1234@") {
            var username = req.body.username || req.query.username;
            var email = req.body.email  || req.query.email;

            logger.info('Signup attempt with invalid invitation code. Username: %s, email: %s', _S(username), _S(email));
            req.flash('message', 'Invalid invitation code');
            res.render('pages/signup.ejs', {message: req.flash('message'), authenticated: _S(auth)});
        } else {
            api.createUserInternal(req, function(err, user){
                if (err) {
                    logger.info('Signup error: ', err.message);
                    req.flash('message', err.message);
                    res.render('pages/signup.ejs', {message: req.flash('message'), authenticated: _S(auth)});
                } else {
                    res.render("pages/signup_ok.ejs", {message: req.flash('message'), authenticated: _S(auth)});
                }
            });
        }
    }

}

exports.about = function about(req, res, next) {
	var auth = req.session.auth;
	logger.info('index authenticated ', auth);
    res.render('pages/about.ejs', {authenticated: _S(auth)});
}

exports.console = function console(req, res, next) {
    var auth = req.session.auth;


    if (auth == undefined || auth != 'yes')  {
        res.redirect('/login');
        return;
    };
    api.getAppInternal(req.session.groupid, function(err, logUserApps){
            res.render('pages/console.ejs', {authenticated: _S(auth), logUserApps: logUserApps});
    });
    
}

exports.devices = function devices(req, res, next) {
    var auth = req.session.auth;
    var apikey = req.params.apikey|| req.query.apikey;;
    var page = req.body.page || req.query.page;
    var limit = req.body.limit || req.query.limit;

    if (apikey == undefined) {
        req.flash('message', 'No api key');
        res.redirect('/console');
        return;
    };

    if (auth == undefined)  {
        res.redirect('/login');
        return;
    };

    if (page == undefined) { page = 0; }
    if (limit == undefined) { limit = 100; }
    if (page < 0) { page = 0; };
    req.query.limit = limit;
    req.query.page = page;
    
    api.getDevicesInternal(req, function(err, logUserSessions){
        if (err) {
                req.flash('message', 'No application exist');
                req.query.page = page = page-1;
            };
            res.render('pages/device.ejs', {authenticated: _S(auth), apikey: _S(apikey), 

            page: _S(page),
            limit: _S(limit),
            logUserSessions: logUserSessions});
    });
    
}

exports.sessions = function sessions(req, res, next) {
    var auth = req.session.auth;
    var apikey = req.params.apikey|| req.query.apikey;;
    var page = req.body.page || req.query.page;
    var limit = req.body.limit || req.query.limit;

    if (apikey == undefined) {
        req.flash('message', 'No api key');
        res.redirect('/console');
        return;
    };

    if (auth == undefined)  {
        res.redirect('/login');
        return;
    };

    if (page == undefined) { page = 0; }
    if (limit == undefined) { limit = 100; }
    if (page < 0) { page = 0; };
    req.query.limit = limit;
    req.query.page = page;
    
    api.getSessionsInternal(req, function(err, logUserSessions){
        if (err) {
                req.flash('message', 'No application exist');
                req.query.page = page = page-1;
            };
            res.render('pages/session.ejs', {authenticated: _S(auth), apikey: _S(apikey), 

            page: _S(page),
            limit: _S(limit),
            logUserSessions: logUserSessions});
    });
    
}

exports.log = function log(req, res, next) {
    var auth = req.session.auth;
    var apikey = req.params.apikey;
    var devid = req.body.devid || req.query.devid;
    var sessionid = req.body.sessionid || req.query.sessionid;
    var start_date = req.body.start_date || req.query.start_date;
    var end_date = req.body.end_date || req.query.end_date;
    var today_only = req.body.today_only || req.query.today_only;
    var phone_number = req.body.phone_number || req.query.phone_number;
    var phone_extension = req.body.phone_extension || req.query.phone_extension;
    var tag = req.body.tag || req.query.tag;
    var severity  = req.body.severity || req.query.severity;
    var log_text  = req.body.log_text || req.query.log_text;
    var page = req.body.page || req.query.page;
    var limit = req.body.limit || req.query.limit;
    var show_header = req.body.show_header || req.query.show_header;

    var qs = require('querystring');

    if (apikey == undefined) {
        req.flash('message', 'No api key');
        res.redirect('/console');
        return;
    };

    if (auth == undefined || auth != 'yes')  {
        logger.info('auth in log: ', auth);
        res.redirect('/login');
        return;
     };
    
    if (page == undefined) { page = 0; }
    if (limit == undefined) { limit = 500; }
      
    req.query.limit = limit;
    req.query.page = page;
    if (show_header == undefined) { show_header = "false"; } 

    api.getLogDataInternal(req, function(err, logData, page){
        if (err) {
                req.flash('message', 'No application exist');
                req.query.page = page = page-1;
            };

            res.render('pages/log.ejs', {authenticated: _S(auth), apikey: _S(apikey),
            sessionid: _S(sessionid),
            start_date: _S(start_date),
            end_date: _S(end_date),
            today_only: _S(today_only),
            phone_number: _S(phone_number),
            phone_extension: _S(phone_extension),
            tag: _S(tag),
            severity: _S(severity),
            devid: _S(devid),
            log_text: _S(log_text),
            page: _S(page),
            limit: _S(limit),
            show_header: _S(show_header),
            logData: logData});
    });
    
}

exports.newapp = function newapp(req, res, next) {
    var auth = req.session.auth;
    if (auth == undefined)  {
        res.redirect('/login');
        return;
    };

    if (req.method == "GET") {
        res.render('pages/newapp.ejs', {authenticated: _S(auth), userid: _S(req.session.userid), 
            groupid: _S(req.session.groupid), 
            message: req.flash('message'), 
            authToken: _S(req.session.authToken)});
    } else {
        res.status(404);
    }
}

exports.check = function check(req, res, next) {
    res.status(200).send('200 OK\r\n');
}

