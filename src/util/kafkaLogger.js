let logger = require('./../util/logger').getlogger('kafkaLogger');
let kafkaesque = require('kafkaesque')({
    brokers: [{host: '10.66.12.42', port: 9092}]
});
/*
 kafkaesque.connect(function (err,kafka) {

 if(err){
 logger.debug('kafka connect callback error '+JSON.stringify(err))
 } else {
 kafka.on('error',function (error) {
 logger.debug('kafka on Error '+JSON.stringify(error));
 })
 kafka.on('message', function(message, commit) {
 logger.debug(message);
 // once a message has been successfull handled, call commit to advance this
 // consumers position in the topic / parition
 commit();
 });
 }
 });
 */

exports.sendCSLEventToKafka = function sendCSLEventToKafka(event) {
    return new Promise(function (resolve, reject) {
        logger.debug('Sending new event to elastic ' + JSON.stringify(event));
        kafkaesque.connect(function (err, kafka) {
            if (err) {
                logger.debug('kafka connect callback error ' + JSON.stringify(err))
            } else {
                kafka.on('error', function (error) {
                    logger.debug('kafka on Error ' + JSON.stringify(error));
                });
                kafka.on('message', function (message, commit) {
                    logger.debug(message);
                    // once a message has been successfull handled, call commit to advance this
                    // consumers position in the topic / parition
                    commit();
                });
                kafkaesque.produce('mobile-logs', JSON.stringify(event), function (err, result) {
                        if (err) {
                            // TODO : solve this workaround with kafkaesque
                            // trying again , this is issue of this driver when connection lose or do not establish yet
                            kafkaesque.produce('mobile-logs', JSON.stringify(event), function (err, result) {
                                if (err) {
                                    logger.error('Kafka error ' + JSON.stringify(err));
                                    reject(err);
                                }
                                else {
                                    resolve(result);
                                }
                            })
                        } else {
                            logger.debug('Kafka callback ' + JSON.stringify(result));
                            resolve(result)
                        }
                    }
                );
            }
        });

    })
};

/*let kafka = require('kafka-node'),
 logger = require('./../util/logger').getlogger('kafkaLogger');

 function sendEventToKafka() {
 return new Promise(function (resolve, reject) {
 let client = new kafka.Client('10.66.12.42:2181')
 let producer = new kafka.Producer(client); //,{ requireAcks: 1 }
 producer.on('ready', function () {
 resolve(promisedSend);
 });

 function promisedSend(data) {
 return new Promise(function (resolve, reject) {
 producer.send([data], function (err,response) {
 if (err) {
 reject(err)
 }
 else {
 logger.debug('Kafka response '+response);
 logger.debug('Event sent!' + JSON.stringify(data));
 resolve(data);

 }
 })

 })

 }
 })
 }

 exports.kafkaLogger = sendEventToKafka;
 */
/*
 winston.transports.Kafka = require('winston-kafka-transport');
 let logger = new (winston.Logger)({
 transports: [
 new (winston.transports.Console)()]});

 logger.add(winston.transports.Kafka, {
 topic: 'mobile-logs',
 connectionString: '10.66.12.42:2181', // 9092 2181
 });

 logger.warn({mongo_id:'csl2.0 hello'})
 exports.logger = logger;
 */