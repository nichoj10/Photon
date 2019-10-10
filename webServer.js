// NodeJS server for Photon (Founder: Jack Nichols)
// The imports were configured by Stanford prof Mendel Rosenblum:

"use strict";


var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require("fs");

var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/cs142project6', { useMongoClient: true });

app.use(express.static(__dirname));

// End starter code provided by Mendel Rosenblum. The rest of the code is the sole property of Jack Nichols:

// account for unspecified URL
app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

// get all the User objects
app.get('/user/list', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Must be a valid user");
    } else {
        var callback = function (err, userList) {
            if (err) {
                console.error("Cannot retrieve user list", err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            response.send(JSON.stringify(userList));
        };
        var query = User.find({});
        query.select("_id first_name last_name").exec(callback);
    }
});

// get the User for a particular ID
app.get('/user/:id', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Must be a valid user");
    } else {
        var callback = function (err, userDetails) {
            if (err) {
                console.error('An error occurred in locating the user ID', user_id);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.send(JSON.stringify(userDetails));
        };
        var user_id = request.params.id;
        var query = User.findOne({_id: user_id});
        query.select("_id first_name last_name location description occupation favorites").exec(callback);
    }
});

// get the Photos for a particular ID
app.get('/photosOfUser/:id', function (request, response) {
    if (request.session.user_id === undefined) {
        response.status(401).send("Must be a valid user");
    } else {
        var id = request.params.id;
        Photo.find({user_id: id}, function (err, photos) {
            if (err) { // check for invalid ID
                response.status(400).send(JSON.stringify(err));
                return;
            } 
            var userPhotos = JSON.parse(JSON.stringify(photos));
            // looping through photos
            async.each(userPhotos, iteratePhotos, photosDone);
            function iteratePhotos(photo, photosDone) {
                delete photo.__v;
                // looping through comments
                async.each(photo.comments, iterateComments, commentsDone);
                function iterateComments(comment, commentsDone) {
                    var query = User.findOne({_id: comment.user_id});
                    delete comment.user_id;
                    query.select("_id first_name last_name").exec(queryCallback);
                    function queryCallback (err, commenter) { 
                        comment.user = commenter; // adding user property to object
                        commentsDone(err);
                    }
                }
                function commentsDone(error) {
                    photosDone(error); // return errors to Photos callback
                }
            }
            function photosDone(error) {
                if (error) {
                    console.error('An error occurred');
                    response.status(500).send(JSON.stringify(error));
                } else {
                    response.send(JSON.stringify(userPhotos));
                }
            }
        });
    }
});

// update our login status
app.post('/admin/login', function (request, response) {
    var username = request.body.login_name;
    var passwordInput = request.body.password;
    User.findOne({login_name: username}, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
        } else if (user === null) {
            response.status(400).send();
        } else if (user.password !== passwordInput) { // VERY UNSAFE (needs to be updated ASAP)
            response.status(400).send();
        } else {
            request.session.user_id = user._id;
            response.send(user);
        }
    });
});

// update our login status
app.post('/admin/logout', function (request, response) {
    delete request.session.user_id;
    request.session.destroy(function (err) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.send();
    });
});

// add a User comment
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    var commentText = request.body.comment;
    if (commentText === "") {
        response.status(400).send();
        return;
    }
    var photoID = request.params.photo_id;
    Photo.findOne({_id: photoID}, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        var comObject = {};
        comObject.comment = commentText;
        comObject.user_id = request.session.user_id;
        comObject.date_time = Date.now();
        photo.comments = photo.comments.concat(comObject);
        photo.save();
        response.send();
    });
});

// add a new Photo for a User
app.post('/photos/new', function (request, response) {
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send();
            return;
        }
        var timestamp = new Date().valueOf();
        var filename = 'U' + String(timestamp) + request.file.originalname;
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(400).send();
                return;
            }
            Photo.create({ file_name: filename, user_id: request.session.user_id,
                comments: [], date_time: Date.now() });
            response.send();
        });
    });
});

