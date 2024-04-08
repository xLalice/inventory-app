const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    numberInStock: {
        type: Number,
        required: true
    },
    url: String,
    brand: String,
    weight: String,
    expirationDate: Date,
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [String]
})

module.exports = mongoose.model("Item", ItemSchema);
