const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

// User Schema
const UserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    role:{
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    status:{
        type: String,
        require: true
    },
});

UserSchema.plugin(uniqueValidator);

const User = module.exports = mongoose.model('User', UserSchema);

// Find the user by ID
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

// Find the user by Its username
module.exports.getUserByUsername = function (username, callback) {
    const query = {
        username: username
    }
    User.findOne(query, callback);
}

// Find the user by Its email
module.exports.getUserByEmail = function (email, callback) {
    const query = {
        email: email
    }
    User.findOne(query, callback);
}

// to Register the user
module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

// Compare Password
module.exports.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}