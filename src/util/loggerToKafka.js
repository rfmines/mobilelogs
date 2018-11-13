const log4js = require('log4js');
log4js.loadAppender('log4js-kafka-appender');
log4js.addAppender(log4js.appenders['log4js-kafka-appender']({
    host: '10.66.12.42',
    port: 2181,
    topic: 'mobile-logs',
    level: 'INFO'
}));

exports.getKafkaLogger = function getLogger4Module (moduleName){
    return log4js.getLogger('CSL2Kafka.'+moduleName);
};
