
let config = {
    app_name: "CSL",
    storeInMongo:true,
    database: {
        connectionString: process.env.CSL_DB_URL,
        reconnectTries: 3600,
        reconnectInterval: 1200
    },
    credentials: {
        cslAppUser: process.env.CSL_DB_APP_USER,
        cslAppUserPassword: process.env.CSL_DB_APP_USER_PASSWORD,
        cslExpressUser : process.env.CSL_DB_EXPRESS_USER,
        cslExpressUserPassword : process.env.CSL_DB_EXPRESS_USER_PASSWORD
    },
    apiInterfaceUrl: process.env.CSL_API_URL,
    apiInterfacePorts: process.env.CSL_API_PORTS,
    loggerConfig: {
        logLevel: process.env.CSL_DEBUG_LEVEL || 'DEBUG',
        log4jsAppenders: [
          // TODO : Add syslog_appender here
            { type: 'console' },
            { type: 'file',
                filename: '/var/log/csl.log',
                "maxLogSize": 204800,
                "backups": 3 }
        ]
    }
};

module.exports = config;