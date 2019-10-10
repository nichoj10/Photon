"use strict";

var mongoose = require('mongoose');
var Photo = require('./photo.js');
var photoSchema = require('mongoose').model('Photo').schema;

var userSchema = new mongoose.Schema({
    first_name: String, // First name of the user.s
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,    // Occupation of the user.
    login_name: String,
    password: String, 
    favorites: [photoSchema] // HOW CAN I GET ACCESS TO THE PHOTOSCHEMA!
});

var User = mongoose.model('User', userSchema);

module.exports = User;
