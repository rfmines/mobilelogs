let logger = require('./../util/logger').getlogger('kafkaLogger');
let kafka = require('kafka-node');
let client = new kafka.Client('10.66.12.42:2181');
let producer = new kafka.HighLevelProducer(client); //,{ requireAcks: 1 }
producer.on('ready', function () {
    logger.debug('Producer ready');
});


function sendEventToKafka(data) {
    return new Promise(function (resolve, reject) {
        let payload = [
            {
                //topic:'mobile-logs',
                topic:'mobile-logs-new',

            messages:data}
        ];
        try {
        producer.send(payload, function (err, response) {
            if (err) {
                //trying to resend due sometimeouts or old metadata errors
                producer.send(payload,function (err2,result) {
                    if(err2){
                        logger.warn('Send event to kafka was success only from second try!First try error :'+err);
                        logger.warn('Send event to kafka was success only from second try!Second try error :'+err2);
                        reject(err)
                    } else {
                        logger.warn('Send event to kafka was success only from second try!First try error :'+err);
                        resolve(data.length);
                    }
                })
            }
            else {
                resolve(data.length);

            }
        })
        } catch (e){
            logger.error('Exception occurred in kafka producer.Error : ',e);
            reject(e);
        }

    })

}

exports.kafkaLogger = sendEventToKafka;