// register a new User
app.post('/user', function (request, response) {
    if (request.body.login_name === undefined || request.body.first_name === undefined ||
        request.body.last_name === undefined || request.body.password === undefined) {
        response.status(400).send("Blank inputs");
        return;
    }
    User.findOne({login_name: request.body.login_name}, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
        } else if (user !== null) { // if the user already exists...
            response.status(400).send("Existing user");
        } else {
            User.create({login_name: request.body.login_name, password: request.body.password,
                first_name: request.body.first_name, last_name: request.body.last_name,
                location: request.body.location, description: request.body.description, 
                occupation: request.body.occupation});
            response.send();
        }
    });
});

// call to delete one specific comment
app.post('/deleteComment/:comment_id', function (request, response) {
    var commentId = request.params.comment_id;
    var photoId = request.body.photoId;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        photo.comments.pull(commentId);
        photo.save();
        response.send();    
    });
});

// call to delete one specific photo
app.post('/deletePhoto/:photo_id', function (request, response) {
    var photoId = request.params.photo_id;
    Photo.remove({_id: photoId}, function (err) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.send();
    });
});

// call to delete a user (must delete photos, comments, and likes)
app.post('/deleteUser/:user_id', function (request, response) {
    var userId = request.params.user_id;
    // delete all the user's Comments and Likes
    Photo.find({}, function (err, allPhotos) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return
        }
        async.each(allPhotos, iteratePhotos, photosDone);
        function iteratePhotos(photo, photosDone) {
            if (photo.likes.includes(userId)) {
                photo.likes.pull(userId);
                photo.save();
            }
            async.each(photo.comments, iterateComments, commentsDone);
            function iterateComments(comment, commentsDone) {
                console.log(comment);
                if (comment !== undefined && comment.user_id == userId) {
                    photo.comments.pull(comment._id);
                    photo.save();
                }
                commentsDone(err);
            }
            function commentsDone(error) {
                photosDone(error);    }

        }
        function photosDone(err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
            }
        }
    });
    // delete all the user's Photos
    Photo.remove({ user_id: userId }, function (err) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
    });
    // delete the user
    User.remove({_id: userId}, function (err) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.send();
    });
});

// call to add a like to this photo
app.post('/like/:photo_id', function (request, response) {
    var photoId = request.params.photo_id;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // a bit of extra validation...
        if (photo.likes.includes(request.session.user_id)) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        photo.likes = photo.likes.concat(request.session.user_id);
        photo.save();
        response.send();
    });
});

// call to remove a like from a photo
app.post('/unlike/:photo_id', function (request, response) {
    var photoId = request.params.photo_id;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // a bit of extra validation...
        if (!(photo.likes.includes(request.session.user_id))) {
            response.status(400).send();
        }
        photo.likes.pull(request.session.user_id);
        photo.save();
        response.send();
    });
});

// call to add to the favorites array
app.post('/addFavorite', function (request, response) {
    var photo = request.body.photo;
    User.findOne({_id: request.session.user_id}, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // a bit of extra validation...
        var favorited = false;
        for (var i = 0; i < user.favorites.length; i++) {
            if (photo._id == user.favorites[i]._id) {
                favorited = true;
            }
        }
        if (favorited) { 
            response.status(400).send();
        } else {
            user.favorites = user.favorites.concat(photo);
            user.save();
            response.send();
        }
    });
});

// call to get info on the favorites
app.get('/getFavorites', function (request, response) {
    User.findOne({_id: request.session.user_id}, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
        } else  if (user === null) {
            response.status(400).send();
        } else {
            response.send(user.favorites);
        }
    });
});

// call to remove a photo from the favorites array
app.post('/deleteFavorite/:photo_id', function (request, response) {
    var photoId = request.params.photo_id;
    // remove the photo with this photoId from the favorites array
    User.findOne({_id: request.session.user_id}, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            response.status(400).send();
            return;
        }
        user.favorites.pull(photoId);
        user.save();
        response.send();
    });
});

// Gotta make sure we're listening ;)
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});