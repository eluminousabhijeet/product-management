const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    productId: {
        type: String,
        require: true,
    },
    quantity: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        require: true
    },
    shippingName: {
        type: String,
        require: true
    },
    shippingAddress: {
        type: String,
        require: true
    },
    shippingPostcode: {
        type: String,
        require: true
    },
    shippingCountry: {
        type: String,
        require: true
    },
    shippingState: {
        type: String,
        require: true
    },
    shippingCity: {
        type: String,
        require: true
    },
    totalCost: {
        type: String,
        require: true
    },
    createdOn: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    }
});

const Orders = module.exports = mongoose.model('Orders', OrderSchema);

module.exports.addOrder = function (newProduct, callback) {
    newProduct.save(callback);
}

module.exports.getOrderById = function (id, callback) {
    Orders.findById(id, callback);
}
