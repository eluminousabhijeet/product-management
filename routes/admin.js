const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const config = require('../config/database');
const Product = require('../models/Product');


router.post('/admin/signup', (req, res) => {
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
                message
            });
        } else {
            return res.json({
                success: true,
                message: "Admin registration is successful."
            });
        }
    });
});

router.post('/admin/signin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return res.json({
                success: false,
                message: "Authentication failed."
            });
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({
                    type: "admin",
                    data: {
                        _id: admin._id,
                        username: admin.username,
                        name: admin.name,
                        email: admin.email,
                        contact: admin.contact,
                        job_profile: admin.job_profile
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
                    success: "false",
                    message: "Authentication failed."
                });
            }
        });
    });
});

router.get('/admin/user-listing', async (req, res) => {
    try {
        const users = await User.find();
        return res.json(
            users
        );
    } catch (err) {
        console.log(err);
        res.json({ message: 'err' });
    }
});

router.get('/admin/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    // console.log(req.user);
    return res.json(
        req.user
    );
});

router.get('/add-product',  async (req, res, next) => {
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