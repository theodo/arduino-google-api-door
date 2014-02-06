Theodo Door
===========

This nodejs application opens the Theodo door. How ?

Authentication process
======================

1. The main button generates an authentication request via Oauth2 requiring very basic informations (email)
2. Once authenticated, Google returns a refresh_token
3. We send back the refresh token to the client in the URL
4. The client stores this refresh token in his local storage

Opening the door
================

1. If the client has a refresh token in his local storage, we send it to the application

