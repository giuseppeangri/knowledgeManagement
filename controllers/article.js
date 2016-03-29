var Article = require("../models/article");
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
                      } else {
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
	      Article.findOne({_id: req.params.id}, function (err, article) {
	        if(!article.valid){ return Error.unauthorized(res); }
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
                      Article.findOne({_id: req.body._id}, function (err, article) {
                        if(article.author == user._id) { next(); }
                        else { return Error.unauthorized(res); }
                      });
                    }
                  }
                });
};
