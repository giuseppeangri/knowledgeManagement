var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema ({
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
	lifeModel: {
		type: String,
		minlength:1,
		maxlength:100
	},
	tags: [{
		type: String,
		required: true,
		minlength:1,
		maxlength:100
	}],
	date: {
		type: Date,
		default: Date.now
	},
	comments: [{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		text: {
			type: String,
			required: true
		},
		date: {
			type: Date,
			default: Date.now
		}
	}],
	preferences: [{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		type: {
			type: Boolean,
			required: true
		},
		date: {
			type: Date,
			default: Date.now
		}
	}],
	projectManagers: [{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		}
	}],
	teamMembers: [{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		}
	}],
	documents: [{
		title: {
			type: String,
			required: true,
			minlength:1,
			maxlength:100
		},
		documentUrl: {
			type: String,
			required: true
		},
		date: {
			type: Date,
			default: Date.now
		},
	}],
	efforts: [{
		type: {
			type: String,
			required: true,
			minlength:1,
			maxlength:100
		},
		value : {
			type: Number,
			required: true
		}
	}],
	metrics: [{
		type: {
			type: String,
			required: true,
			minlength:1,
			maxlength:100
		},
		value : {
			type: Number,
			required: true
		}
	}],
	tools: [{
		toolId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Tool'
		}
	}],
});

module.exports = mongoose.model('Project', ProjectSchema);
