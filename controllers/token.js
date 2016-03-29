var User = require('../models/user');
var Error = require('./error');

exports.verifyToken = function (req, res, next) {
  User.findOne({token: req.headers.token,
                IP: req.connection.remoteAddress,
                browserAgent: req.headers['user-agent']}, function (err, user) {
    if (err || !user) { return Error.unauthorized(res); }
    else{
      var nowTimestamp = Date.now();
      var expireTimestamp = user.expireToken.getTime();
      if (expireTimestamp - nowTimestamp <= 0) { return Error.unauthorized(res); }
      else{
        var remainingTime = expireTimestamp - nowTimestamp;
        var timeToReset = 3600000 - remainingTime;
        var newExpire = expireTimestamp + timeToReset;
        user.expireToken = newExpire;
        user.save(function (err) {
					if (err) { res.json(err); }
					else
            next();
				});
      }
    }
  });
};
