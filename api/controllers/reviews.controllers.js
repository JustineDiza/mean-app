var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

module.exports.reviewsGetAll = function(req, res) {
	
	var hotelId = req.params.hotelId;
	var objectIdChecker = mongoose.Types.ObjectId;
	console.log('GET hotelId: ', hotelId);

	Hotel
		.findById(hotelId)
		.exec(function(err, hotel){

			var response = {
				status: 200,
				message: hotel.reviews
			};

			if(!objectIdChecker.isValid(hotelId)){
				console.log("The hotel ID you have entered is invalid.");
				response.status = 400;
				response.message = { message: "Hotel ID entered is invalid." };
				res.status(response.status).json(response.message);
				return;
			}
			else if(hotel.reviews.length === 0) {
				console.log("Couldn't find the hotel because of this error: ", err.message);
				response.status = 404;
				response.message = { hotel: "No hotels found." };
				res.status(response.status).json(response.message);
				return;
			}
			else if(err) {
				console.log("The server could not respond accordingly.");
				response.status = 500;
				response.message = { message: "Internal server error." };
				res.status(response.status).json(response.message);
				return;
			}
			else {
				console.log('Found ', hotel.reviews.length, ' review(s) for the hotel: ', hotel.name);
				res.status(response.status).json(response.message);
			}
		});
};

module.exports.reviewsGetOne = function(req, res) {

	var hotelId = req.params.hotelId;
	var reviewId = req.params.reviewId;
	var objectIdChecker = mongoose.Types.ObjectId;

	console.log('GET reviewId: ', reviewId, ' for hotelId: ', hotelId);

	Hotel
		.findById(hotelId)
		.exec(function(err, hotel){

			var review = hotel.reviews.id(reviewId);

			var response = {
				status: 200,
				message: review
			}

			if(!objectIdChecker.isValid(hotelId)){
				console.log("The hotel ID entered was invalid.");
				response.status = 400;
				response.message = { message: "Hotel ID entered is invalid." };
				res.status(response.status).json(response.message);
				return;
			}
			else if(!objectIdChecker.isValid(reviewId)){
				console.log("The review ID entered was invalid.");
				response.status = 400;
				response.message = { message: "Review ID entered is invalid." };
				res.status(response.status).json(response.message);
				return;
			}
			else if(!review) {
				console.log("Couldn't find any hotel review.");
				response.status = 404;
				response.message = { hotel: "No reviews found." };
				res.status(response.status).json(response.message);
				return;
			}
			else if(err) {
				console.log("The server could not respond accordingly. More details on this here: ", err);
				response.status = 500;
				response.message = { message: "Internal server error." };
				res.status(response.status).json(response.message);
				return;
			}
			else {
				console.log('Found a review(s) for the hotel: ', hotel.name, ' written by ', review.name, ' with the reivew of: ', review.review);
				res.status(response.status).json(response.message);
			}
		});
};

var _addReview = function(req, res, hotel) {

	hotel.reviews.push({
		name: req.body.name,
		rating: parseInt(req.body.rating, 10),
		review: req.body.review
	});

	hotel.save(function(err,hotelUpdated) {
		if(err) {
			res
				.status(500)
				.json(err);
		} else {
			res
				.status(201)
				.json(hotelUpdated.reviews[hotelUpdated.reviews.length - 1]);
		}
	});

};

module.exports.reviewsAddOne = function(req, res) {

	var hotelId = req.params.hotelId;
	console.log("Get hotelId", hotelId);

	Hotel
		.findById(hotelId)
		.select('reviews')
		.exec(function(err, doc) {
			var response = {
				status: 200,
				message: []
			};
			if(err) {
				console.log("Error finding hotel");
				response.status = 500;
				response.message = err;
			} else if(!doc) {
				console.log("Hotel id not found in database", id);
				response.status = 404;
				response.message = {
					"message" : "Hotel ID not found" + id
				};
			}
			if(doc) {
				_addReview(req, res, doc);
			} else {
				res
				.status(response.status)
				.json(response.message);
			}
		
		});

};

module.exports.reviewsUpdateOne = function (req, res) {

	var hotelId = req.params.hotelId;
	var reviewId = req.params.reviewId;
	console.log("PUT hotelId", hotelId);

	Hotel
		.findById(hotelId)
		.select('reviews')
		.exec(function(err, doc) {
			var response = {
				status: 200,
				message: []
			};
			if(err) {
				console.log("Error finding hotel");
				response.status = 500;
				response.message = err;
			} else if(!doc) {
				console.log("Hotel id not found in database", id);
				response.status = 404;
				response.message = {
					"message" : "Hotel ID not found" + id
				};
			} else {
				var reviewer = doc.reviews.id(reviewId);

				if(!reviewer) {
					response.status = 404;
					response.message = {
						"message" : "Review ID not found" + reviewId
					};
				}

				if(response.status !== 200) {
					res
					.status(response.status)
					.json(response.message);
				} else {
					reviewer.name = req.body.name;
					reviewer.review = req.body.review;
					reviewer.rating = parseInt(req.body.rating, 10);

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
			}
		});
};

module.exports.reviewsDeleteOne = function (req, res) {

	var hotelId = req.params.hotelId;
	var reviewId = req.params.reviewId;
	console.log("PUT hotelId", hotelId);

	Hotel
		.findById(hotelId)
		.select('reviews')
		.exec(function(err, doc) {
			var response = {
				status: 200,
				message: []
			};
			if(err) {
				console.log("Error finding hotel");
				response.status = 500;
				response.message = err;
			} else if(!doc) {
				console.log("Hotel id not found in database", id);
				response.status = 404;
				response.message = {
					"message" : "Hotel ID not found" + id
				};
			} else {
				var reviewer = doc.reviews.id(reviewId);

				if(!reviewer) {
					response.status = 404;
					response.message = {
						"message" : "Review ID not found" + reviewId
					};
				}

				if(response.status !== 200) {
					res
					.status(response.status)
					.json(response.message);
				} else {
					
					doc.reviews.id(reviewId).remove();

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
			}
		});
};