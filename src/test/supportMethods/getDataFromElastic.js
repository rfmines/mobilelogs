let logger = require('./../../util/logger').getlogger('getDataFromElastic');
let elastic = require('elasticsearch');
let elasticClient = new elastic.Client({
    host:'10.66.12.67:9200',
    log:'trace'
});

function pingElastic() {
    return new Promise(function (resolve,reject) {

        try{
            elasticClient.ping({
                requestTimeout:3000
            },function (err) {
                if (err){
                    throw err;
                }
                else {
                    resolve('success');
                }
            })
        } catch (e){
            logger.error('Problem detected while tried to ping elastic');
            reject('fail');
        }
    });
}

function getDataFromElasticBySessionId (sessionId){
    let allRecords = {totalHits:0,data:[]};

    return new Promise(function (resolve,reject) {
        try{
            elasticClient.search({
                index:'csl-*',
                type:'CSL_DB',
                scroll:'30s',
                body:{
                    query:{
                        match:{
                            sessionid:sessionId
                        }
                    }
                }

            }).then(function scrollResults (data){
                data.hits.hits.forEach(function(record){
                    allRecords.data.push(record);
                });
                if ( data.hits.total > allRecords.data.length){
                    elasticClient.scroll({
                        scrollId:data._scroll_id,
                        scroll:'30s'
                    }).then(scrollResults);
                } else {
                    allRecords.totalHits=data.hits.total;
                    resolve(allRecords);
                }
            }).catch(function (err) {
                throw err;
            })
        } catch (e){
            logger.error('Error occurred while getting data from elastic .Error :'+e);
            reject(e);
        }
    })
}

// for testing purposes only
function sendDataToElastic (){
    let event = {
        "phone_number" : "4155646483",
        "phone_ext" : "",
        "app_version" : "ooma 5.0.4 (172342)",
        "os_version" : "6.0.1",
        "app_name" : "MOBILE",
        "devManufacturer" : "Sony",
        "hw_info" : "E6653",
        "os_name" : "Android",
        "client_date" : {$date:"2017-02-15T12:18:12.000"},
        "@timestamp" : "2017-02-15T12:18:12.000",
        "local_ip" : "fe80::d074:4bff:fe29:5315%dummy0",
        "tag" : "RUNTIME",
        "db_id" : "19",
        "event_name" : "RT_LOGIN_RESULT",
        "event_type" : "RUNTIME",
        "created_date" : {$date:"2017-02-15T12:18:12.000"},
        "remote_ip" : "162.221.202.134",
        "devid" : "469025c30df7f308",
        "sessionid" : "58a1a405033d1d7b5202b7b7",
        "event_data" : [
            {
                "value" : "AUTH_CODE_OK",
                "label" : "login_result"
            }
        ]};
        /*
    let event = {
        "phone_number" : "7059982507",
        "phone_ext" : "",
        "app_version" : "ooma 5.0.4 (172342)",
        "os_version" : "6.0.1",
        "app_name" : "MOBILE",
        "devManufacturer" : "samsung",
        "hw_info" : "SM-T800",
        "os_name" : "Android",
        "client_date" : {$date:"2017-02-11T22:45:01.000"},
        "@timestamp" : "2017-02-11T22:45:01.000",
        "local_ip" : "fe80::9000:dbff:fef5:ba2a%p2p0",
        "tag" : "RUNTIME",
        "db_id" : "175",
        "event_name" : "RT_CALL_END",
        "event_type" : "RUNTIME",
        "call_duration" : 2,
        "call_id" : "0",
        "remote_number" : "7055758000",
        "call_direction" : "OUTGOING",
        "created_date" :  {$date:"2017-02-11T22:45:01.000"},
        "remote_ip" : "70.76.65.149",
        "devid" : "e2787dec4dd38d73",
        "sessionid" : "589e0f97fce8a41d8ca5c87d1",
        "event_data" : [
            {
                "value" : "0.0",
                "label" : "media_packet_reorder"
            },
            {
                "value" : "Normally",
                "label" : "call_end_status"
            },
            {
                "value" : "Reachable Wifi",
                "label" : "network_status"
            },
            {
                "value" : "",
                "label" : "carrier_name"
            },
            {
                "value" : "0.0",
                "label" : "media_packet_duplicated"
            },
            {
                "value" : "0.0",
                "label" : "media_packet_discarded"
            },
            {
                "value" : "Normal call clearing",
                "label" : "call_end_information"
            },
            {
                "value" : "0.0",
                "label" : "media_packet_loss"
            }
        ],
    "event_data_obj":{
            "media_packet_reorder":"0.0",
        "call_end_status":"Normally",
        "network_status":"Reachable Wifi",
        "carrier_name":"",
        "media_packet_duplicated":"0.0",
        "media_packet_discarded":"0.0",
        "call_end_information":"Normal call clearing",
        "media_packet_loss":"0.0"
    }
    }  ;
*/
    elasticClient.create({
        index:'csl-2017.02.15',
        type:'CSL_DB',
        id:"AVojatFGDg897eAvFRdDa",
        body:event
    },function (err,result) {
        if(err){
            logger.error('Error:'+err);

        }else {
            logger.debug('Result:'+JSON.stringify(result));
            setTimeout(function(){

                getDataFromElasticBySessionId('58a1a405033d1d7b5202b7b7').then(function (result) {
                    logger.debug('Fetch data success.Result '+JSON.stringify(result));
                })},5000);
        }
    })
}
sendDataToElastic();
exports.getDataFromElasticBySessionId  = getDataFromElasticBySessionId;