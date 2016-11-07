var mongoose = require('mongoose');
var log4js = require('log4js');
var logger = log4js.getLogger('applog');

var db = mongoose.connection;

var env = process.env.NODE_ENV || 'production';
var config = require('./config')[env];
var db_config = config.database;

db.on('error', function (err) {
  logger.fatal('log_model error connecting to mongodb: ', err)
});

db.on('connected', function () {
  logger.info('Database connected ');
})
db.on('disconnected', function () {
  logger.info('Database disconnected');
})

mongoose.connect('mongodb://' + db_config.host + '/'+ db_config.db, {user: db_config.user, pass: db_config.password});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var logfilesSchema = Schema({
  shortid: String,
  filename: String,
  created_date: Date,
  tag: String,
  metadata: String

});

/* logfiles : { logfile_id: <string>
 created_date: <date>
 }
 */
var logfileSessionsSchema = Schema({
  userid: ObjectId,
  apikey: String,
  devid: String,
  logfiles: {type: Array, "default": []}
});


var userSchema = Schema({
  username: String,
  password: String,
  email: String,
  role: String,
  last_login: Date,
  auth_token: String,
  groups: {type: Array, "default": []} //array to groupid
});

var groupSchema = Schema({
  ownerid: ObjectId, //users
  members: {type: Array, "default": []}, //array to userid
  name: String //group name
});

var userAppSchema = Schema({
  groupid: ObjectId,
  userid: ObjectId,
  name: String,
  type: String,
  os: String,
  apikey: String,
  removed: Boolean
});

var logSessionSchema = Schema({
  apikey: String,
  devid: String,
  created_date: Date,
  os_name: String, 	// IOS, ANDROID, WP, BLACKBERRY
  hw_info: String, // [iPhone 5s, iPhone 5c, iPhone 6, Nexus 6, galaxy 6]
  devManufacturer: String, //[Apple, Samsung, HTC]
  os_version: String, // 8.3, 5.2
  appVersion: String,
  appName: String,
  remote_ip: String
});

var eventTypeDictionarySchema = Schema({
  id: String,
  value: String
});

var logDataSchema = Schema({
  sessionid: String,
  apikey: String,
  devid: String,
  client_date: Date, /* Set by the client */
  created_date: Date,
  level: Number,
  log: String,
  local_ip: String, /* Set by the client */
  remote_ip: String, /* From server perspective */
  phone_number: String,
  phone_ext: String,
  geolocation: {},
  motion: String,
  tag: String,
  processid: String,
  app_version: String,
  os_version: String,
  app_name: String,
  devManufacturer: String, //[Apple, Samsung, HTC],
  hw_info: String,
  os_name: String,
  db_id: String
}, {autoIndex: false});

var logEventSchema = Schema({
  sessionid: String,
  devid: String,
  client_date: Date, /* Set by the client */
  created_date: Date,
  event_type: String,
  event_name: String,
  event_data: [], // {  label: String, value: String }
  tag: String,
  db_id: String,
  phone_number: String,
  phone_ext: String,
  remote_number: String,
  call_duration: Number,
  call_direction: String,
  geolocation: {},
  motion: String,
  local_ip: String, /* Set by the client */
  remote_ip: String, /* From server perspective */
  app_version: String,
  os_version: String,
  app_name: String,
  devManufacturer: String, //[Apple, Samsung, HTC]
  hw_info: String,
  os_name: String
}, {autoIndex: false})

var Non_Auth_User_Limitation_Schema = Schema({
  devid: String,
  remote_ip: String,
  doc_limit: Number

});
var valid_tokens_Schema = Schema({
  access_token: String,
  devid: String,
  ins_date: Date

});

var eventTypeDictionarySchema = Schema({
  id: String,
  name: String
});

var EventTypeDictionary = mongoose.model('EventTypeDictionary', eventTypeDictionarySchema);

eventTypeDictionarySchema.methods.getEventType = function (id) {
  EventTypeDictionary.findOne({'id': id}, 'value', function (err, event) {
    if (err) throw (err);
    return (event.value)
  })
}

eventTypeDictionarySchema.methods.addEventType = function (event) {
  EventTypeDictionary.save(event, function (err) {
    if (err) throw (err);
    return (true)
  })
}

eventTypeDictionarySchema.methods.removeEventType = function (id) {
  EventTypeDictionary.findOneAndRemove({field: 'newValue'}, function (err) {
    if (err) throw (err);
    return (true)
  })
}

eventTypeDictionarySchema.methods.listEventTypes = function (id) {
  EventTypeDictionary.find().find(function (err, events) {
    if (err) throw (err);
    return (events)
  })
}

eventTypeDictionarySchema.methods.initEventType = function (id) {
  EventTypeDictionary.findOne({'id': id}, 'value', function (err, event) {
    if (err) throw (err);
    return (event.value)
  })
}

var LogFile = mongoose.model('LogFile', logfilesSchema);
var LogFileSession = mongoose.model('LogFileSession', logfileSessionsSchema);
var LogUser = mongoose.model('User', userSchema);
var LogUserApp = mongoose.model('UserApp', userAppSchema);
var LogLogSession = mongoose.model('LogSession', logSessionSchema);
var LogLogData = mongoose.model('LogData', logDataSchema);
var LogEvent = mongoose.model('Event', logEventSchema);
var LogGroup = mongoose.model('Group', groupSchema);
var LogAuthLim = mongoose.model('AuthLimitation', Non_Auth_User_Limitation_Schema);
var LogValToken = mongoose.model('ValidToken', valid_tokens_Schema)

module.exports.log_db = db;
module.exports.LogFile = LogFile;
module.exports.EventTypeDictionary = EventTypeDictionary;
module.exports.LogFileSession = LogFileSession;
module.exports.LogUser = LogUser;
module.exports.LogUserApp = LogUserApp;
module.exports.LogLogSession = LogLogSession;
module.exports.LogLogData = LogLogData;
module.exports.LogEvent = LogEvent;
module.exports.LogGroup = LogGroup;
module.exports.LogAuthLim = LogAuthLim;
module.exports.LogValToken = LogValToken;
