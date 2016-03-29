var Tutorial = require('../models/tutorial');
var User = require('../models/user');
var Error = require('./error');

exports.preDelete = function (req, res, next) {
  User.findOne({token: req.headers.token}, function (err, user) {
                  if (err || !user) { return Error.unauthorized(res); }
                  else {
                    if (user.admin || user.moderator) {
                      next();
                    }
                    else {
                      return Error.unauthorized(res);
                    }
                  }
                });
};
