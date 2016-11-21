'use strict';
var randomGenerator = require('./../supportMethods/randomGenerator').randomGenerator;
var decode = require('./../../api/decode');
var dictionary = require('./../../api/dictionary');
var moment = require('moment');

function generateCslDataSet(sessionId,phoneNumber,devId) {
    var body2send = {
        apikey: 'MochaTestkey',
        devid: devId,
        sessionid: sessionId,
        app_version: randomGenerator(10, 'double').toString() + '(' + randomGenerator(99999, 'int') + ')',
        os_version: randomGenerator(10, 'double').toString(),
        app_name: 'mobile',
        devManufacturer: 'MochaFakeManufacturer',
        hw_info: 'MochaTestFakeDeviceName',
        os_name: 'MochaFramework',
        phone_number: phoneNumber,
        phone_ext: randomGenerator(9999, 'int'),
        data: []
    };

    for (var eventId in decode.eventNameDict) {
        var subEvent = generateEventData(decode.eventNameDict[eventId]);
        if (subEvent !== null) {
            body2send.data.push(subEvent);
        }
    }

    return body2send;
}

function generateEventData(eventId) {
    var newEvent = {};

    newEvent.db_id = eventId;
    newEvent.tag = randomGenerator(10, 'string');
    newEvent.event_name = decode.getEventNameAndType(eventId)[1];
    newEvent.event_type = decode.getEventNameAndType(eventId)[0];
    newEvent.client_date = moment().format('X');
    newEvent.local_ip = randomGenerator(255, 'int') + '.' + randomGenerator(255, 'int') + '.' + randomGenerator(255, 'int') + '.' + randomGenerator(255, 'int');
    newEvent.event_data = [];
    var eventEntity = dictionary.possibleDataInEvents[newEvent.event_name];
    if (eventEntity !== undefined) {
        if (eventEntity.length === 0) {
            return newEvent;
        } else {
            for (var arr_id in eventEntity) {
                var labelObj = decode.labelDic[eventEntity[arr_id]];
                var valueObj = decode.valueDic[eventEntity[arr_id]];
                if (valueObj === undefined) {
                    newEvent.event_data.push({label: labelObj.name, value: randomGenerator(10, labelObj.type)})
                } else {
                    for (var valKey in valueObj) {
                        newEvent.event_data.push({label: labelObj.name, value: valueObj[valKey]})
                    }
                }

            }

            return newEvent;
        }
    }
    else {
        return null;
    }
}

exports.generateCslDataSet = generateCslDataSet;
