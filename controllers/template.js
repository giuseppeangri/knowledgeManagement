var Template = require('../models/template');
var User = require('../models/user');
var Error = require('./error');

exports.preCreate = function (req, res, next) {
  User.findOne({token: req.headers.token}, function (err, user) {
                  if (err || !user) { return Error.unauthorized(res); }
                  else {
                    if (user.admin || user.moderator) {
                      next();
                    }
                    else {
                      if (req.body.valid) {
                        return Error.unauthorized(res);
                      }
                      else {
                        next();
                      }
                    }
                  }
                });
};

exports.preRead = function (req, res, next) {
  User.findOne({token: req.headers.token}, function (err, user) {
    if(err || !user) {return Error.unauthorized(res);}
    else if (user.admin || user.moderator){ next(); }
    else {
	    
	    if(req.params.id) {
	      Template.findOne({_id: req.params.id}, function (err, template) {
	        if(!template.valid){ return Error.unauthorized(res); }
	        next();
	      });
	    }
	    else {
		    next();
	    }
	    
    }
  });
}

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
