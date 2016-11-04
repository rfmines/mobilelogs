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
var assert = require('assert');
var util = require('util');
var qs = require('qs');
var qss = qs.stringify;
var mongoose = require('mongoose');

var LogModel = require('../db/log_model');
var ObjectId = require('mongoose').Types.ObjectId;
var LogLogData = LogModel.LogLogData;

var URL = "http://127.0.0.1:8000";

describe('Basic test', function(){
  it ('Test if applog server is running', function(done){
    var options = {
      uri: URL + '/check',
      method: "GET"
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Please check if applog server is running at: %s. Error: %s', URL, error.message);
        done();
        process.exit(1);
        return;
      }
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      assert.equal('200 OK\r\n', body);

      done();

    });
  });
});

describe('Testing User. ', function() {
  var newUser = null;
  var groupid = null;
  var userid = null;

  it('Test user creation', function(done) {
    var body = {
      username: "Test user",
      email: "user@gmail.com",
      password: "ooma123"
    };
    var options = {
      uri: URL + '/api/v1/user',
      method: "POST",
      json: body,
    };
    request(options, function(error, res, body) {
      if (error) {
        console.error('Test user creation Error: s',  error.message);
        done();
        return;
      }
      assert.equal(null, error);
      assert.equal(201, res.statusCode);

      done();
    });
  });

  it ('user authentication', function(done) {
    var body = {
      username: "user@gmail.com",
      password: "ooma123"
    };
    var options = {
      uri: URL + '/api/v1/auth',
      method: "GET",
      json: body,
      headers: {'Content-Type': 'application/json'},
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test user authentication Error: ',  error.message);
        done();
        return;
      }
      console.log('Test user auth: ',  body);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      newUser = body;
      userid = newUser.data._id;
      groupid = newUser.data.groups[0];
      console.log("groupid", groupid);
      console.error('Test user authentication : ',  newUser);
      done();
    });
  });


  it('user info', function(done) {
    var options = {
      uri: URL + '/api/v1/user/' + newUser.data._id,
      method: "GET",
      headers: {'Content-Type': 'application/json' , 'authorization': 'authToken '+ newUser.data.authToken }
    };    
    request(options, function(error, res, body) {
      if (error) {
        console.error('Test get user Error: ',  error.message);
        done();
        return;
      }
      var user = JSON.parse(body);
      console.log('Test get user body: ',  user);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
          
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

    var options = {
      uri: URL+'/api/v1/app/' + groupid,
      method: "POST",
      headers: { 'Content-Type': 'application/json' , 
                 'Accept': 'application/json', 
                 'authorization': 'authToken '+ newUser.data.authToken },
      json: body
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test create new app Error: ',  error.message);
        done();
        return;
      }

      console.log('Test create new app body: ',  body);
      assert.equal(null, error);
      assert.equal(201, res.statusCode);
      assert.equal('success', body.status);
      newApp = body.data;

      done();
    }); 
  });

  it('Get all apps', function(done) {
    var options = {
      uri: URL + '/api/v1/app/' + groupid,
      method: "GET",
      headers: { 'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'authorization': 'authToken '+ newUser.data.authToken },
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test get all apps Error: ',  error.message);
        done();
        return;
      }

      var app = JSON.parse(body);
      console.log('Test get all apps body: ',  app);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      assert.equal('success', app.status);
      assert.notEqual(0, app.data.length);

      for(var i;i<app.data.length;i++) {
        if (app.data[i].name == newApp.name) {
          assert.equal(app.data[i].apikey, newApp.apikey);
        }
      }

      done();
    }); 
  });

  it('Delete apps', function(done) {
    var options = {
      uri: URL + '/api/v1/app/' + newApp.apikey,
      method: "DELETE",
      headers: { 'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'authorization': 'authToken '+ newUser.data.authToken },
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test Delete apps Error: ',  error.message);
        done();
        return;
      }

      var app = JSON.parse(body);
      console.log('Test delete apps body: ',  app);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      assert.equal('success', app.status);
      assert.notEqual(0, app.data.length);

      for(var i;i<app.data.length;i++) {
        if (app.data[i].name == newApp.name) {
          assert.equal(app.data[i].apikey, newApp.apikey);
        }
      }

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

    var options = {
      uri: URL + '/api/v1/session', 
      method: "POST",
      headers: { 'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'authorization': 'authToken '+ newUser.data.authToken },
      json: body
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test create new session Error: ',  error.message);
        done();
        return;
      }

      console.log('Test create new session body: ',  body);
      assert.equal(null, error);
      assert.equal(201, res.statusCode);
      assert.equal('success', body.status);
      newSession = body.data;

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

    var options = {
      uri: URL + '/api/v1/log',
      method: "POST",
      headers: { 'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'authorization': 'authToken '+ newUser.data.authToken },
      json: body
    };  

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test save log Error: ',  error.message);
        done();
        return;
      }

      console.log('Test save log body: ',  body);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      assert.equal('success', body.status);

      done();
    });
  });

  it('Get log data by device id', function(done){
    var devid = 'abcd2134';
    var format = 'json';
    var start_date = -1;

    var options = {
      uri: URL + '/api/v1/log/' + devid,
      method: "GET",
      headers: { 'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'authorization': 'authToken '+ newUser.data.authToken },
      json: {
        format: format,
        devid: devid,
        start_date: -1
      }
    };  

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test save log Error: ',  error.message);
        done();
        return;
      }

      console.log('Test save log body: ',  body);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      assert.equal('success', body.status);
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
      var options = {
        uri: URL + '/api/v1/log/' + devid,
        method: "GET",
        headers: { 'Content-Type': 'application/json',
                   'Accept': 'application/json',
                   'authorization': 'authToken '+ newUser.data.authToken },
        json: {
          format: 'json',
          devid: devid,
          phone_number: '2658261895',
          start_date: -1
        }
      };  

      request(options, function(error, res, body) {
        if (error) {
          console.error('Test save log Error: ',  error.message);
          done();
          return;
        }

        console.log('Test save log body: ',  body);
        assert.equal(null, error);
        assert.equal(200, res.statusCode);
        assert.equal('success', body.status);
        assert.equal(1, body.data.length);

        done();
      });
    });
  });

  it('Get log data by phone_number', function(done) {
    var devid = 'abcd2134';
    var options = {
      uri: URL + '/api/v1/log/' + devid,
      method: "GET",
      headers: { 'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'authorization': 'authToken '+ newUser.data.authToken },
      json: {
        format: 'json',
        devid: devid,
        phone_number: '2222222222'
      }
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Test save log Error: ',  error.message);
        done();
        return;
      }

      console.log('Test save log body: ',  body);
      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      assert.equal('success', body.status);
      assert.equal(0, body.data.length);

      done();
    });

  });

  it('user deletion', function(done) {
    var options = {
      uri: URL + '/api/v1/user/' + newUser.data._id,
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' ,
                 'authorization': 'authToken '+ newUser.data.authToken }
    };

    request(options, function(error, res, body) {
      if (error) {
        console.error('Delete user error: s',  error.message);
        done();
        return;
      }

      assert.equal(null, error);
      assert.equal(200, res.statusCode);
      done();

    });
  });
});
