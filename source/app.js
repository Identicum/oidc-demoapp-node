"use strict";

require('dotenv').config()

const express = require("express");
const exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
const session = require("express-session");
const logger = require('./app/logger')

const routes = require('./app/routes');

let app = express();

app.use(session({
  secret: '2C44-4D44-WppQ38S',
  resave: true,
  saveUninitialized: true,
}));

app.proxy = true;

// Express https://expressjs.com
app.enable('trust proxy');

// Mount route
app.use(routes);

// Register Handlebars view engine
app.engine('.hbs', exphbs({
    defaultLayout: 'basic', 
    extname: '.hbs',
}));
// Use Handlebars view engine
app.set('view engine', '.hbs');


Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

app.listen(process.env.server_port, () => {
  logger.debug('Demo app is running → PORT '+ process.env.server_port)
});