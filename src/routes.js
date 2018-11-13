
/**
 * @brief Mobile Application logger - server side
 * 
 * Routes website path
 *
 * @file: routes.js
 * @copyright Ooma Inc, 2015
 * @author: Yeffry Zakizon
 */

let logger = require('./util/logger').getlogger('routes');
let users = require('./api/uiUser');
let apps = require('./api/uiApps');

function _S(obj){
	if( obj == undefined || obj == null) { return ''} else { return obj};
}

exports.index = function index(req, res, next) {
    let auth = req.session.auth;
    if (auth != undefined && auth == 'yes')  {
        res.redirect('/console');
        return;
    }
    res.render('pages/index.ejs', {authenticated: _S(auth)});
};

exports.check = function check(req, res, next) {
    res.status(200).send('200 OK\r\n');
}

exports.login = function login(req, res, next) {
	if (req.method == "GET") {
		let auth = req.session.auth;
    	res.render('pages/login.ejs', {message: req.flash('message'), authenticated: _S(auth)});
    } else {
        users.authUserInternal(req, res, function(err, logUser) {
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
    let username = req.username;
	req.session.destroy(function(err){
        if (err) {
            logger.error('Username %s logout error: ', username, err.message);
        } else {
            logger.info('Username %s logout success', username);
        }
	});

	res.redirect('/');

};

exports.signup = function signup(req, res, next) {
    let auth = req.session.auth;
    if (req.method == "GET") {
        res.render('pages/signup.ejs', {message: req.flash('message'), authenticated: _S(auth)});
    } else if (req.method == "POST") {
        let code = req.body.code;

        if (code != "!ooma1234@") {
            let username = req.body.username || req.query.username;
            let email = req.body.email  || req.query.email;

            logger.info('Signup attempt with invalid invitation code. Username: %s, email: %s', _S(username), _S(email));
            req.flash('message', 'Invalid invitation code');
            res.render('pages/signup.ejs', {message: req.flash('message'), authenticated: _S(auth)});
        } else {
            users.createUserInternal(req, function(err, user){
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
};

exports.about = function about(req, res, next) {
	let auth = req.session.auth;
	logger.info('index authenticated ', auth);
    res.render('pages/about.ejs', {authenticated: _S(auth)});
};

exports.console = function console(req, res, next) {
    let auth = req.session.auth;
    if (auth == undefined || auth != 'yes')  {
        res.redirect('/login');
        return;
    }
    apps.getAppInternal(req.session.groupid, function(err, logUserApps){
            res.render('pages/console.ejs', {authenticated: _S(auth), logUserApps: logUserApps});
    });
};


exports.newapp = function newapp(req, res, next) {
    let auth = req.session.auth;
    if (auth == undefined)  {
        res.redirect('/login');
        return;
    }

    if (req.method == "GET") {
        res.render('pages/newapp.ejs', {authenticated: _S(auth), userid: _S(req.session.userid), 
            groupid: _S(req.session.groupid), 
            message: req.flash('message'), 
            authToken: _S(req.session.authToken)});
    } else {
        res.status(404);
    }
};

exports.check = function check(req, res, next) {
    res.status(200).send('200 OK\r\n');
};

