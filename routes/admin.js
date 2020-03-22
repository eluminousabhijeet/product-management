const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const config = require('../config/database');
const Products = require('../models/Product');
const Category = require('../models/ProductCategory');


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
        } else {
            return res.json({
                success: 'false',
                message: 'Authentication failed.'
            })
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
        const users = await User.find({ status: "active" });

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

// router.delete('/delete-user/:userId', async (req, res) => {
//     try {
//         const removedUser = await User.remove({ _id: req.params.userId });
//         res.json(removedUser);
//     } catch (err) {
//         res.json({ message: err })
//     }
// })

router.post('/add-user', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
                message: "User added successfully."
            });
        }
    });
});

// Update User
router.patch('/update-user/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const updatedUser = await User.updateOne(
            { _id: req.params.userId },
            {
                $set: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username,
                    email: req.body.email,
                    contact: req.body.contact,
                    gender: req.body.gender,
                    role: req.body.role
                }
            });
        res.json({
            success: "true",
            message: "User updated successfully"
        });
    } catch (err) {
        res.json({ message: err })
    }
});


//UPDATE SPECIFIC POST
router.patch('/delete-user/:userId', async (req, res) => {
    try {
        const updatedUser = await User.updateOne(
            { _id: req.params.userId },
            {
                $set: {
                    status: 'inactive',
                }
            });
        res.json(updatedUser);
    } catch (err) {
        res.json({ message: err })
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


router.get('/product-listing', async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = parseInt(req.query.start);
    const endIndex = page * limit;

    try {
        const products = await Products.find({ status: "active" });

        const results = {};

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit,
            }
        }

        if (endIndex < products.length) {
            results.next = {
                page: page + 1,
                limit: limit,
            }
        }

        results.result = products.slice(startIndex, endIndex);
        results.total = products.length;
        return res.json({
            products: results
        });
    } catch (err) {
        console.log(err);
        res.json({ message: 'err' });
    }
});

router.post('/add-product', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let newProduct = new Products({
        category: req.body.category,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        image: req.body.image,
        status: req.body.status
    });
    const name = req.body.name;
    Products.getProductByName(name, (err, product) => {
        if (err) throw err;
        if (product) {
            console.log('product exist');
            return res.json({
                success: "false",
                message: "Product name already exists."
            });
        } else {
            Products.addProduct(newProduct, (err, product) => {
                if (err) {
                    let message = "Failed to add product.";
                    return res.json({
                        array: req.body,
                        success: "false",
                        message: message
                    });
                } else {
                    return res.json({
                        success: "true",
                        message: "Product added successfully."
                    });
                }
            });
        }
    });
});

// Update Product
router.patch('/update-product/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const prodImg = req.body.image;
        if (prodImg !== '') {
            const updatedProduct = await Products.updateOne(
                { _id: req.params.productId },
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description,
                        price: req.body.price,
                        stock: req.body.stock,
                        image: req.body.image,
                        category: req.body.category
                    }
                });
            res.json({
                success: "true",
                message: "Product updated successfully"
            });
        } else {
            const updatedProduct = await Products.updateOne(
                { _id: req.params.productId },
                {
                    $set: {
                        name: req.body.name,
                        description: req.body.description,
                        price: req.body.price,
                        stock: req.body.stock,
                        category: req.body.category
                    }
                });
            res.json({
                success: "true",
                message: "Product updated successfully"
            });
        }

    } catch (err) {
        res.json({ 
            success: 'false',
            message: err
         })
    }
});

//UPDATE SPECIFIC POST
router.patch('/delete-product/:productId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const updatedProduct = await Products.updateOne(
            { _id: req.params.productId },
            {
                $set: {
                    status: 'inactive',
                }
            });
        res.json(updatedProduct);
    } catch (err) {
        res.json({ message: err })
    }
});

router.post('/product-category', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let category = new Category({
        name: req.body.name,
        status: req.body.status
    });
    try {
        await category.save();
        res.status(200).json({
            success: "true",
            message: 'Product category added successfully.'
        });
    } catch (err) {
        res.json({
            success: "false",
            message: err
        });
    }
});

router.get('/product-category', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const categories = await Category.find({ status: "active" });
        res.status(200).json({
            categories: categories
        });
    } catch (err) {
        res.json({
            success: "false",
            message: err
        });
    }
});

//UPDATE SPECIFIC POST
router.get('/get-category/:categoryId', async (req, res) => {
    try {
        const category = await Category.find({ _id: req.params.categoryId });
        res.json({
            success: 'true',
            category: category
        });
    } catch (err) {
        res.json({ message: err })
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