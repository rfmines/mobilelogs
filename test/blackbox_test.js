/**
 * Blackbox test for app logger
 * 
 * Use mocha to run this script
 * Example:
 *
 * $ mocha blackbox_test.js
 *
 * @author: Yeffry Zakizon
 * @copyright: Ooma Inc, 2014
 */
"use strict";

var config = require('../config');
var request = require('request');
var mongoose = require('mongoose');
var request = require('supertest');
var assert = require('assert');
var chai = require('chai');
var should = chai.should();
var util = require('util');
var qs = require('qs');
var qss = qs.stringify;
var mongoose = require('mongoose');

var LogModel = require('../db/log_model');
var ObjectId = require('mongoose').Types.ObjectId;
var LogLogData = LogModel.LogLogData;

process.env.NODE_ENV = 'test';
var app = require('../server');

describe('Basic test', function(){
  it ('Test if applog server is running', function(done){

    request(app)
      .get('/check')
      .expect(200)
      .end(function(err, res) {
        should.not.exist( err );
        done();
      });

  });
});

describe('Testing User. ', function() {
  var newUser = null;
  var groupid = null;
  var userid = null;

  before(function (done) {
    var db_config = require('../db/config')["test"].database;
    mongoose.connect('mongodb://' + db_config.host + '/'+ db_config.db, function(){
      mongoose.connection.db.dropDatabase(function() {
        done();
      });
    });
  });


  it('Test user creation', function(done) {
    var body = {
      username: "Test user",
      email: "user@gmail.com",
      password: "ooma123"
    };

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json')
      .send( body )
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        should.not.exist( err );
        done();
      });

  });

  it('user authentication', function (done) {
    var body = {
      username: "user@gmail.com",
      password: "ooma123"
    };

    request(app)
      .get('/api/v1/auth')
      .set('Content-Type', 'application/json')
      .send( body )
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        should.not.exist( err );

        newUser = res.body;
        userid = newUser.data._id;
        groupid = newUser.data.groups[0];
        done();
      });
  });


  it('user info', function(done) {
    request(app)
      .get('/api/v1/user/' + newUser.data._id)
      .set('Content-Type', 'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect(200)
      .end(function(err, res) {
        should.not.exist( err );

        var user = res.body;
        assert.equal(user.email, newUser.email);
        assert.equal(user.username, newUser.username);
        done();
      });

  });

  var newApp = null;
  it('Create new app', function(done){
    var body = {
      userid: userid,
      appname : 'Test App',
      apptype : 'Beta',
      os: 'Iphone'
    };

    request(app)
      .post('/api/v1/app/' + groupid)
      .set('Content-Type', 'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .send( body )
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        should.not.exist( err );
        newApp = res.body.data;
        done();
      });

  });

  it('Get all apps', function(done) {

    request(app)
      .get('/api/v1/app/' + groupid)
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var app = res.body;
        should.not.exist( err );
        assert.equal( app.data.length, 1 );

        assert.equal(app.data[0].apikey, newApp.apikey);
        done();
      });

  });

  it('Delete apps', function(done) {
    request(app)
      .delete('/api/v1/app/' + newApp.apikey)
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );
        assert.equal( res.statusCode, 200 );
        assert.equal( body.status, 'success' );

        done();
      });

  });

  var newSession = null;
  it('Create new session', function(done){
    var body = {
      f: newApp.apikey,
      h: 'abcd2134',
      created_date: new Date(),
      j: 'IOS',
      devtype: 'iPhone',
      q: 'Apple',
      o: '8.1',
      a: '5.1',
      buildVersion: '9999',
      m: 'Mobile res'
    };

    request(app)
      .post('/api/v1/session')
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .send( body )
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );
        assert.equal( res.statusCode, 201 );
        assert.equal( body.status, 'success' );
        newSession = body.data;
        done();
      });
 
  });

  it('Get log event types data', function(done){
    var body = {
      f: newApp.apikey,
      h: 'abcd2134',
      s: newSession._id,
      p: 2658426895,
      d: [{
        c: 1478253121,
        v: 4,
        l: 'Log test 1'
      },{
        c: 1478253121,
        v: 5,
        l: 'Log test 2'
      }]
    };

    request(app)
      .get('/api/v1/event_types')
      .send(body)
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );
        assert.equal( res.statusCode, 200 );

        assert.equal( body.status, 'success' );
        done();
      });

  });

  it('Save log data', function(done){
    var body = {
      f: newApp.apikey,
      h: 'abcd2134',
      s: newSession._id,
      p: 2658426895,
      d: [{
        c: 1478253121,
        v: 4,
        l: 'Log test 1'
      },{
        c: 1478253121,
        v: 5,
        l: 'Log test 2'
      }]
    };

    request(app)
      .post('/api/v1/log')
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .send(body)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );
        assert.equal( body.status, 'success' );
        done();
      });

  });

  it('Get log data by device id', function(done){
    var devid = 'abcd2134';
    var format = 'json';
    var start_date = -1;

    request(app)
      .get('/api/v1/log/' + devid)
      .send({
        format: format,
        devid: devid,
        start_date: -1
      })
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );
        assert.equal( body.status, 'success' );
        assert.equal(2, body.data.length);
        done();
      });

  });

  it('Get log data by phone_number', function(done) {
    var devid = 'abcd2134';
    var logData = new LogLogData({
      sessionid: newSession._id,
      apikey: newApp.apikey,
      devid: devid,
      created_date : Date.now(),
      client_date :  new Date(1478179947*1000),
      level: 5,
      log: 'Log test 2',
      phone_number: 2658261895,
      os_name: 'iOS phone'
    });

    logData.save(function(err, log) {
      request(app)
        .get('/api/v1/log/' + devid)
        .send({
          format: 'json',
          devid: devid,
          phone_number: '2658261895',
          start_date: -1
        })
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var body = res.body;
          should.not.exist( err );
          assert.equal( body.status, 'success' );
          assert.equal(1, body.data.length);
          done();
        });

    });
  });

  it('Get log data by phone_number', function(done) {
    var devid = 'abcd2134';
    request(app)
      .get('/api/v1/log/' + devid)
      .send({
        format: 'json',
        devid: devid,
        phone_number: '2222222222'
      })
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );

        assert.equal( body.status, 'success' );
        assert.equal(0, body.data.length);
        done();
      });

  });

  it('user deletion', function(done) {
    request(app)
      .delete('/api/v1/user/' + newUser.data._id)
      .set('Content-Type',  'application/json')
      .set('Accept',        'application/json')
      .set('authorization', 'authToken ' + newUser.data.authToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.not.exist( err );
        assert.equal( body.status, 'success' );

        done();
      });
  });
});
