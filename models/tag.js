var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema ({
	title: {
		type: String,
		required: true,
		minlength:1,
		maxlength:100
	},
	description: {
		type: String,
		minlength:1,
		maxlength:300
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

module.exports = mongoose.model('Tag', TagSchema);