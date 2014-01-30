var express = require('express');
var routes = require('./routes');
var config = require('./config');
var http = require('http');
var path = require('path');
var request = require('request');
var doorClient = require('./lib/client/doorClient');
var googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2;

var oauth2Client = new OAuth2(config.APP_ID, config.APP_SECRET, config.REDIRECT_URI);

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

app.get('/', function(req, res){

	var authUrl = oauth2Client.generateAuthUrl({
	  access_type: 'offline',
	  scope: 'https://www.googleapis.com/auth/userinfo.email',
	  state: 'profile',
	  approval_prompt: 'force'
	});
  
  res.render('index', { authUrl: authUrl });
});

/**
* Callback function called after oauth authentivation
* We get the code from the user, and get a refresh_token from Google with this code
* The refresh_token is then sent back to the user in order to store it in local storage
**/
app.get('/oauthcallback', function(req, res) {
        var state = req.query.state;
        //TODO : Check that states match
        var code = req.query.code;

        oauth2Client.getToken(code, function(err, tokens) {
		  	if (!"refresh_token" in tokens) {
                return res.send("Le processus d'authentification a échoué");        
            }
                
            res.redirect("/?refresh_token=" + tokens.refresh_token);
		});
});

/**
* First param to consider is auth_type (googleoauth)
* If googleoauth, we get the refresh_token from request, fetch an access_token from google api with refresh_token, and then fetch userinfo with access_token
* If the domain of user (hd param) is "theodo.fr", we open the door
*
* If allomatch, we get username and password from request and hit the API of allomatch in order to grant (or not) the access 
**/
app.post('/api/opendoor', function(req, res) {
        var auth_type = req.body.auth_type;

        if ("googleoauth" == auth_type) {
                var refresh_token = req.body.refresh_token;

                getAccessTokenFromRefreshToken(refresh_token, function (e, r, body) {
                        var body = JSON.parse(body);

                        if (!"access_token" in body) {
                                return res.send({status: -1, message: "L'authentification Google Plus a échoué (code 1)"});
                        }

                        getInfoFromAccessToken(body.access_token, function(e, r, body) {
                                var body = JSON.parse(body);

                                if (!"hd" in body) {
                                        return res.send({status: -1, message: "L'authentification Google Plus a échoué (code 2)"});
                                } else if ("theodo.fr" !== body.hd) {
                                	console.log(body);
                                        return res.send({status: -1, message: "L'authentification Google Plus a échoué (l'adresse fournie n'appartient pas à Theodo)"});
                                }

                                doorClient.open();
                                res.send({status: 0, message: 'Door opened. Welcome !'});
                        });
                });
        }
        else if ("allomatch" == auth_type) {
                var username = req.body.username;
                var password = req.body.password;

                data = {
                        username: username,
                        password: password
                };

                request.post(config.ALLOMATCH_DOOR_URL, {form: data}, function (e, r, body) {
                        if ("true" == body) {
                                theodoDoorClient.open();
                            res.send({status: 0, message: 'Door opened. Welcome !'});
                        }
                        else {
                                res.send({status: -1, message: "L'authentification Allomatch a échoué"});
                        }
                });
        }
});

function getAccessTokenFromRefreshToken(refresh_token, callback)
{
        data = {
                refresh_token: refresh_token,
                client_id: config.APP_ID,
                client_secret: config.APP_SECRET,
                grant_type: "refresh_token"
        };

        request.post(config.GOOGLE_API_TOKEN_URL, {form: data}, callback);
}

function getInfoFromAccessToken(access_token, callback)
{
        request.get(config.GOOGLE_API_USERINFO_URL + access_token, callback);
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
