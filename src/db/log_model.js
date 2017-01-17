let mongoose = require('mongoose');
let db = require('./connection').db;

let Schema = mongoose.Schema;

let eventTypeDictionarySchema = Schema({
  id: String,
  name: String
});

let EventTypeDictionary = db.model('EventTypeDictionary', eventTypeDictionarySchema);

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
