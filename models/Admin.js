const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

// Admin Schema
const AdminSchema = mongoose.Schema({
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
});

AdminSchema.plugin(uniqueValidator);

const Admin = module.exports = mongoose.model('Admin', AdminSchema);

// Find the Admin by ID
module.exports.getAdminById = function (id, callback) {
    Admin.findById(id, callback);
}

// Find the Admin by Its username
module.exports.getAdminByUsername = function (username, callback) {
    const query = {
        username: username
    }
    Admin.findOne(query, callback);
}

// to Register the Admin
module.exports.addAdmin = function (newAdmin, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            newAdmin.password = hash;
            newAdmin.save(callback);
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