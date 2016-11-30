var mongoose = require('mongoose');
var logger = require('./../util/logger').getlogger('db.log_model');
var db = require('./connection').db;


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


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
    remote_ip: String,
    access_token: String
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
    call_type: String,
    call_id: String,
    crash_id: String,
    crash_name: String,
    crash_reason: String,
    remote_notify_type: String,
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

// TODO : add links from new implementations of commented below models from new files
var LogUser = db.model('User', userSchema);
// var LogUserApp = db.model('UserApp', userAppSchema);
//var LogLogSession = db.model('LogSession', logSessionSchema);
var LogLogData = db.model('LogData', logDataSchema);
//var LogEvent = db.model('Event', logEventSchema);
var LogGroup = db.model('Group', groupSchema);
//var LogAuthLim = db.model('AuthLimitation', Non_Auth_User_Limitation_Schema);
//var LogValToken = db.model('ValidToken', valid_tokens_Schema)
var EventTypeDictionary = db.model('EventTypeDictionary', eventTypeDictionarySchema);

module.exports.log_db = db;
module.exports.LogUser = LogUser;
//module.exports.LogUserApp = LogUserApp;
//module.exports.LogLogSession = LogLogSession;
module.exports.LogLogData = LogLogData;
//module.exports.LogEvent = LogEvent;
module.exports.LogGroup = LogGroup;
//module.exports.LogAuthLim = LogAuthLim;
//module.exports.LogValToken = LogValToken;

module.exports.getEventType = function (id) {
  EventTypeDictionary.findOne({'id': id}, 'value', function (err, event) {
    if (err) throw (err);
    return (event.value)
  })
}

module.exports.addEventType = function (event) {
  EventTypeDictionary.save(event, function (err) {
    if (err) throw (err);
    return (true)
  })
}

module.exports.removeEventType = function (id) {
  EventTypeDictionary.findOneAndRemove({field: 'newValue'}, function (err) {
    if (err) throw (err);
    return (true)
  })
}

module.exports.listEventTypes = function () {
  EventTypeDictionary.find().find(function (err, events) {
    if (err) throw (err);
    return (events)
  })
}

module.exports.initEventType = function (id) {
  EventTypeDictionary.findOne({'id': id}, 'value', function (err, event) {
    if (err) throw (err);
    return (event.value)
  })
}
