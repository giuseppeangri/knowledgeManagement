var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema ({
  email: {
  	type: String,
  	unique: true,
  	required: true
  },
  password: {
  	type: String,
  	required: true
  },
  name: {
  	type: String,
  	required: true
  },
  lastName: {
  	type: String,
  	required: true
  },
  serialNumber: {
  	type: String,
  	required: true,
  	minlength: 10,
  	maxlength: 10,
    unique: true
    },
  dataBirth: {
  	type: Date,
  	max: Date.now
  },
  admin: {
  	type: Boolean,
  	default: false
  },
  moderator: {
  	type: Boolean,
  	default: false
  },
  token: {
    type: String,
    default: 0
  },
  expireToken: {
    type: Date,
    default: 0
  },
  IP: {
    type: String
  },
  browserAgent: {
    type: String
  },
  valid: {
      type: Boolean,
      default: false
  }
});

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

module.exports = mongoose.model('User', UserSchema);