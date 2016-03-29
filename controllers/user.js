var User = require('../models/user');
var Error = require('./error');
var config = require('../config');
var email = require('emailjs');

var server  = email.server.connect(config.mail);

exports.outputFn = function (req, res) {
	
	if(req.headers.token) {
		
		User.findOne({token: req.headers.token}, function (err, loggedUser) {
			
			if(err || !loggedUser) { 
				return Error.unauthorized(res); 
			}
	    else {
		    
		    if(req.erm.result) {
			    
			    if(req.erm.result.length) {
				    
				    req.erm.result.forEach(function(user) {
					    
					    if( !(loggedUser.admin || loggedUser.moderator) && (loggedUser._id.toString() !== user._id.toString()) ) {
						    delete user.password;
						    delete user.serialNumber;
						    delete user.valid;
						    delete user.expireToken;
						    delete user.token;
						    delete user.moderator;
						    delete user.admin;
						    delete user.__v;
						    delete user.IP;
						    delete user.browserAgent;
					    }
					    
				    });
			    
			    }
			    
			    res.status(req.erm.statusCode).json(req.erm.result);
		    }
		    else {
	/*
		admin vede se stesso    				!(t || f) && f
		admin vede altri 		    				!(t || f) && t
		moderatore vede se stesso	    	!(f || t) && f
		moderatore vede altri    				!(f || t) && t
		user vede se stesso	    				!(f || f) && f
		user vede altri	    						!(f || f) && t
	*/
			    if(req.erm.result) {
				    if(req.erm.result._id) {
					    if( !(loggedUser.admin || loggedUser.moderator) && (loggedUser._id.toString() !== req.erm.result._id.toString()) ) {
						    delete req.erm.result.password;
						    delete req.erm.result.serialNumber;
						    delete req.erm.result.valid;
						    delete req.erm.result.expireToken;
						    delete req.erm.result.token;
						    delete req.erm.result.moderator;
						    delete req.erm.result.admin;
						    delete req.erm.result.__v;
						    delete req.erm.result.IP;
						    delete req.erm.result.browserAgent;
					    }
				    }
			    }
			    res.status(req.erm.statusCode).json(req.erm.result);
		    }
		    
	    }
			
		});
		
	}
	else {
		res.status(req.erm.statusCode).json(req.erm.result);
	}
	

};

exports.preCreate = function (req, res, next) {
    if(req.body.valid || req.body.admin || req.body.moderator){
     User.findOne({token: req.headers.token}, function (err, user) {
         if (err || !user) { return Error.unauthorized(res); }
         else {
             if (user.admin || user.moderator) { next(); }
             else { return Error.unauthorized(res); }
         }
     });
    }
    else{
        if(req.body.valid) { return Error.unauthorized(res); }
        else if(req.body.admin) { return Error.unauthorized(res); }
        else if(req.body.moderator) { return Error.unauthorized(res); }
        else next();
    }
};

exports.preUpdate = function (req, res, next) {
  User.findOne({token: req.headers.token}, function (err, user) {
                  if (err || !user) { return Error.unauthorized(res); }
                  else {
	                  
	                  if(req.body.valid || req.body.admin || req.body.moderator) {
		                  
		                  if(user.admin || user.moderator) {
			                  next();
		                  }
		                  else {
			                  return Error.unauthorized(res);
		                  }
		                  
	                  }
	                  else {
	                  	next();
	                  }
	                  
/*
                    if (user.admin || user.moderator) {
                        if(req.body.valid){
                            server.send({
                                text:    "Il tuo account è stato attivato",
                                from:    "kmgps <info@marcoferraioli.com>",
                                to:      "someone <marcoferraioli@live.com>",
                                subject: "testing email"
                                }, function(err, message) {
                                    if(err) res.json({'mail': 'mail not send'});
                                    else res.json({'mail': 'mail sent'});
                                    });
                        }
                      next();
                    }
                    else {
                      if(user.email == req.body.email && user.password == req.body.password){
                        next();
                      }
                      else{
                        return Error.unauthorized(res);
                      }
                    }
*/
                  }
                  
                  
                });
};

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
