var mongoose = require('mongoose');
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

var eventTypeDictionarySchema = Schema({
  id: String,
  name: String
});

var LogUser = db.model('User', userSchema);
var LogGroup = db.model('Group', groupSchema);
var EventTypeDictionary = db.model('EventTypeDictionary', eventTypeDictionarySchema);

module.exports.log_db = db;
module.exports.LogUser = LogUser;
module.exports.LogGroup = LogGroup;


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
