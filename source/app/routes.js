const app = module.exports = require('express')();
const express = require('express');
const path = require('path');

// require controller modules.
var auth_controller = require('./controllers/authController');

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.logged) {
    res.redirect('/welcome');
  } else {
    next();
  }
};

// route for Home-Page
app.route("/").get(sessionChecker, (req, res) => {
  res.redirect('/home.html');
});

// route for user logged
app.get('/welcome', (req, res) => {
  if (req.session.logged) {
    res.render("welcome",{
      token: req.session.token,
      claims:req.session.claims,
      userinfo: req.session.userinfo,
      introspect: req.session.introspect
    });
  } else {
    res.redirect('/');
  }
});

// route for user logout
app.get('/logout', auth_controller.logout);

// route for user Login
app.route('/login').get(sessionChecker, auth_controller.login)

// route for callback from authentication OpenID
app.route('/oidc-signin').get(sessionChecker, auth_controller.callback)

// route for callback from logout OpenID
app.route("/oidc-signout").get(sessionChecker, (req, res) => {
  res.redirect('/logout.html');
});

// App middleware
app.use('/resources', express.static('public/'));

app.use(express.static('public/'));

