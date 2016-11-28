'use strict';
var request = require('supertest');
var assert = require('chai').assert;
var should = require('should');
var getNewCslSession = require('./getNewCslSession').getCslSessionId;
var generateEvents = require('./generateEvent').generateCslDataSet;
var encodeBody = require('./../supportMethods/encodeBody').encodeBody;

var db = require('./../../db/log_model').db;
var LogEvent = require('./../../db/log_model').LogEvent;
var url = 'https://localhost';
var uri = '/api/v1/event';

var phoneNumber = '9616340571';
var devId = 'MochaTestFakeDeviceId';
var generatedEvents;
var fetchedEvents;
console.log('Running API tests');
exports.runCslDataTest = function runCslDataTest() {
    describe('Testing ALL events with ALL possible values', function () {
        before(function (done) {
            LogEvent.remove({phone_number: phoneNumber}, function (err, result) {
                if (err) {
                    console.log('err occurred ' + err);
                    throw err;
                } else {
                    console.log('Removing documents before running tests ');
                    console.log('Events collection results:' + JSON.parse(result).n);
                    done();
                }
            });
        });
        describe('Main test', function () {
            it('Sending events', function (done) {
                getNewCslSession(true, function (err, session) {
                    if (err) {
                        console.log('Err occured' + err);
                        throw err;
                    } else {
                        generatedEvents = generateEvents(session, phoneNumber, devId);
                        /*
                         console.log('Generated data for sending');
                         console.log(JSON.stringify(data2send));
                         console.log('---------------------------');
                         console.log('Encoding data before sending');
                         console.log(JSON.stringify(encodeBody(data2send)));
                         console.log('---------------------------');
                         */
                        request(url)
                            .post(uri)
                            .send(encodeBody(generatedEvents))
                            .end(function (err, res) {
                                if (err) {
                                    console.log('err occurred ' + err);
                                    throw err;
                                } else {
                                    console.log('Responce after sending data', res.body);
                                    res.status.should.be.equal(200);
                                    res.body.status.should.be.equal('success');
                                    done();
                                }
                            });
                    }
                });
            });
            it('Waiting 3 sec for DB handle all records', function (done) {
                done();
            });
            it('Preparation completed', function (done) {
                this.timeout(0);
                setTimeout(done, 3000);
            });

            it('Fetch new events from the Database', function (done) {
                this.retries(3);
                LogEvent.find({phone_number: phoneNumber}, function (err, fetchResults) {
                    if (err) {
                        console.log('Error occured while fetching events from Database');
                        console.log(err);
                        throw err;
                    } else {
                        fetchedEvents = fetchResults;
                        fetchResults.length.should.be.equal(generatedEvents.data.length);
                        done();
                    }
                });
            });

            it('Comparing data from Database with generated data', function (done) {
                for (var iterator in generatedEvents.data) {
                    // TODO : implement compare of generatedData with handled data by app , which stored in mongo
                    console.log(normilizeEvent(generatedEvents , iterator));
                    //JSON.stringify(generatedEvents[iterator]);
                }
                done();
            });
        });
    });
};

function compareData(sentEvent, mongoEvent) {
    
    null;
}

// move all special fields , which must be moved from array to main body
// implement the same functionality as api when it handles request with events data
function normilizeEvent(fullEventBody, iterator) {
    var result = {};
    for (var key in fullEventBody) {
        if (fullEventBody[key] !== 'data') {
            result[key] = fullEventBody[key];
        }
    }
    result.data = fullEventBody.data;
    return result;
}