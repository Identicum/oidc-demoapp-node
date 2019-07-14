const uuidv4 = require('uuid/v4');
const { Issuer } = require('openid-client');
const { loggers } = require('winston')
const logger = loggers.get('logger')

const callback_signin = process.env.app_uri+'/oidc-signin';
const callback_signout = process.env.app_uri+'/oidc-signout';
const timeout_issuer = parseInt(process.env.timeout) || 5000;
const scope = process.env.scope || 'openid profile refresh_token';
const acr_values = process.env.acr_values || 'auth_ldap_server';
const idp_logout = process.env.idp_logout || false;

Issuer.defaultHttpOptions = {timeout: timeout_issuer};

logger.info('Redirect URI  → '+callback_signin)
logger.info('Redirect URI Logout  → '+callback_signout)
logger.info('Scopes values set  → '+scope)
logger.info('Acr values set  → '+acr_values)
logger.info('IDP logout value set  → '+idp_logout)
logger.info('IDP timeout value set  → '+timeout_issuer)

let getClient = function(){
    // Return new promise
    logger.debug('Discovering the client')
    return new Promise(function(resolve, reject) {
        Issuer.discover(process.env.issuer_uri)
        .then(function (issuer) {
            logger.debug('Discover done')
            client = new issuer.Client({
                client_id: process.env.client_id,
                client_secret: process.env.client_secret
            }); // => Client
            resolve(client);
        }).catch(function(err){
            logger.debug('Discover fail')
            logger.error(err)
            reject(err);
        });
    });
}


// Send permission authorization to client
exports.login = function(req, res) {
    getClient().then(function(client){
        /* start authentication request */
        req.session['checks'] = {
            state: uuidv4(),
        };
        const session = req.session['checks'];
        const state = session.state;

        logger.debug('Send authorization request to client')
        var URL = client.authorizationPost({
            redirect_uri: callback_signin,
            scope: scope,
            acr_values: acr_values,
            state: state,
        }); // => String (URL)
        res.send(URL);
    }).catch(function(err){
        logger.debug('Fail in authorization request')
        logger.error(err)
        res.status(500).redirect(`/error.html?errorMessage=${err}`);
    });
};

// Send logout to client
exports.logout = function(req, res) {
    getClient().then(function(client){
        if(idp_logout === "true"){
            try {
                logger.debug('Send the redirect to logout uri')
                var URL = client.endSessionUrl({
                    post_logout_redirect_uri: callback_signout,
                });
                req.session.logged = null;
                res.redirect(URL);
            } catch(err){
                logger.debug('Fail in generate the uri for logout')
                logger.error(err)
                logger.debug('Clean the session only and redirect to logout.html')
                // cannot get the end_session_endpoint from the issuer. Then only clean the session and redirect to home
                req.session.logged = null;
                res.redirect('/logout.html');
            };
        } else {
            logger.debug('Clean the session only and redirect to logout.html')
            req.session.logged = null;
            res.redirect('/logout.html');
        }
    }).catch(function(err){
        res.status(500).redirect(`/error.html?errorMessage=${err}`);
    });
};

// Callback authentication recive from client
exports.callback = function(req, res) {
    getClient().then(function(client){
        logger.debug('Validation the authorization callback')
        client.authorizationCallback(callback_signin, req.query, req.session['checks']) // => Promise
        .then(function (tokenSet) {
            logger.debug('Validation ok, access token received')
            req.session.logged = true;
            userinfoPromise = client.userinfo(tokenSet.access_token);

            logger.debug('Request to user-info')
            // Evenly, it's possible to use .catch
            Promise.all([userinfoPromise]).then(values => {
                logger.debug('Satisfactory request')
                req.session.token = tokenSet;
                req.session.claims =  tokenSet.claims;
                req.session.userinfo = values[0];

                res.redirect(`/welcome`);
            }).catch(function(err) {
                logger.debug('Fail in request')
                if (err instanceof ERR_ASSERTION) {
                    logger.error("Assertion error "+err);
                } else {
                    logger.error(err)
                    res.status(500).redirect(`/error.html?errorMessage=${err}`);
                }
            });
        }).catch(function(err){
            logger.debug('Fail in validation the authorization callback')
            logger.error(err)
            res.status(500).redirect(`/error.html?errorMessage=${err}`);
        });
    }).catch(function(err){
        res.status(500).redirect(`/error.html?errorMessage=${err}`);
    });
};
