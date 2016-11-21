'use strict';

var md5 = require('md5');

var request = require('supertest');
var moment = require('moment');


function getAccessToken (access_token){
    var url = 'https://apiv2.ooma.com';
    var hardwareId = '352070073115717';//'1d02b245bbd6a6b1';
    var appId='iphone_app';

    var versionId='125461';
    // TODO : move this credentials (appSercret for iOS,phoneNumber and password to config)
    var oomaAccount='6503002106';
    var password='123ooma123';
    var appSecret ='b3ftsrryfcgfmsp46wf2dhpbv8bpnu2b'; //iOS mobile app secret key for webApi auth
    var timestamp = moment().format('x')*1000;

    var signature = md5(timestamp+hardwareId+appSecret);
    var uriphaseOne = '/v1/ooauth/request_token?'+'time='+timestamp+'&app_id='+appId+'&hard_id='+hardwareId+
        '&version_id='+versionId+'&signature='+signature;

    request(url)
        .get(uriphaseOne)
        .end(function (err,res){
            if (err){ console.log(err); access_token(err,null);} else {
                var signature_2 = md5(res.body.request_token+oomaAccount+password+appSecret);
                var uriPhaseTwo = '/v1/sessions?request_token='+res.body.request_token+'&username='+oomaAccount+'&password='+
                    password+'&signature='+signature_2;

                request(url)
                    .get(uriPhaseTwo)
                    .end(function (err,res){
                        if (err){ console.log(err); access_token(err,null);} else {
                            access_token(null,res.body.access_token);
                        }
                    })

            }
        });
}



exports.getAccessToken = getAccessToken;