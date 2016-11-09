/**
 * Blackbox test for app logger
 * 
 * Use mocha to run this script
 * Example:
 *
 * $ mocha labels_test.js

 */
"use strict";

var request = require('request');
var mongoose = require('mongoose');
var request = require('supertest');
var chai = require('chai');

var assert = chai.assert;
var should = chai.should();

var config = require('../config');
var labelModel = require('../db/label_model');

process.env.NODE_ENV = 'test';
var app = require('../server');


describe('Label', function() {

  var newUser = null;
  var groupid = null;
  var userid = null;
  var label = null;

  before(function (done) {
    var db_config = require('../db/config')["test"].database;
    mongoose.connect('mongodb://' + db_config.host + '/' + db_config.db, function () {
      mongoose.connection.db.dropDatabase(function () {

        labelModel.create( {key: 99999, name: 'Undefined'} ).then(function (item) {
          label = item;
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
    it('should return labels', function (done) {

      request(app)
        .get('/api/v1/labels')
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
          assert.lengthOf( body.labels, 1 );
          done();
        });

    });
  });

  describe('Get', function(){
    it('should return label by id', function (done) {

      request(app)
        .get('/api/v1/labels/' + label._id)
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
          should.exist( body.label );
          done();
        });

    });
  });

  describe('Post', function(){
    it('should create label', function (done) {

      request(app)
        .post('/api/v1/labels')
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .send({ label: {key: 0, name: 'APP_START'} })
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
    it('should update label', function (done) {
      var name = 'APP_BG';

      request(app)
        .put('/api/v1/labels/' + label._id)
        .set('Content-Type',  'application/json')
        .set('Accept',        'application/json')
        .set('authorization', 'authToken ' + newUser.data.authToken)
        .send({ label: {name: name} })
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          var body = res.body;
          should.not.exist( err );
          assert.equal( res.statusCode, 200 );
          assert.equal( body.status, 'success' );
          assert.equal( body.label.name, name );
          done();
        });

    });
  });


  describe('Remove', function(){

    it('should remove label by id', function (done) {

      request(app)
        .delete('/api/v1/labels/' + label._id)
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
