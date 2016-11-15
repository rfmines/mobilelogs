/**
 * Blackbox test for app logger
 * 
 * Use mocha to run this script
 * Example:
 *
 * $ mocha event_names_test.js

 */
"use strict";

var request = require('request');
var mongoose = require('mongoose');
var request = require('supertest');
var chai = require('chai');

var assert = chai.assert;
var should = chai.should();

var config = require('../config');
var eventNameModel = require('../db/event_name_model');

process.env.NODE_ENV = 'test';
var app = require('../server');


describe('Label', function() {

  var newUser = null;
  var groupid = null;
  var userid = null;
  var event_name = null;

  before(function (done) {
    var db_config = require('../db/config')["test"].database;
    mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db, function () {
      mongoose.connection.db.dropDatabase(function () {

        eventNameModel.create( {id: 99999, name: 'Undefined'} ).then(function (item) {
          event_name = item;
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
    it('should return event_names', function (done) {

      request(app)
        .get('/api/v1/event_names')
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
          assert.lengthOf( body.event_names, 1 );
          done();
        });

    });
  });

  describe('Get', function(){
    it('should return event_name by id', function (done) {

      request(app)
        .get('/api/v1/event_names/' + event_name._id)
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
          should.exist( body.event_name );
          done();
        });

    });
  });

  describe('Post', function(){
    it('should create event_name', function (done) {

      request(app)
        .post('/api/v1/event_names')
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .send({ event_name: {id: 0, name: 'APP_START'} })
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
    it('should update event_name', function (done) {
      var name = 'APP_BG';

      request(app)
        .put('/api/v1/event_names/' + event_name._id)
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .send({ event_name: {name: name} })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var body = res.body;
          should.not.exist( err );
          assert.equal( res.statusCode, 200 );
          assert.equal( body.status, 'success' );
          assert.equal( body.event_name.name, name );
          done();
        });

    });
  });


  describe('Remove', function(){

    it('should remove event_name by id', function (done) {

      request(app)
        .delete('/api/v1/event_names/' + event_name._id)
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
