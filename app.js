'use strict';

var app = require('express')(),
    server = require('http').Server(app),
    express    = require('express'),
    errorhandler = require('errorhandler'),
    bodyParser   = require('body-parser'),
    mongoose = require('mongoose');

if (!process.env.VCAP_SERVICES) {
    require('dotenv').load();
}

require ('./database');
require('./config/express')(app);

app.locals.pretty = true;

var port = process.env.VCAP_APP_PORT || process.env.APP_PORT || 3000;
server.listen(port);
console.log('listening on:', port);
