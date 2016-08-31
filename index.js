
var express = require('express');
var app = express();
var compress = require('compression');
var config = require('./config');
var bodyParser = require('body-parser');
var errorHandlers = require('./middleware/errorhandlers');
var log = require('./middleware/log');
var routes = require('./routes');
var instanceName = 'applog';
var flash = require('connect-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);

var log4js_syslog_appender = require('./util/log4js-syslog-appender');

var log4js = require('log4js');
if (config.syslog !== undefined) {

	config.syslog.appenders[0].tag = 'proxy';
	var sylog_appender = '../../../../util/log4js-syslog-appender';
	log4js.loadAppender(sylog_appender);
	log4js.addAppender(log4js.appenders[sylog_appender](config.syslog.appenders[0]), instanceName);
	console.log('KazooProxy logging to syslog');
}  

if (config.log_file !== undefined) {
	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file(config.log_file), instanceName);
};

var logger = log4js.getLogger(instanceName);

if (config.log_level == undefined) {
	config.log_level = 'DEBUG';
}

/* production should always use ERROR */
if (process.env.NODE_ENV == "production") {
	config.log_level = 'INFO';
} 

/* Overwrite log level */
if (process.env.LOG_LEVEL != undefined) {
	config.log_level = process.env.LOG_LEVEL;
};


console.log('%s log set to: ', instanceName, config.log_level);
logger.setLevel(config.log_level);


app.use(compress());
// parse application/json
app.use(bodyParser.json({limit: '50mb'}))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

app.use(log.logger);

app.set('trust proxy', 1) // trust first proxy 

var expire_minutes = 60; //expire in hour
app.use(session({
    cookie: { maxAge: 1000*60*expire_minutes } ,
    secret: "0om4pal@4lt0" ,
    saveUninitialized: true,
    resave: true,
    store:new MongoStore({
            db: 'express',
            host: 'localhost',
            port: 27017,  
            username: 'express',
            password: 'ooma123', 
            collection: 'session', 
            autoReconnect:true,
            ttl: 1 * 60 * 60, /* 1 hour session expire */
            autoRemove: 'native' // Default
    })
}));

app.use(flash());

app.use('/static', express.static(__dirname + '/static'));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');



// Generic routing
app.get('/', routes.index);
app.get('/check', routes.check);
app.get('/login', routes.login);
app.get('/signup', routes.signup);
app.get('/logout', routes.logout);
app.get('/about', routes.about);
app.get('/console', routes.console);
app.get('/sessions/:apikey', routes.sessions);
app.get('/devices/:apikey', routes.devices);
app.get('/log/:apikey', routes.log);
app.get('/newapp', routes.newapp);
app.post('/newapp', routes.newapp);

app.post('/login', routes.login);
app.post('/signup', routes.signup);

// API routing
var apiv1 = require('./api/apiv1');
app.use('/api/v1', apiv1);

// Catch errors
app.use(errorHandlers.error);
app.use(errorHandlers.notFound);


var shutdown = function(server) {
	logger.info("Received kill signal, shutting down gracefully.");
	server.close(function() {
	    logger.info("Exiting now.");
	    process.exit()
	  });	

	   // if after 
	   setTimeout(function() {
	       logger.error("Could not close connections in time, forcefully shutting down");
	       process.exit()
	  }, 33*1000);
}

var http_port = process.env.APPLOG_PORT || process.env.PORT || config.local.http_port || 8000;

var server = app.listen(http_port, function() {
	console.log("%s applog server is running on http port %d", instanceName, http_port);
});


/*Kill signal*/
process.on ('SIGTERM', function(){shutdown(server)});
/* Ctrl-C */
process.on('SIGINT', function(){shutdown(server)});

