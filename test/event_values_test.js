/**
 * Blackbox test for app logger
 *
 * Use mocha to run this script
 * Example:
 *
 * $ mocha event_values_test.js

 */
"use strict";

var request = require('request');
var mongoose = require('mongoose');
var request = require('supertest');
var chai = require('chai');

var assert = chai.assert;
var should = chai.should();

var config = require('../config');
var eventValueModel = require('../db/event_value_model');

process.env.NODE_ENV = 'test';
var app = require('../server');

describe('Event Type', function() {

  var newUser = null;
  var groupid = null;
  var userid = null;
  var eventValue = null;

  before(function (done) {
    var db_config = require('../db/config')["test"].database;
    mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db, function () {
      mongoose.connection.db.dropDatabase(function () {

        eventValueModel.create( {id: 99999, values: [ {"0":"Not Reachable"}, {"1":"Reachable Wifi"} ]} ).then(function (item) {
          eventValue = item;
          console.log(item);
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

  describe('Get all', function(){
    it('should return event Types', function (done) {
      request(app)
        .get('/api/v1/event_values')
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
          assert.lengthOf( body.event_values, 1 );
          done();
        });

    });
  });

  describe('Get', function(){
    it('should return event type by id', function (done) {
      request(app)
        .get('/api/v1/event_values/' + eventValue._id)
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var body = res.body;
          should.not.exist( err );
          assert.equal(200, res.statusCode);
          assert.equal( body.status, 'success' );
          should.exist( body.event_value );
          done();
        });

    });
  });

  describe('Post', function(){
    it('should create event type', function (done) {

      request(app)
        .post('/api/v1/event_values')
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .send({ event_value: {id: 0, values: [{ "-1":"Reg_Invalid" }] } })
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
  });

  describe('Update', function(){
    it('should update event type', function (done) {
      var values = [
        {"0":"No"},
        {"1":"Yes"}
      ];

      request(app)
        .put('/api/v1/event_values/' + eventValue._id)
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .send({ event_value: {values: values} })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var body = res.body;
          should.not.exist( err );
          assert.equal( res.statusCode, 200 );
          assert.equal( body.status, 'success' );
          assert.deepEqual( body.event_value.values, values );
          done();
        });

    });
  });


  describe('Remove', function(){

    it('should remove event type by id', function (done) {

      request(app)
        .delete('/api/v1/event_values/' + eventValue._id)
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

  });

});
