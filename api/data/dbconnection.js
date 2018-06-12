var MongoClient = require('mongodb').MongoClient;
var dburl = 'mongodb://localhost:27017/meanhotel';

var _connection = null;

var open = function () {
	// set _connection
	MongoClient.connect(dburl, function(err, client) {
		if(err) {
			console.log('DB connection failed');
			return;
		}

		_connection = client.db('meanhotel');
		console.log('DB connection open');
	});
};

var get = function() {
	return _connection;
};

module.exports = {
	open: open,
	get: get
};