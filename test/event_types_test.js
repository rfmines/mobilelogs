/**
 * Blackbox test for app logger
 * 
 * Use mocha to run this script
 * Example:
 *
 * $ mocha event_types_test.js

 */
"use strict";

var config = require('../config');
var request = require('request');
var assert = require('assert');
var util = require('util');
var qs = require('qs');
var qss = qs.stringify;
var mongoose = require('mongoose');

var LogModel = require('../db/log_model');
var ObjectId = require('mongoose').Types.ObjectId;
var LogLogData = LogModel.LogLogData;

var URL = "http://127.0.0.1:8000";

describe('Basic test', function() {

    var newUser = null;
    var groupid = null;
    var userid = null;

    before(function (done) {
      var db_config = require('../db/config')["test"].database;
      mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db, function () {
        mongoose.connection.db.dropDatabase(function () {
          done();
        });
      });
    });


    it('Test user creation', function (done) {
      var body = {
        username: "Test user",
        email: "user@gmail.com",
        password: "ooma123"
      };
      var options = {
        uri: URL + '/api/v1/user',
        method: "POST",
        json: body
      };
      request(options, function (error, res, body) {
        if (error) {
          console.error('Test user creation Error: s', error.message);
          done();
          return;
        }
        assert.equal(null, error);
        assert.equal(201, res.statusCode);

        done();
      });
    });

    it('user authentication', function (done) {
      var body = {
        username: "user@gmail.com",
        password: "ooma123"
      };
      var options = {
        uri: URL + '/api/v1/auth',
        method: "GET",
        json: body,
        headers: {'Content-Type': 'application/json'}
      };

      request(options, function (error, res, body) {
        if (error) {
          console.error('Test user authentication Error: ', error.message);
          done();
          return;
        }
        console.log('Test user auth: ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        newUser = body;
        userid = newUser.data._id;
        groupid = newUser.data.groups[0];
        console.log("groupid", groupid);
        console.error('Test user authentication : ', newUser);
        done();
      });
    });
    it('Get log event types data', function (done) {

      var options = {
        uri: URL + '/eventtypes/list',
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': 'authToken ' + newUser.data.authToken
        }
      };

      request(options, function (error, res, body) {
        if (error) {
          console.error('Test save log Error: ', error.message);
          done();
          return;
        }

        console.log('Get event types return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        assert.equal('success', body.status);

        done();
      });
    });

  });

