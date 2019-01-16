'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    firstName: String,
    lastName: String,
    emailAddress: {type: String, unique: true}, 
    password: String
});

const User = mongoose.model('User', UserSchema);
module.exports.User = User;