// TODO : I think this configs should be moved to main config file
// to do not create multiple configuration files
var config = {
  test: {
    //mongodb connection settings
    database: {
      host:     '127.0.0.1',
      port:     '27017',
      db:       'applog_test',
      user:     'applog',
      password: 'ooma123'
    }
  },
  production: {
    //mongodb connection settings
    database: {
      host:     '127.0.0.1',
      port:     '27017',
      db:       'applog',
      user:     'applog',
      password: 'ooma123'
    }
  }
};
module.exports = config;
