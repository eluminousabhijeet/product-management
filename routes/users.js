const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/database');


router.post('/signup', (req, res) => {
    let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        contact: req.body.contact,
        gender: req.body.gender,
        role: req.body.role,
        password: req.body.password,
        status: req.body.status
    });
    User.addUser(newUser, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                array: req.body,
                success: "false",
                message
            });
        } else {
            return res.json({
                success: "true",
                message: "User registration is successful."
            });
        }
    });
});

router.post('/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: "false",
                message: "Authentication failed."
            });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({
                    type: "user",
                    data: {
                        _id: user._id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        contact: user.contact,
                        gender: user.gender,
                        role: user.role,
                        status: user.role
                    }
                }, config.secret, {
                    expiresIn: 604800 // for 1 week time in milliseconds
                });
                return res.json({
                    success: "true",
                    userid: user._id,
                    token: "JWT " + token
                });
            } else {
                return res.json({
                    success: "false",
                    message: "Authentication failed."
                });
            }
        });
    });
});

/**
 * Get Authenticated user profile
 */

router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    // console.log(req.user);
    return res.json(
        req.user
    );
});

module.exports = router;