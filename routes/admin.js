const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const config = require('../config/database');
const Product = require('../models/Product');


router.post('/signup', (req, res) => {
    let newAdmin = new Admin({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        contact: req.body.contact,
        gender: req.body.gender,
        role: req.body.role,
        password: req.body.password
    });
    Admin.addAdmin(newAdmin, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                success: false,
                message: err
            });
        } else {
            return res.json({
                success: "true",
                message: "Admin registration is successful."
            });
        }
    });
});

router.post('/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        if (admin) {
            Admin.comparePassword(password, admin.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    const token = jwt.sign({
                        type: "admin",
                        data: {
                            _id: admin._id,
                            firstname: admin.firstname,
                            lastname: admin.lastname,
                            username: admin.username,
                            email: admin.email,
                            contact: admin.contact,
                            gender: admin.gender,
                            role: admin.role,
                        }
                    }, config.secret, {
                        expiresIn: 604800 // for 1 week time in milliseconds
                    });
                    return res.json({
                        success: "true",
                        token: "JWT " + token
                    });
                } else {
                    return res.json({
                        success: 'false',
                        message: 'Authentication failed.'
                    })
                }
            });
        }
    });
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (user) {
            if (user.role == 'admin') {
                User.comparePassword(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        const token = jwt.sign({
                            type: "admin",
                            data: {
                                _id: user._id,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                username: user.username,
                                email: user.email,
                                contact: user.contact,
                                gender: user.gender,
                                role: user.role,
                            }
                        }, config.secret, {
                            expiresIn: 604800 // for 1 week time in milliseconds
                        });
                        return res.json({
                            success: "true",
                            token: "JWT " + token
                        });
                    } else {
                        return res.json({
                            success: 'false',
                            message: 'Authentication failed.'
                        })
                    }
                });
            } else {
                return res.json({
                    success: 'false',
                    message: 'Authentication failed.'
                })
            }
        }
    });
});

// router.get('/user-listing', passport.authenticate('jwt', { session: false }), async (req, res) => {
//     try {
//         const users = await User.find();
//         return res.json({
//             users: users
//         });
//     } catch (err) {
//         console.log(err);
//         res.json({ message: 'err' });
//     }
// });

router.get('/user-listing', async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = parseInt(req.query.start);
    const endIndex = page * limit;

    try {
        const users = await User.find();

        const results = {};

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit,
            }
        }

        if (endIndex < users.length) {
            results.next = {
                page: page + 1,
                limit: limit,
            }
        }

        results.result = users.slice(startIndex, endIndex);
        results.total = users.length;
        return res.json({
            users: results
        });
    } catch (err) {
        console.log(err);
        res.json({ message: 'err' });
    }
});

router.get('/delete-user', async (req, res) => {
    
})

router.post('/add-user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        contact: req.body.contact,
        gender: req.body.gender,
        role: req.body.role,
        password: req.body.password
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
                message: "User added is successfully."
            });
        }
    });
});

router.post('/add-product', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let newProduct = new Product({
        type: req.body.type,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stalk: req.body.stalk,
        image: req.body.image
    });
    try {
        await product.save();
        res.status(200).json({
            success: "true",
            message: 'Product added successfully.'
        });
    } catch (err) {
        res.json({
            success: "false",
            message: err
        });
    }
});

router.post('/check-username', (req, res) => {
    const username = req.body.username;
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (user) {
            console.log('user exist');
            return res.json({
                success: "false",
                message: "Username is already taken."
            });
        } else {
            return res.json({
                success: "true"
            });
        }
    });
});

router.post('/check-email', (req, res) => {
    const email = req.body.email;
    User.getUserByEmail(email, (err, user) => {
        if (err) throw err;
        if (user) {
            return res.json({
                success: "false",
                message: "Email is already taken."
            });
        } else {
            return res.json({
                success: "true"
            });
        }
    });
});

router.get('/add-product', async (req, res, next) => {
    // return res.json({
    //     message: "fdfdsfsd"
    // });
    return res.render('add-product');
});

//SUBMITS THE Product
router.post('/product', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const product = new Product({
        name: req.body.name,
        type: req.body.type,
        price: req.body.price
    });

    try {
        await product.save();
        res.status(200).json({
            message: 'Product added successfully.'
        });
    } catch (err) {
        res.json({ message: err });
    }

});

//UPDATE SPECIFIC POST
router.patch('/product/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const updatedProduct = await Product.updateOne(
            { _id: req.params.productId },
            {
                $set: {
                    description: req.body.description,
                }
            });
        res.json(updatedProduct);
    } catch (err) {
        res.json({ message: err })
    }
});

//DELETE SPECIFIC Product
router.delete('/product/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const removedProduct = await Product.remove({ _id: req.params.productId });
        res.json(removedProduct);
    } catch (err) {
        res.json({ message: err })
    }
});


module.exports = router;