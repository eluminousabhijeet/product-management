const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Products', ProductSchema);