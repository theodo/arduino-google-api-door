Theodo Door
===========

Combination of arduino, nodejs and oauth to open our front door

Behind the door : Arduino
=========================

A simple arduino, connected to the private network and listening to connections. 
The code is a lot inspired of https://github.com/bearstech/FlyingDoor/blob/master/FlyingDoor.pde (see also resources in comments)
We only removed the beeps and set a private message instead of 1 for opening the door

Control of the door : NodeJS
============================

Lightweight client using the *net* module of nodeJS

Authentication : Express app, Google API and Oauth2
===================================================

The website is generated with awesome [Express framework](http://expressjs.com/) and [Twitter Bootstrap](http://getbootstrap.com/)
We fetch minimal informations on [Google API with Oauth] https://github.com/google/google-api-nodejs-client/, 
and if the domain of the user match our domain, we send the private message to the door.

License
=======

