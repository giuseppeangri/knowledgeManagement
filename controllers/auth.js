var basicAuth = require('basic-auth');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Error = require('./error');

var verify = function (user, password, next) {
	bcrypt.compare(password, user, function (err, Match) {
		if (err) { next(err); }
		next(null, Match);
	});
};

var genToken = function (user) {
	var toHash = user.email + user.password + new Date() + Math.random();
	return bcrypt.hashSync(toHash);
};

exports.auth = function (req, res, next) {
	var userAgent = req.headers['user-agent'];
	var userIP = req.connection.remoteAddress;

	var userHttp = basicAuth(req);

	if (!userHttp || !userHttp.name || !userHttp.pass) { return Error.unauthorized(res); };

	User.findOne({email: userHttp.name}, function (err, user) {
		if (err || !user || !user.valid) { return Error.unauthorized(res); }
		else {
			verify(user.password, userHttp.pass, function(err, Match) {
				if (err) { return Error.unauthorized(res); }
				if (!Match) { return Error.unauthorized(res); }
				var token = genToken(user);
				user.token = token;
				var expire = new Date().getTime() + 3600000;
				user.expireToken = expire; //Un'ora
				user.IP = userIP;
				user.browserAgent = userAgent;
				user.save(function (err) {
					if (err) { return Error.unauthorized(res); }
					else { res.json(user); }
				});

				});
			}
		});
	};
