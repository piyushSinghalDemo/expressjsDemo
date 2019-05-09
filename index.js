const mongoose = require("mongoose");
const log = require("debug")("app:main");
const Express = require("express");

const config = require("./config.json");

const Product = mongoose.model("Product", require("./models/product"));
const Variation = mongoose.model("Variation", require("./models/variation"));

const app = new Express();

mongoose.connect(config.connection, { useNewUrlParser: true });

app.get("/purchasables", async (req, res) => {
    const query = req.query.query;
    const filter = req.query.filter;

    let products;

    if (query) {
        products = await Product.find({ name: { $regex: `.*${query}.*` }});
    } else if (filter) {
        products = await Product.find(filter);
    } else {
        products = await Product.find();
    }

    const purchasables = [];
   
    for (let i in products) {
        const product = products[i];
        const variations = await Variation.find({ product });
        
        if (variations.length > 0) {
            await asyncForEach(variations, ele => purchasables.push(ele));
        } else {
            purchasables.push(product);
        }
    }

    res.json(purchasables);
});

app.get("/purchasables/:id", async (req, res) => {
    const id = req.params.id;
    let variation = await Variation.findById(id);

    let product;
    if (variation) {
        product = await Product.findById(variation.product).lean();
    } else {
        product = await Product.findById(id).lean();
    }

    if (product) {
        const out = product;
        const variations = await Variation.find({ product });

        if (variations.length > 0) out.variations = variations;

        log(out, out.variations)
        return res.json(out);
    } else {
        res.sendStatus(404);
    }
});

app.listen(config.port);

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}