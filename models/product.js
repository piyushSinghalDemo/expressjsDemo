const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Options = new Schema({
    set: [{
        type: String
    }]
});

module.exports = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    images: [{
        type: String
    }],
    price: {
        type: Number
    },
    discounted_price: {
        type: Number
    },
    attributes: [{
        type: String
    }],
    options: [ Options ]
});