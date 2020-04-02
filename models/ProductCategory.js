const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
