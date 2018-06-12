var dbconn = require('../data/dbconnection.js');
var ObjectId = require('mongodb').ObjectId;
var hotelData = require('../data/hotel-data.json');

module.exports.hotelsGetAll = function(req, res) {

	var db = dbconn.get();
	var collection = db.collection('hotels');

	var offset = 0;
	var count = 5;

	if(req.query && req.query.offset) {
		offset = parseInt(req.query.offset, 10);
	}

	if(req.query && req.query.count) {
		count = parseInt(req.query.count, 10);
	}

	collection
		.find()
		.skip(offset)
		.limit(count)
		.toArray(function(err,result){
			if(err){
				console.log("Couldn't find all hotels... ", err);
			}

			else
			{
				res
					.status(200)
					.json(result);
				console.log('Found', result.length, 'hotels!');
			}
		});
};

module.exports.hotelsGetOne = function(req, res) {

	var db = dbconn.get();
	var collection = db.collection('hotels');

	var hotelId = req.params.hotelId;

	collection
		.findOne({
			_id : ObjectId(hotelId)
		}, function(err, result){
			res
				.status(200)
				.json(result);
				console.log("GET hotel: ", result.name);
				console.log("GET hotelId: ", result._id);
		});

};

module.exports.hotelsAddOne = function(req, res) {

	var db = dbconn.get();
	var collection = db.collection('hotels');
	var newHotel;

	console.log("POST new hotel");
	
	if(req.body && req.body.name && req.body.stars) {
		console.log(req.body);

		newHotel = req.body;
		newHotel.stars = parseInt(req.body.stars, 10);

		collection.insertOne(newHotel, function (err, response){
			console.log(response);
			res
				.status(201)
				.json(response.ops);
		});
	} else {
		console.log('Data missing from body');
		res
			.status(400)
			.json({message: 'Required data missing from body'});
	}
};