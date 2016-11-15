var log4js = require('log4js');
var logger = log4js.getLogger('applog');
var jwt = require('jsonwebtoken');


/* middleware check auth */
function checkAuth(req, res, next) {
  var bearerHeader = req.headers["authorization"];
  var auth = req.session.auth;
  var authToken = req.session.authToken;
  logger.debug('authToken0: ', authToken);

  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    authToken = bearer[1] ;
    logger.debug('auth header: ', bearerHeader);
  }
  
  if (authToken) {
    try {

      jwt.verify(authToken, '00MasecR3t', function(err, decoded) {

        if (err) {
          res.status(403).json({status: 'error', message:'Invalid authentication: ' + err.name});
          return;
        };

        if (decoded.tag == undefined ||
          decoded.tag !== 'mobilelogger') {
          res.status(403).json({status: 'error', message:'Invalid authentication'});
              return;
        }

        req.token = authToken;
        next();
        return;
      });
    
    } catch(e) {
      logger.error('checkAuth error: ', e.message);
      res.status(403).json({status: 'error', message:'Invalid authentication'});
        return;
    }
  } else if (auth == undefined || auth != 'yes')  {
    logger.error('Invalid authentication');
    res.status(403).json({status: 'error', message:'Invalid authentication'});
    return;
  } else {
    res.status(403).json({status: 'error', message:'Invalid authentication'});
    return;
  }
  
};

module.exports.checkAuth = checkAuth;
