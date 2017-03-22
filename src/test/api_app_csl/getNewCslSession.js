'use strict';

'use strict';
let should = require('should');
let assert = require('chai').assert;
let request = require('supertest');
let mongoose = require('mongoose');
let moment = require('moment');
let jwt = require('jsonwebtoken');

let getAccessToken = require('./../supportMethods').getAccessToken;
let encodeBody = require('./../supportMethods').encodeBody;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
let url = "https://localhost";
let uri_v1 = "/api/v1/session";
let uri_v2 = "/api/v2/session";
/*
 Generates CSL session ID
 Parameters :
 UseValidAccessToken:
 true - uses token from webApi
 false - uses incorrect token (for testing authentication Limitation with counters)
 */
function getCslSessionId(UseValidAccessToken,csl_version, sessionToken) {
    let uriToUse;
    let body2send;
    if (csl_version ===2){
        uriToUse=uri_v2;
        } else {
        uriToUse=uri_v1
    }
    try {
        if (typeof (UseValidAccessToken) === 'boolean') {
            if (UseValidAccessToken) {

                getAccessToken(function (err, access_token) {
                    if (err) {
                        throw err;
                    } else {
                        console.log('Get access token err ' + JSON.stringify(err));
                        console.log('Get access token callback ' + JSON.stringify(access_token));
                        let requestBody = {

                            apikey: "a8eb8550-0888-11e5-80a5-293501daf124",
                            apiKey:"a8eb8550-0888-11e5-80a5-293501daf124", // for csl2.0
                            devid: "MochaTestFakeDeviceId",
                            devId: "MochaTestFakeDeviceId", // for csl2.0
                            os_name: "MochaFramework",
                            hw_info: "MochaTestFakeDeviceName",
                            devManufacturer: "MochaFakeManufacturer",
                            os_version: "9.9.9",
                            app_version: "9.9(99999)",
                            app_name: "mobile",
                            access_token: access_token,
                            node:'Production'
                            };
                        if(csl_version ===2){
                            body2send=requestBody
                        } else {
                            body2send=encodeBody(requestBody);
                        }
                        request(url)
                            .post(uriToUse)
                            .send(body2send)
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
                let requestBody = {

                    apikey: "a8eb8550-0888-11e5-80a5-293501daf124",
                    apiKey:"a8eb8550-0888-11e5-80a5-293501daf124", // for csl2.0
                    devid: "MochaTestFakeDeviceId",
                    devId: "MochaTestFakeDeviceId", // for csl2.0
                    os_name: "MochaFramework",
                    hw_info: "MochaTestFakeDeviceName",
                    devManufacturer: "MochaFakeManufacturer",
                    os_version: "9.9.9",
                    app_version: "9.9(99999)",
                    app_name: "mobile",
                    node:'Production'
                };
                if(csl_version ===2){
                    body2send=requestBody
                } else {
                    body2send=encodeBody(requestBody);
                }
                request(url)
                    .post(uriToUse)
                    .send(body2send)
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
            let err = new Error('parameter must be boolean');
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
