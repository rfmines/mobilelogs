'use strict';

var htmlSymbols = require('./../../api/dictionary').htmlBodyValues;
var decode = require('./../../api/decode');
var moment = require('moment');

/* exports.encodeBody =*/
// encoding body in the same way as mobile app do this
// note : encodeBody invokes itself (recursion)
function encodeBody(body) {
    var decodedBody = {};
    for (var iter in body) {
        // looking for field short name , for HTTP req
        var decodedKey = htmlSymbols[iter];
        // for arrays we need to dive inside it and iterate over each object in the array
        // for that case we are using recursion
        if (!Array.isArray(body[iter])) {

            if (iter === 'event_name') {
                decodedBody[decodedKey] = decode.encodeEventType(body[iter])
            }
            else if (iter === 'label') {
                decodedBody[decodedKey] = decode.encodeLabel(body['label'])
            }
            else if (iter === 'value') {
                decodedBody[decodedKey] = decode.encodeValue(body['label'], body['value'])
            }
            else if (['latitude','longitude','timestamp','motion'].indexOf(iter) !== -1) {

                decodedBody[decode.encodeLabel(iter)] = body[iter];
            }
            else if (decodedKey === null || decodedKey === undefined) {
                continue;
            } else {
                decodedBody[decodedKey] = body[iter];
            }
        } else {
            var encodedArray = [];
            for (var arrayiter in body[iter]) {
                encodedArray.push(encodeBody(body[iter][arrayiter]))
            }
            decodedBody[decodedKey] = encodedArray;
        }
    }
    return decodedBody;
}

/* TODO remove this later
var requestBody = {
    apikey: "MochaTestkey",
    devid: "MochaTestFakeDeviceId",
    os_version: "9.9.9",
    os_name: "MochaFramework",
    hw_info: "MochaTestFakeDeviceName",
    app_version: "9.9(99999)",
    app_name: "Mocha",
    devManufacturer: "MochaFakeManufacturer",
    access_token: '123',
    data: [
        {
            db_id: 1,
            tag: "MochaTag",
            event_type: "CALL",
            event_name: "CALL_END",
            local_ip: '192.168.1.1',
            client_date: '1473769043',
            event_data: [
                {
                    label: "Network status",
                    value: "Not Reachable"
                },
                {
                    label: "SIP call status",
                    value: "Call_transfer_decline"
                },
                {
                    label: "User_route",
                    value: [
                        {'latitude': 11.11, 'longitude': 22.22, 'timestamp':  moment().format('X'), 'motion': 'unknown'},
                        {'latitude': 9.9, 'longitude': 8.8, 'timestamp': moment().format('X'), 'motion': 'stand'}
                    ]
                }
            ]
        }
    ]
};

console.log(JSON.stringify(encodeBody(requestBody)));
    */
exports.encodeBody = encodeBody;