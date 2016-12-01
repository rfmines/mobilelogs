var logger = require('./../util/logger').getlogger('api.events');
var db = require('./../db');
var decode = require('./decode');

exports.saveEvents = function saveEvents(req, res) {
  try {
    let eventsArray = req.body.events;
    let tokenAccess = req.body.tokenAccess;
    let sessionId = req.body.sessionId;
    let devId = req.body.devid;
    var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // request is valid and all fields are set
    // to improve performance we can free the client
    // and continue handle his request
    res.status(200).json({status: 'success'});
    for (let event of eventsArray) {
      if (typeof event === 'string'){
        // currently mobile team has problems with it
        // sometimes they are sent string instead of object
        logger.debug('Converting string event to object');
        event = JSON.parse(event);
      }
      
      var normalizedEvent = normalizeEvent(event);
      normalizedEvent.created_date = Date.now();
      normalizedEvent.remote_ip = remote_ip;
      normalizedEvent.devid = devId;
      normalizedEvent.sessionid = sessionId;
      if (normalizedEvent.tag !== 'test') {
        logger.debug(JSON.stringify(normalizedEvent));
        db.events.create(normalizedEvent).then(function (newEvent) {
          // event saved
          // we have to increase counter for clients without accessToken
          if (tokenAccess !== 1) {
            
            db.authIpLimitations.update({remote_ip: remote_ip}, {}).then(function (done) {
              // limitation incremented
            }, function (err) {
              logger.error('Error occurred while trying to increment IP limitations.Error:' + err);
            });
            
          }
        }, function (err) {
          // this can happen because DB handles duplicates by compound unique index
          // mobile client sometimes resend data , because did not get any response last time
          // (mostly because of network issues)
          logger.warn('Error occurred while trying to save event.' + err);
          logger.debug('Event :' + JSON.stringify(normalizedEvent));
        });
      } else {
        // save in collections for test events
        db.events.create_test(normalizedEvent).then(function (newEvent) {
          // event saved
          // we have to increase counter for clients without accessToken
          if (tokenAccess !== 1) {
      
            db.authIpLimitations.update({remote_ip: remote_ip}, {}).then(function (done) {
              // limitation incremented
            }, function (err) {
              logger.error('Error occurred while trying to increment IP limitations.Error:' + err);
            });
      
          }
        }, function (err) {
          // this can happen because DB handles duplicates by compound unique index
          // mobile client sometimes resend data , because did not get any response last time
          // (mostly because of network issues)
          logger.warn('Error occurred while trying to save event.' + err);
          logger.debug('Event :' + JSON.stringify(normalizedEvent));
        });
      }
    }
  } catch (e) {
    logger.error('Error occurred.Error:' + e);
    res.status(500).json({status: 'error', message: 'Internal server error'});
  }
};
/*
 // incoming param - event object from mobile client
 // output - mutated event object according to rules implemented in apiv1
 this function is for moving some fields from event_data array inside the event document to the main document structure( document root)
 this is historical feature , initially this data sends inside an array of events
 but it is difficult to query this data(in database) for some analyze tasks (they have to iterate over array in each event to find something), so
 mobile team requested to delete couple important fields to them  from array inside event and keep it in the document(event object) root
 This function implements all these rules
 (for apiv1 this feature implemented as IF statements inside saveEvent function )
 
 */

function normalizeEvent(event) {
  let handledEvent = {};
  for (let key in event) {
    if (key !== 'event_data') {
      // this is not event_data
      // just adding
      handledEvent[key] = event[key]
    } else {
      // checking that current event from one of the events , where we have to move fields
      if (event.event_name.toUpperCase() === decode.eventNameDict[30010] || // RT_CALL_END event
        event.event_name.toUpperCase() === decode.eventNameDict[6] ||       // APP_RNOTIFY event
        event.event_name.toUpperCase() === decode.eventNameDict[8] ||       // CRASH event
        event.event_type.toUpperCase() === decode.eventTypeDict[5]          // CALL group of events
      ) {
        // this event from the list , where we have to move fields
        handledEvent.event_data = [];
        for (let iterator in event[key]) {
          let eventDataElement = event[key][iterator];
          logger.debug('Iterating over '+ JSON.stringify(eventDataElement));
          if (eventDataElement.label.toUpperCase() === decode.labelDic[5].name.toUpperCase() || // 'CrashName'
            eventDataElement.label.toUpperCase() === decode.labelDic[6].name.toUpperCase() || // 'CrashReason'
            eventDataElement.label.toUpperCase() === decode.labelDic[19].name.toUpperCase() || // 'Remote number'
            eventDataElement.label.toUpperCase() === decode.labelDic[43].name.toUpperCase() || // 'Call duration'
            eventDataElement.label.toUpperCase() === decode.labelDic[45].name.toUpperCase() || // 'Call direction'
            eventDataElement.label.toUpperCase() === decode.labelDic[46].name.toUpperCase() || // 'CallId'
            eventDataElement.label.toUpperCase() === decode.labelDic[62].name.toUpperCase() || // 'Call type'
            eventDataElement.label.toUpperCase() === decode.labelDic[105].name.toUpperCase() || // 'CrashId'
            eventDataElement.label.toUpperCase() === decode.labelDic[124].name.toUpperCase()  // 'Remote notify type'
          ) {
            //handle
            handledEvent[eventDataElement.label] = eventDataElement.value;
          }
          else {
            handledEvent.event_data.push(eventDataElement);
          }
          
        }
      } else {
        // not from list of events to handle
        handledEvent[key] = event[key];
      }
    }
   
  }
  return handledEvent;
}