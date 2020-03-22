const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/database');
const Products = require('../models/Product');
const Orders = require('../models/Order');


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


router.get('/product-listing', async (req, res) => {
    try {
        const products = await Products.find({ status: "active" });
        return res.json({
            success: "true",
            products: products
        });
    } catch (err) {
        console.log(err);
        res.json({ message: 'err' });
    }
});

router.get('/user-data/:userId', async (req, res) => {
    try {
        const userdata = await User.find({ _id: req.params.userId });
        return res.json({
            success: "true",
            userdata: userdata
        });
    } catch (err) {
        res.json({ message: 'err' });
    }
});

router.post('/place-order', async (req, res) => {
    let newOrder = new Orders({
        productId: req.body.productId,
        quantity: req.body.quantity,
        userId: req.body.userId,
        shippingName: req.body.shippingName,
        shippingAddress: req.body.shippingAddress,
        shippingPostcode: req.body.shippingPostcode,
        shippingCountry: req.body.shippingCountry,
        shippingState: req.body.shippingState,
        shippingCity: req.body.shippingCity,
        totalCost: req.body.totalCost,
        createdOn: req.body.createdOn,
        status: req.body.status
    });
    Orders.addOrder(newOrder, (err, order) => {
        if (err) {
            let message = "Error occured.";
            return res.json({
                array: req.body,
                success: "false",
                message
            });
        } else {
            return res.json({
                success: "true",
                message: "Order placed successfully."
            });
        }
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