exports.unauthorized = function (res) {
	res.statusCode = 511;
	res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
	return res.json({'error' : 'unauthorized'});
};
