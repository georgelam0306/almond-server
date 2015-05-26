var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var redis = require('redis');
var client = redis.createClient();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var googleStrategy = require('./auth-strategies/google-strategy.js')(passport);

var session = require('express-session')

client.on('connect', function() {
  console.log('connected');
})

app.use(session({
  secret: 'something'
}));

app.get('/temp', function(req, res) {
  res.send('<!DOCTYPE html><body><a href="/auth/google">Sign In with Google</a></body></html>')
})

app.get('/auth/google', passport.authenticate('google', { session: false }));

app.use(bodyParser.json());

app.use('/api', apiRouter);
app.set('superSecret', 'anything');

var main = require('./routes/main.js')(app);
var authenticate = require('./routes/authentication')(app, apiRouter, jwt, passport);
var api = require('./routes/api.js')(app, apiRouter);
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
})

