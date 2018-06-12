require('./api/data/dbconnection.js').open();
var express = require('express');
var path = require('path');
var app = express();
var routes = require('./api/routes');
var bodyParser = require('body-parser');

var port_id = 3000;

// Middleware

app.use(function(req, res, next){
	console.log(req.method, req.url);
	next();
});

app.use(express.static(path.join(__dirname, 'public')));

// *****

// Only need strings and arrays, not other data types
app.use(bodyParser.urlencoded({extended : false}));

app.use('/api', routes);

var server = app.listen(port_id, function () {
	var port = server.address().port;
	console.log('MEAN app has started on: ' + port);
});
