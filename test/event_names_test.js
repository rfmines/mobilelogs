/**
 * Blackbox test for app logger
 * 
 * Use mocha to run this script
 * Example:
 *
 * $ mocha event_names_test.js

 */
"use strict";

var config = require('../config');
var request = require('request');
var assert = require('assert');
var util = require('util');
var qs = require('qs');
var qss = qs.stringify;
var mongoose = require('mongoose');

var eventNameModel = require('../db/event_name_model');


var URL = "http://127.0.0.1:8000";

describe('Event Name', function() {

  var newUser = null;
  var groupid = null;
  var userid = null;
  var eventName = null;

  before(function (done) {
    var db_config = require('../db/config')["test"].database;
    mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db, function () {
      mongoose.connection.db.dropDatabase(function () {

        eventNameModel.create( {key: 99999, name: 'Undefined'} ).then(function (item) {
          eventName = item;
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
    it('should return event names', function (done) {

      var options = {
        uri: URL + '/api/v1/event_names',
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

        //console.log('Get event names return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        body = JSON.parse( body ) ;

        assert.equal('success', body.status);
        assert.equal(1, body.event_names.length);

        done();
      });
    });
  });

  describe('Get', function(){
    it('should return event name by id', function (done) {
      var options = {
        uri: URL + '/api/v1/event_names/' + eventName._id,
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

        //console.log('Get event name by id return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        body = JSON.parse( body ) ;
        assert.equal('success', body.status);

        done();
      });
    });
  });

  describe('Post', function(){
    it('should create event name', function (done) {

      var options = {
        uri: URL + '/api/v1/event_names',
        method: "POST",
        json: {
          event_name: {key: 0, name: 'APP_START'}
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

        //console.log('Create event names return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        assert.equal('success', body.status);

        done();
      });
    });
  });

  describe('Update', function(){
    it('should update event name', function (done) {

      var options = {
        uri: URL + '/api/v1/event_names/' + eventName._id,
        method: "PUT",
        json: {
          event_name: { name: 'APP_BG'}
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

        //console.log('update event names return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        assert.equal('success', body.status);

        done();
      });
    });
  });


  describe('Remove', function(){

    it('should remove event name by id', function (done) {
      var options = {
        uri: URL + '/api/v1/event_names/' + eventName._id,
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

        //console.log('Remove event name by id return : ', body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        body = JSON.parse( body ) ;
        assert.equal('success', body.status);

        done();
      });
    });

  });

});
