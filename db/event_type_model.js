var mongoose = require('mongoose');
var log4js = require('log4js');
var logger = log4js.getLogger('applog');

var db = mongoose.connection;

var env = process.env.NODE_ENV || 'production';
var config = require('./config')[env];
var db_config = config.database;
/*
db.on('error', function (err) {
  logger.fatal('log_model error connecting to mongodb: ', err)
});

db.on('connected', function () {
  logger.info('Database connected ');
})
db.on('disconnected', function () {
  logger.info('Database disconnected');
})

//mongoose.connect('mongodb://' + db_config.host + '/'+ db_config.db, {user: db_config.user, pass: db_config.password});
*/
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var eventTypeDictionarySchema = new Schema({
  id: String,
  name: String
});

var EventTypes = mongoose.model('EventTypes', eventTypeDictionarySchema);

module.exports = {
  getEventType: function (id) {
    EventTypes.findOne({'id': id}, 'value', function (err, event) {
      if (err) throw (err);
      return (event.value)
    })
  },
  addEventType: function (event) {
    EventTypes.save(event, function (err) {
      if (err) throw (err);
      return (true)
    })
  },
  removeEventType: function (id) {
    EventTypes.findOneAndRemove({field: 'newValue'}, function (err) {
      if (err) throw (err);
      return (true)
    })
  },

  listEventTypes: function () {
    EventTypes.find({}, function (err, events) {
      if (err) throw(e)
      var eventsMap = {};
      console.log('found ' + events.length + " events")
      events.forEach(function(event) {
        console.log(event.name + ' ' + event.id)
        eventsMap[event._id] = event;
      });
      return eventsMap;
    })
  },

  initEventType: function (id) {
    EventTypes.findOne({'id': id}, 'value', function (err, event) {
      if (err) throw (err);
      return (event.value)
    })
  }
}
