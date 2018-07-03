var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

var runGeoQuery = function (req, res) {

	var long = parseFloat(req.query.long);
	var lat = parseFloat(req.query.lat);

	var options = {
		maxDistance : 2000,
		spherical : true,
		distanceField: 'dist',
		near : {
			type : "Point",
			coordinates : [long,lat]
		}
	};

	Hotel
		.aggregate([{'$geoNear': options}], function(err, results) {

			var response = {
				status: 200,
				message: results
			};


			if((isNaN(long) || isNaN(lat)) || ((long%1) === 0 || (lat%1) === 0)) {
				console.log("Longitude and Latitude must be in float format only.");
				response.status = 400;
				response.message = {
					message : "Longitude and Latitude must be in float format only."
				};
				res.status(response.status).json(response.message);
				return;
			} else if(!results || results.length === 0) {
				console.log("No hotels found near your pinpoint.");
				response.status = 404;
				response.message = {
					message : "No hotels found near your pinpoint."
				};
				res.status(response.status).json(response.message);
				return;
			} else if(err) {
				console.log("We couldn't process the request due to: " + err.message);
				response.status = 500;
				response.message = {
					message : "We couldn't process your request."
				};
				res.status(response.status).json(response.message);
				return;
			}


			console.log('Found ', results.length-1, ' hotel(s) near hotel ', results[0].name);
            for(var a = 0; a < results.length; a++) {
            	if(results[a].name === results[0].name)
            		console.log(results[a].name + ' is your pinpoint!');
            	else
            		console.log(results[a].name + ' at ' + results[a].dist.toFixed(0) + 'km away from ' + results[0].name);
            }

			res
				.status(response.status)
				.json(response.message);
        }
    );

};

module.exports.hotelsGetAll = function(req, res) {

	var offset = 0;
	var count = 5;
	var maxCount = 10;

	if(req.query && req.query.lat && req.query.long) {
		runGeoQuery(req, res);
		return;
	}

	if(req.query && req.query.offset) {
		offset = parseInt(req.query.offset, 10);
	}

	if(req.query && req.query.count) {
		count = parseInt(req.query.count, 10);
	}

	if(isNaN(offset) || isNaN(count)){
		res
			.status(400)
			.json({
				"message": "Count and Offset should be numbers only."
			});
		return;
	}

	if(count > maxCount) {
		res
			.status(400)
			.json({
				"message" : "Count limit of " + maxCount + " exceeded"
			});
		return;
	}

	Hotel
		.find({})
		.skip(offset)
		.limit(count)
		.exec(function(err, hotels){
			if(err){
				console.log("Couldn't find any hotel because of this error: ", err.message);
				res
				.status(500)
				.json(err.message);
			}
			else {
				console.log('Number of hotels found: ', hotels.length);
				res
					.status(200)
					.json(hotels);
			}
		});
};

module.exports.hotelsGetOne = function(req, res) {

	var hotelId = req.params.hotelId;
	var objectIdChecker = mongoose.Types.ObjectId;

	Hotel
		.findById(hotelId)
		.exec(function(err, hotel) {
			var response = {
				status: 200,
				message: hotel
			};

			if(err) {
				console.log("Couldn't find the hotel because of this error: ", err.message);
				response.status = 500;
				response.message = err.message;
			} else if(!hotel) {
				console.log("Couldn't find hotel.");
				response.status = 404;
				response.message = {
					message : "Hotel ID not found."
				};
			} else if(!objectIdChecker.isValid(hotelId)) {
				response.status = 400;
				response.message = {
					message : "Hotel ID must be a type of ObjectId."
				};
			}
			
			res
				.status(response.status)
				.json(response.message);
		});

};

var _splitArray = function(input) {
	var output;
	if( input && input.length > 0) {
		output = input.split(';');
	} else {
		output = [];
	}
	return output;
};

module.exports.hotelsAddOne = function(req, res) {

	Hotel
		.create({
			name: req.body.name,
			description: req.body.description,
			stars: parseInt(req.body.stars,10),
			services: _splitArray(req.body.services),
			photos: _splitArray(req.body.photos),
			currency: req.body.currency,
			location: {
				address: req.body.address,
				coordinates : [
					parseFloat(req.body.long),
					parseFloat(req.body.lat)
				]
			}
		}, function(err, hotel) {
			if(err) {
				console.log("Error creating hotel");
				res
					.status(400)
					.json(err);
			} else {
				console.log("Hotel created ", hotel);
				res
					.status(201)
					.json(hotel);
			}
		})

};

module.exports.hotelsUpdateOne = function(req, res) {

	var hotelId = req.params.hotelId;
	console.log("PUT hotelId", hotelId);

	Hotel
		.findById(hotelId)
		.select("-reviews -rooms")
		.exec(function(err, doc) {
			var response = {
				status: 200,
				message: doc
			};
			if(err) {
				console.log("Error finding hotel");
				response.status = 500;
				response.message = err;
			} else if (!doc) {
				response.status = 404;
				response.message = {
					"message" : "Hotel ID not found"
				};
			}
			if(response.status !== 200) {
				res
				.status(response.status)
				.json(response.message);
			} else {
				doc.name = req.body.name;
				doc.description = req.body.description;
				doc.stars = parseInt(req.body.stars,10);
				doc.services = _splitArray(req.body.services);
				doc.photos = _splitArray(req.body.photos);
				doc.currency = req.body.currency;
				doc.location = {
					address: req.body.address,
					coordinates : [
						parseFloat(req.body.long),
						parseFloat(req.body.lat)
					]
				};

				doc.save(function(err, hotelUpdated) {
					if(err) {
						res
							.status(500)
							.json(err);
					} else {
						res
							.status(204)
							.json();	
					}
				});
			}
		});

};

module.exports.hotelsDeleteOne = function (req, res) {

	var hotelId = req.params.hotelId;

	Hotel
		.findByIdAndRemove(hotelId)
		.exec(function(err, hotel) {
			if(err) {
				res
					.status(404)
					.json(err);
			} else {
				console.log("Hotel deleted, id: ", hotelId);
				res
					.status(204)
					.json();
			}
		});
};