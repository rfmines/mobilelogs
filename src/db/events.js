var mongoose = require('mongoose');
var db = require('./connection').db;


var eventSchema = mongoose.Schema({
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
  os_name: String,
  protocol_version : String
}, {autoIndex: false});

var event = db.model('Event', eventSchema);
var test_event = db.model('Event_test', eventSchema);

module.exports = {
  
  create: function (params) {
    return new Promise(function (resolve, reject) {
      var newEvent = new event(params);
      newEvent.save(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  },
  create_test: function (params) {
    return new Promise(function (resolve, reject) {
      var newEvent = new test_event(params);
      newEvent.save(function (err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  }
  
};