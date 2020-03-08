const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Product = require('../models/Product');

//SUBMITS THE Product
router.get('/product', async (req, res, next) => {
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

module.exports = router;