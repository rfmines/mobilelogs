
var config = {
    app_name: "CSLapp",
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

    logLevel: process.env.CSL_DEBUG_LEVEL || 'DEBUG',
    apiInterfaceUrl: process.env.CSL_API_URL,
    apiInterfacePorts: process.env.CSL_API_PORTS,
    loggerConfig: {
        filename: process.env.CSL_LOGGER_FILENAME,
        maxFileSize: 100000000,
        numfiles: 100
    }
};

module.exports = config;