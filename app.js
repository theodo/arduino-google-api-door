/*
    Require and global initialization
*/
var express = require('express');
var config = require('./config');
var path = require('path');
var request = require('request');
var doorClient = require('./lib/client/door');
var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;
var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

/**
 *  Beginning
 */
// Création of Google client
var oauth2Client = new OAuth2(config.APP_ID, config.APP_SECRET, config.REDIRECT_URI);

// Index action. Juste some buttons with the URL for Google Authentication
app.get('/', function(req, res) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.email',
        state: 'profile',
        approval_prompt: 'force'
    });
    res.render('index', {
        authUrl: authUrl
    });
});

/**
 * Callback function called after oauth authentication
 * We get the code from the user, and get a refresh_token from Google with this code
 * The refresh_token is then sent back to the user in order to store it in local storage
 **/
app.get('/oauthcallback', function(req, res) {
    //TODO : Check that states match
    var state = req.query.state;
    var code = req.query.code;
    oauth2Client.getToken(code, function(err, tokens) {
        if (!"refresh_token" in tokens) {
            return res.send("Authentication process failed");
        }
        res.redirect("/?refresh_token=" + tokens.refresh_token);
    });
});

/**
 * We get the refresh_token from request, fetch an access_token from google api with refresh_token, and then fetch userinfo with access_token
 * If the domain of user is the configured domain, we open the door
 *
 **/
app.post('/api/opendoor', function(req, res) {
    var refresh_token = req.body.refresh_token;
    oauth2Client.credentials = {
        refresh_token: refresh_token
    };

    googleapis.discover('oauth2', 'v1').execute(function(err, client) {
        if (!err) {
            client.oauth2.userinfo.get().withAuthClient(oauth2Client).execute(function(err, results) {
                var email = results.email;

                if ((email.indexOf(config.RESTRICT_DOMAIN) + config.RESTRICT_DOMAIN.length) != email.length) {
                    return res.send({
                        status: -1,
                        message: "Google API authentication failed (the domain of your email does not match the required one)"
                    });
                }

                doorClient.open();
                
                res.send({
                    status: 0,
                    message: 'Door opened. Welcome !'
                });
            });
        }
    });
});

require('http').createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

