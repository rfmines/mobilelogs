let logger = require('./../util/logger').getlogger('api.events');
let db = require('./../db');
let decode = require('./decode');
let moment = require('moment');
let config = require('./../config');
let sendCSLEventToKafka = require('./../util/kafkaProducer').kafkaLogger;

exports.saveEvents = function saveEvents(req, res) {
    try {
        let eventsToKafka = [];
        let eventsArray = req.body.events || req.body.d; // new format || old format
        let tokenAccess = req.body.tokenAccess;
        let sessionId = req.body.sessionId;
        let devId = req.body.devid;
        let node = req.body.node;
        let remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        // request is valid and all fields are set
        // to improve performance we can free the client
        // and continue handle his request
        res.status(200).json({status: 'success'});
        for (let event of eventsArray) {
            if (typeof event === 'string') {
                // currently mobile team has problems with it
                // sometimes they are sent string instead of object
                event = JSON.parse(event);
            }

            var normalizedEvent = normalizeEvent(event, req);
            // req needs for old format parsing , because array in old format contain only unique data
            // static fields like phone_number, devid etc are encoded in request body
            normalizedEvent.created_date = Date.now();
            normalizedEvent.remote_ip = remote_ip;
            normalizedEvent.devid = devId;
            normalizedEvent.sessionid = sessionId;
            normalizedEvent.node=node;
            if (!normalizedEvent.tag || normalizedEvent.tag.toLowerCase() !== 'test') {
                if (config.storeInMongo) {
                db.events.create(normalizedEvent).then(function (newEvent) {

                        // event saved
                        // we have to increase counter for clients without accessToken
                        if (tokenAccess !== 1) {
                            let updateOptions = {$inc: {doc_limit: 1}};
                            if (devId){updateOptions.devid=devId};
                            db.authIpLimitations.update({remote_ip: remote_ip}, {
                                updateOptions
                            }).then(function (done) {
                                // limitation incremented
                            }, function (err) {
                                logger.error('Error occurred while trying to increment IP limitations.Error:' + err);
                            });

                        }
                    }
                    ,
                    function (err) {
                        // this can happen because DB handles duplicates by compound unique index
                        // mobile client sometimes resend data , because did not get any response last time
                        // (mostly because of network issues)
                        logger.warn('Error occurred while trying to save event.' + err);

                    }
                );
                }
                // converting date to make kafka/elastic recognize it
                normalizedEvent.created_date = {"$date": moment(normalizedEvent.created_date).format("YYYY-MM-DDTHH:mm:ss.SSS")};
                if (!normalizedEvent.protocol_version){
                    normalizedEvent.client_date = {"$date": moment(normalizedEvent.client_date).format("YYYY-MM-DDTHH:mm:ss.SSS")};
                    normalizedEvent.log_date =  moment(normalizedEvent.created_date.$date).format("YYYY-MM-DDTHH:mm:ss.SSSZZ");
                } else {
                    normalizedEvent.client_date = {"$date": moment(parseInt(normalizedEvent.client_date)).format("YYYY-MM-DDTHH:mm:ss.SSS")};
                    normalizedEvent.log_date =  moment(normalizedEvent.created_date.$date).format("YYYY-MM-DDTHH:mm:ss.SSSZZ");
                }
                // adding analog of event_data array in OBJECT style
                // e.g. was event_data:[{label:a,value:1},{label:b,value:2}]
                // in object format it will be event_data:{a:1,b:2}
                normalizedEvent.event_data_obj = eventDataToObject(normalizedEvent.event_data);

                eventsToKafka.push(JSON.stringify(normalizedEvent));
            } else {
                if (config.storeInMongo) {
                    // save in collections for test events
                    db.events.create_test(normalizedEvent).then(function (newEvent) {
                        // event saved
                        // we have to increase counter for clients without accessToken

                        if (tokenAccess !== 1) {

                            db.authIpLimitations.update({remote_ip: remote_ip}, {
                                $inc: {doc_limit: 1},
                                devid: devid
                            }).then(function (done) {
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

                    });
                }
            }
        }
        // to reduce io operations we send all events to kafka/elasitc
        // after converting ALL events from request
        // in ONE request to kafka
        //  this part of code will be called when loop will be finished
        if (eventsToKafka.length !== 0){
            logger.debug('Sending '+eventsToKafka.length+' events to kafka.SessionId was '+req.body.sessionId)
        sendCSLEventToKafka(eventsToKafka).then(function (success) {

        }, function (err) {
            logger.error(err);
        });

        } else {
            logger.debug('Nothing to send, array empty');
        }
    } catch
        (e) {
        logger.error('Error occurred.Error:' + e);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
}
;
/*
 // incoming param - event object from mobile client
 // output - new event object according to rules implemented in apiv1
 // This function is for backward capability between protocols!
 // Currently supports old version(with decoding on client side (apiv1) and new protocol from apiv2

 Desc:
 this function is for moving some fields from event_data array inside the event document to the main document structure( document root)
 this is historical feature , initially this data sends inside an array of events
 but it is difficult to query this data(in database) for some analyze tasks (they have to iterate over array in each event to find something), so
 mobile team requested to delete couple important fields to them  from array inside event and keep it in the document(event object) root
 This function implements all these rules
 (for apiv1 this feature implemented as IF statements inside saveEvent function )

 */

function normalizeEvent(event, req) {
    let handledEvent = {};
    if (event.protocol_version) {
        // event from apiv2 , because this event has protocol_version field , parsing using new format
        for (let key in event) {
            if (key !== 'event_data') {
                // this is not event_data array
                // just adding ordinary field
                handledEvent[key] = event[key]
            } else {
                // this is event_data array handler
                // checking that current event from one of the events , where we have to move fields

                if (event.event_name.toUpperCase() === decode.eventNameDict[30010] || // RT_CALL_END event
                    event.event_name.toUpperCase() === decode.eventNameDict[6] ||       // APP_RNOTIFY event
                    event.event_name.toUpperCase() === decode.eventNameDict[8] ||       // CRASH event
                    event.event_type.toUpperCase() === decode.eventTypeDict[5]          // CALL group of events
                ) {
                    // this event from the list , where we have to move fields
                    handledEvent.event_data = [];
                    for (let iterator in event[key]) {
                        // iterating over event_data array inside event to handle
                        let eventDataElement = event[key][iterator];

                        if (eventDataElement.label.toUpperCase() === decode.labelDic[5].name.toUpperCase() || // 'CrashName'
                            eventDataElement.label.toUpperCase() === decode.labelDic[6].name.toUpperCase() || // 'CrashReason'
                            eventDataElement.label.toUpperCase() === decode.labelDic[19].name.toUpperCase() || // 'Remote number'
                            eventDataElement.label.toUpperCase() === decode.labelDic[43].name.toUpperCase() || // 'Call duration'
                            eventDataElement.label.toUpperCase() === decode.labelDic[45].name.toUpperCase() || // 'Call direction'
                            eventDataElement.label.toUpperCase() === decode.labelDic[46].name.toUpperCase() || // 'CallId'
                            eventDataElement.label.toUpperCase() === decode.labelDic[62].name.toUpperCase() || // 'Call type'
                            eventDataElement.label.toUpperCase() === decode.labelDic[105].name.toUpperCase() || // 'CrashId'
                            eventDataElement.label.toUpperCase() === decode.labelDic[124].name.toUpperCase() || // 'Remote notify type'
                            eventDataElement.label.toUpperCase() === 'LOCATIONS'
                        ) {
                            // on iteration field to move was found
                            //handling (adding in as main field to event root
                            handledEvent[eventDataElement.label] = eventDataElement.value;
                        }
                        else {
                            // field not from list
                            // just adding to event_data array
                            handledEvent.event_data.push(eventDataElement);
                        }

                    }
                } else {
                    // not from list of events to handle
                    // just adding whole array to new object as it was in incoming  request
                    handledEvent[key] = event[key];
                }
            }

        }

    } else {
        // event in old format from apiv1
        // it has encoded fields by the mobile client

        // adding main fields from req.body
        handledEvent.phone_number = req.body.p;
        handledEvent.phone_ext = req.body.x;
        handledEvent.app_version = req.body.a;
        handledEvent.os_version = req.body.o;
        handledEvent.app_name = req.body.m;
        handledEvent.devManufacturer = req.body.q;
        handledEvent.hw_info = req.body.i;
        handledEvent.os_name = req.body.j;

        //adding fields from event object
        handledEvent.client_date = new Date(parseInt(event.c) * 1000);
        handledEvent.local_ip = event.r;
        handledEvent.tag = event.g;
        handledEvent.db_id = event.b;
        // decoding event name and type
        let decode_event = decode.getEventNameAndType(event.t);
        handledEvent.event_name = decode_event[1];
        handledEvent.event_type = decode_event[0];

        // iterating over event_data
        // checking that current event from one of the events , where we have to move fields
        if (handledEvent.event_name === decode.eventNameDict[30010] || // RT_CALL_END event
            handledEvent.event_name === decode.eventNameDict[6] ||       // APP_RNOTIFY event
            handledEvent.event_name === decode.eventNameDict[8] ||       // CRASH event
            handledEvent.event_type === decode.eventTypeDict[5]          // CALL group of events
        ) {
            // this event from the list , where we have to move fields
            handledEvent.event_data = [];
            for (let iterator in event.e) {
                // iterating over event_data array of objects

                // decoding event_data object to database format
                let eventDataElement = {
                    label: decode.getLabelName(event.e[iterator].z),
                    value: decode.decodeEventValue(event.e[iterator].z, event.e[iterator].k)
                };

                // checking that decoded object is from list and must be moved to main event object root
                if (eventDataElement.label === decode.labelDic[5].name || // 'CrashName'
                    eventDataElement.label === decode.labelDic[6].name || // 'CrashReason'
                    eventDataElement.label === decode.labelDic[19].name || // 'Remote number'
                    eventDataElement.label === decode.labelDic[43].name || // 'Call duration'
                    eventDataElement.label === decode.labelDic[45].name || // 'Call direction'
                    eventDataElement.label === decode.labelDic[46].name || // 'CallId'
                    eventDataElement.label === decode.labelDic[62].name || // 'Call type'
                    eventDataElement.label === decode.labelDic[105].name || // 'CrashId'
                    eventDataElement.label === decode.labelDic[124].name  // 'Remote notify type'
                ) {
                    //handle
                    handledEvent[eventDataElement.label] = eventDataElement.value;
                }
                else {
                    handledEvent.event_data.push(eventDataElement);
                }

            }

        } else {
            // this event name(type) not from handle list
            // iterating over array of event_data , decode it and add to decoded event_data array
            handledEvent.event_data = [];
            for (let iterator in event.e) {
                // iterating over event_data array of objects
                // decoding event_data object to database format
                let eventDataElement = {
                    label: decode.getLabelName(event.e[iterator].z),
                    value: decode.decodeEventValue(event.e[iterator].z, event.e[iterator].k)
                };
                handledEvent.event_data.push(eventDataElement);
            }

        }
    }
    return handledEvent;
}

function eventDataToObject(eventDataArray){
    let eventDataObj={};
    for (let iterator in eventDataArray){
        let label = eventDataArray[iterator].label;
        let value = eventDataArray[iterator].value;
        eventDataObj[label] = value;
    }
    return eventDataObj;
}