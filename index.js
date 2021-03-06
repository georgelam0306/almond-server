var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var geocoder = require('geocoder');
var credentials = require('./config.js');
var userCalendar = require('./external-apis/calendar.js');
var userMap = require('./external-apis/map.js');
var uber = require('./external-apis/uber.js');
var request = require('request');
var http = require('http');

var ionicPushServer = require('ionic-push-server');




app.use(bodyParser.urlencoded({
  extended: true
}));
/**
 * Cors headers
 */
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

/**
 * Middleware to convert destination address on req.body.destination to longitude and latitude coordinates
 */
app.use(function(req, res, next) {
  if (req.body.destAddress) {
    geocoder.geocode(req.body.destAddress, function(err, data) {
      var coordinates = data.results[0].geometry;
      req.body.destination = {};
      req.body.destination.longitude = coordinates.location.lng;
      req.body.destination.latitude = coordinates.location.lat
      next()
    });
  } else {
    next()
  }
});

app.get('/push', function(req, res) {
  var credentials = {
    IonicApplicationID : "21a5d31c",
    IonicApplicationAPIsecret : "f2aafa5427d43c6de1d99035be23e4169bc7116139f21649"
  }; 

  var notification = {
    "tokens":["DEV-091e1515-14d3-4700-b477-b8c544ce4a6d"],
    "notification":{
      "alert":"Hi from Ionic Push Service! 2",
      "ios":{
        "badge":1,
        "sound":"chime.aiff",
        "expiry": 1423238641,
        "priority": 10,
        "contentAvailable": true,
        "payload":{
          "key1":"value",
          "key2":"value"
        }
      }
    }
  };
  ionicPushServer(credentials, notification);
  res.json({result: 'Success'});
})

app.get('/temp', function(req, res) {
  res.send('<!DOCTYPE html><body><a href="/auth/google">Authorize</a></body></html>')
})

app.get('/auth/code', function(req, res) {
  console.log(req.query);
  var code = req.query.code || '4/bIpLbbfrtcXw4cwdXMXrIWQJizhPjUggK_jbNmiM0uc.0u9pik9gXK4QEnp6UAPFm0E02rd3mwI';

  var url = 'https://accounts.google.com/o/oauth2/token';
  var payload = {
    grant_type: 'authorization_code',
    code: code,
    client_id: credentials.installed.client_id,
    client_secret: credentials.installed.client_secret,
    redirect_uri: 'http://localhost/callback'
  };

  request.post(url, { form: payload }, function(error, response, body) {
    console.log(body);
  });
});



// require('./auth-strategies/google-strategy.js')(passport, app, jwt, null, credentials, UserModel);
app.use('/api', apiRouter);
// app.set('superSecret', 'anything');

var main = require('./routes/main.js')(app);
// var authenticate = require('./routes/authentication')(app, apiRouter, jwt, passport);
var api = require('./routes/api.js')(app, apiRouter, null, {}, userCalendar, userMap, uber, calendar, googleAuth, credentials);

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
});