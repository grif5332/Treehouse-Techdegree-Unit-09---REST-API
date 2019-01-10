'use strict';
// load modules
const express = require('express');
const morgan = require('morgan');
// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';
// create the Express app
const app = express();
// setup morgan which gives us http request logging
app.use(morgan('dev'));

const jsonParser = require('body-parser').json;
app.use(jsonParser());

// Mongoose/MongoDB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fsjstd-restapi');
const db = mongoose.connection;
// connection error
db.on('error', (err) => {
  console.error('Connection Error', err);
});
// connnect success
db.once('open', () => {
  console.log('db connection successful!');
  // Do I need to db.close() this?
});

// TODO setup your api routes here
// User Routes
app.get('/api/users', (req, res) => {
  res.json(200, 'api/users are cool');
});

// Course Routes
app.get('/api/courses', (req, res) => {
  res.json(200, 'api/courses are awesome!');
});

app.get('/api/courses/:id', (req, res) => {
  res.json(200, `Course ID: ${req.params.id}`)
});



// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
