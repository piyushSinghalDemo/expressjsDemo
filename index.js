const mongoose = require("mongoose");
const log = require("debug")("app:main");
const Express = require("express");

const config = require("./config.json");

// Register schemas
const Product = mongoose.model("Product", require("./models/product"));
const Variation = mongoose.model("Variation", require("./models/variation"));

const app = new Express();

// Connect to db
mongoose.connect(config.connection, { useNewUrlParser: true });

app.get("/purchasables", async (req, res) => {
    const query = req.query.query;
    const filter = req.query.filter;

    let products;

    if (query) {
        // If query argument is present
        products = await Product.find({ name: { $regex: `.*${query}.*` }}).lean();
    } else if (filter) {
        // If filter argument is present
        products = await Product.find(filter).lean();
    } else {
        // If no arguments are present
        products = await Product.find().lean();
    }

    const purchasables = [];
   
    // Check all found products
    for (let i in products) {
        const product = products[i];
        const variations = await Variation.find({ product });
    
        if (variations.length > 0) {
            // If product has variations then they are purchasables
            await asyncForEach(variations, ele => purchasables.push(mergeVariation(product, ele)));
        } else {
            // Else the product is purchasable
            purchasables.push(product);
        }
    }

    // Send the list
    res.json(purchasables);
});

app.get("/purchasables/:id", async (req, res) => {
    const id = req.params.id;

    // Check if id is a variation id
    let variation = await Variation.findById(id);

    let product;
    if (variation) {
        // If variation id, then find the base product
        product = await Product.findById(variation.product).lean();
    } else {
        // If not a variation id, then search for product with id
        product = await Product.findById(id).lean();
    }

    if (product) {
        // If product is present
        const out = product;
        const variations = await Variation.find({ product });

        // If product has variations then append to product object
        if (variations.length > 0) out.variations = variations;

        // Send product
        return res.json(out);
    } else {
        //If no prodcut found, send 404
        res.sendStatus(404);
    }
});

app.listen(config.port);

function mergeVariation (product, variation) {
    // Override variation parameters with bas product
    return {
        _id: variation.id,
        name: variation.name || product.name || "",
        description: variation.description || product.description || "",
        images: variation.images || product.images || [],
        price: variation.price || product.price || 0,
        discounted_price: variation.discounted_price || product.discounted_price || 0,
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}