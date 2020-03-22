const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    status: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Category', CategorySchema);
