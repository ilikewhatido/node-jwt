//API ROUTES -------------------

//get an instance of the router for api routes

var config = require('../config');
var express = require('express');
var apiRoutes = express.Router();
var User = require('../app/models/user'); // get our mongoose model
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

//http://localhost:8080/api/authenticate)
//route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

	// find the user
	User.findOne({
		_id : req.body.name,
		password : req.body.password
	}, function(err, user) {

		if (err)
			throw err;

		if (!user) {
			res.json({
				success : false,
				message : 'Authentication failed.'
			});
		} else {

			var userInfo = {
				_id : user.name,
				password : user.password,
				admin : user.admin
			}
			
			// if user is found and password is right
			// create a token
			var token = jwt.sign(userInfo, config.secret, {
				expiresInMinutes : 1440 // expires in 1 hour
			});
				// return the information including token as JSON
			res.json({
				success : true,
				message : 'Enjoy your token!',
				token : token
			});
		}
	});
});

//route middleware to verify a token
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token
			|| req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.json({
					success : false,
					message : 'Failed to authenticate token.'
				});
			} else {
				// if everything is good, save to request for use in other
				// routes
				req.decoded = decoded;
				next();
			}
			console.log(decoded);
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success : false,
			message : 'No token provided.'
		});

	}
});

//route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
	res.json({
		message : 'Welcome to the coolest API on earth!'
	});
});

//route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

//route to delete user by name (DELETE http://localhost:8080/api/users/:name)
apiRoutes.delete('/users/:name', function(req, res) {
	User.remove({_id : req.params.name}, function(err) {
		if (err)
			throw err;

		console.log('User deleted successfully');
		res.json({
			success : true
		});
	});
});

apiRoutes.post('/users', function(req, res) {
	
	var name = req.body.name;

	  // create a sample user
	  var user = new User({ 
		_id: req.body.name, 
	    password: req.body.password,
	    admin: req.body.admin 
	  });

	  // save the sample user
	  user.save(function(err) {
	    if (err) {
	    	console.log('User saved unsuccessfully');
	    	//throw err; // this will crash the server
	    	res.json({ success: false, err: err });
	    } else {
		    console.log('User saved successfully');
		    res.json({ success: true });
	    }
	  });
});

module.exports = apiRoutes;