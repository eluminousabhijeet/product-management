const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    stock: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    }
});

const Products = module.exports = mongoose.model('Products', ProductSchema);

module.exports.addProduct = function (newProduct, callback) {
    newProduct.save(callback);
}

module.exports.getProductByName = function (name, callback) {
    const query = {
        name: name
    }
    Products.findOne(query, callback);
}
