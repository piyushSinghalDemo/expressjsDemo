const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectID = mongoose.Schema.Types.ObjectId;

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
    product: {
        type: ObjectID,
        ref: "Product"
    }
});