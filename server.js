
var express = require('express');
var app = express();
var compress = require('compression');
var bodyParser = require('body-parser');
var errorHandlers = require('./middleware/errorhandlers');
var log = require('./middleware/log');
var routes = require('./routes');

var flash = require('connect-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);


//var log4js_syslog_appender = require('./util/log4js-syslog-appender');

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

var apiv1 = require('./api/apiv1');
app.use('/api/v1', apiv1);

const apiEventTypes = require('./routes/event_types');
app.use('/api/v1/event_types', apiEventTypes)

var apiEventNames = require('./routes/event_names');
app.use('/api/v1/event_names', apiEventNames);

var apiLabels = require('./routes/labels');
app.use('/api/v1/labels', apiLabels);

var apiEventValues = require('./routes/event_values');
app.use('/api/v1/event_values', apiEventValues);

// Catch errors
app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

//console.log(app._router.stack)


module.exports = app;
