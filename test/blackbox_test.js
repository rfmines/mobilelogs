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

var URL = "http://127.0.0.1:8000";

describe('Basic test', function(){
	it ('Test if applog server is running', function(done){
		var options = { uri: URL+'/check',
						method: "GET" };

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
		var body = { username: "Test user",
								email: "user@gmail.com",
								password: "ooma123"
							};
		var options = { uri: URL+'/api/v1/user',
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
		var options = { uri: URL+'/api/v1/auth',
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
    		console.error('Test user authentication : ',  newUser);
    		done();
    	});
	});


	it('user info', function(done) {
		var options = { uri: URL+'/api/v1/user/' + newUser.data._id,
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

		var options = { uri: URL+'/api/v1/app/' + groupid,
							method: "POST",
							headers: {'Content-Type': 'application/json' , 
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
		var options = { uri: URL+'/api/v1/app/' + groupid,
							method: "GET",
							headers: {'Content-Type': 'application/json' , 
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
		var options = { uri: URL+'/api/v1/app/' + newApp.apikey,
							method: "DELETE",
							headers: {'Content-Type': 'application/json' , 
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
			apikey: newApp.apikey,
			devid: 'abcd2134',
			created_date: new Date(),
			os: 'IOS',
			devtype: 'iPhone',
			devmanufacturer: 'Apple',
			osVersion: '8.1',
			appVersion: '5.1',
			buildVersion: '9999',
			appName: 'Mobile res'
		};

		var options = { uri: URL+'/api/v1/session', 
							method: "POST",
							headers: {'Content-Type': 'application/json' , 
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
			apikey: newApp.apikey,
			devid: 'abcd2134',
			sessionid: newSession._id,
			data: [{
					level: 4,
					log: 'Log test 1'
				},{
					level: 5,
					log: 'Log test 2'
				}
			]
		};

		var options = { uri: URL+'/api/v1/log',
							method: "POST",
							headers: {'Content-Type': 'application/json' , 
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

	it('user deletion', function(done) {
		var options = { uri: URL+'/api/v1/user/'+newUser.data._id,
						method: "DELETE",
						headers: {'Content-Type': 'application/json' , 'authorization': 'authToken '+ newUser.data.authToken }
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
})

