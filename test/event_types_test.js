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

var eventTypeModel = require('../db/event_type_model');


var URL = "http://127.0.0.1:8000";

describe('Event Type', function() {

  var newUser = null;
  var groupid = null;
  var userid = null;
  var eventName = null;

  before(function (done) {
    var db_config = require('../db/config')["test"].database;
    mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db, function () {
      mongoose.connection.db.dropDatabase(function () {

        eventTypeModel.create( {key: 99999, Type: 'Undefined'} ).then(function (item) {
          eventType = item;
          done();
        });
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
      //console.log("groupid", groupid);
      //console.error('Test user authentication : ', newUser);
      done();
    });
  });


  describe('Get all', function(){
    it('should return event Types', function (done) {

      var options = {
        uri: URL + '/api/v1/event_types',
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

        //console.log('Get event types return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        body = JSON.parse( body ) ;

        assert.equal('success', body.status);
        assert.equal(1, body.event_types.length);

        done();
      });
    });
  });

  describe('Get', function(){
    it('should return event type by id', function (done) {
      var options = {
        uri: URL + '/api/v1/event_types/' + eventType._id,
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

        //console.log('Get event type by id return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        body = JSON.parse( body ) ;
        assert.equal('success', body.status);

        done();
      });
    });
  });

  describe('Post', function(){
    it('should create event type', function (done) {

      var options = {
        uri: URL + '/api/v1/event_types',
        method: "POST",
        json: {
          event_type: {key: 0, type: 'APP_START'}
        },
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

        //console.log('Create event types return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        assert.equal('success', body.status);

        done();
      });
    });
  });

  describe('Update', function(){
    it('should update event type', function (done) {

      var options = {
        uri: URL + '/api/v1/event_types/' + eventType._id,
        method: "PUT",
        json: {
          event_type: { id: '12' , name: 'APP_BG'}
        },
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

        //console.log('update event types return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        assert.equal('success', body.status);

        done();
      });
    });
  });


  describe('Remove', function(){

    it('should remove event type by id', function (done) {
      var options = {
        uri: URL + '/api/v1/event_types/' + eventType._id,
        method: "DELETE",
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

        //console.log('Remove event type by id return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        body = JSON.parse( body ) ;
        assert.equal('success', body.status);

        done();
      });
    });

  });

});
