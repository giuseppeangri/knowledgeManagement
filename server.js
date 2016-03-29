var express    = require('express');
var app        = express();
var fs         = require('fs');
var mongoose   = require('mongoose');
var bodyparser = require('body-parser');
var morgan     = require('morgan');
var docs       = require('express-mongoose-docs');

var auth   = require('./controllers/auth');
var token  = require('./controllers/token');
var upload = require('./controllers/upload');

var api = require('./routes/api');

var config = require('./config');
mongoose.connect(config.mongodb_url);

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//CORS
app.use(function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

app.use('/', express.static(__dirname + '/public'));
app.post('/auth', auth.auth);
app.use('/', api);

app.post('/api/v1/upload', token.verifyToken, upload.upload);

docs(app, mongoose);

app.listen(config.port);
console.log('App Running on ' + config.baseurl + '\n');
