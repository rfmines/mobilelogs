'use strict';

'use strict';
var should = require('should');
var assert = require('chai').assert;
var request = require('supertest');
var mongoose = require('mongoose');
var moment = require('moment');
var jwt = require('jsonwebtoken');

var getAccessToken = require('./../supportMethods').getAccessToken;
var encodeBody = require('./../supportMethods').encodeBody;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var url = "https://localhost";
var uri = "/api/v1/session";
/*
 Generates CSL session ID
 Parameters :
 UseValidAccessToken:
 true - uses token from webApi
 false - uses incorrect token (for testing authentication Limitation with counters)
 */
function getCslSessionId(UseValidAccessToken, sessionToken) {
    try {
        if (typeof (UseValidAccessToken) === 'boolean') {
            if (UseValidAccessToken) {

                getAccessToken(function (err, access_token) {
                    if (err) {
                        throw err;
                    } else {

                        var requestBody = {
                            // TODO : After implementing check of APIkey on API-side add here choosing api
                            // API can be fetched directly from the mongo collection
                            apikey: "MochaTestkey",
                            devid: "MochaTestFakeDeviceId",
                            os_version: "9.9.9",
                            os_name: "MochaFramework",
                            hw_info: "MochaTestFakeDeviceName",
                            app_version: "9.9(99999)",
                            // TODO : add multiple apps support - office and HMS with token_generation and then validation here
                            app_name: "mobile",
                            devManufacturer: "MochaFakeManufacturer",
                            access_token: access_token
                        };
                        request(url)
                            .post(uri)
                            .send(encodeBody(requestBody))
                            .end(function (err, res) {
                                if (err) {
                                    console.log('err occurred '+ err);
                                    throw err;
                                } else {
                                    jwt.verify(res.body.data._id, '00MasecR3t', function (err, decoded) {
                                        res.status.should.match(201);
                                        decoded.apikey.should.be.equal(requestBody.apikey);
                                        decoded.devid.should.be.equal(requestBody.devid);
                                        decoded.token_access.should.be.equal(1);
                                        sessionToken(null, res.body.data._id);
                                    });
                                }
                            });
                    }
                });
            } else {
                var requestBody = {
                    apikey: "MochaTestkey",
                    devid: "MochaTestFakeDeviceId",
                    os_version: "9.9.9",
                    os_name: "MochaFramework",
                    hw_info: "MochaTestFakeDeviceName",
                    app_version: "9.9(99999)",
                    app_name: "mobile",
                    devManufacturer: "MochaFakeManufacturer",
                    access_token: "1233456"
                };
                request(url)
                    .post(uri)
                    .send(encodeBody(requestBody))
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            jwt.verify(res.body.data._id, '00MasecR3t', function (err, decoded) {
                                res.status.should.match(201);
                                decoded.apikey.should.be.equal(requestBody.apikey);
                                decoded.devid.should.be.equal(requestBody.devid);
                                decoded.token_access.should.be.equal(0);

                                sessionToken(null, res.body.data._id);
                            });
                        }
                    });
            }
        } else {
            var err = new Error('parameter must be boolean');
            throw err;
        }
    }
    catch (e) {
        console.log("Exception occured on generating CSL session stage. Message: " + e);
        var err = new Error('Exception occured. Check logs');
        sessionToken(err, null);
    }
};
exports.getCslSessionId = getCslSessionId;
