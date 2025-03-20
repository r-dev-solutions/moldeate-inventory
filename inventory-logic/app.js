require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI) // Removed deprecated options
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Define a Product schema
const productSchema = new mongoose.Schema({
    precio: Number,
    codigo: String,
    descripcion: String,
    precio_cs: Number,
    talla: String,
    stock: Number,
    img_url1: String, // New field for image URL 1
    img_url2: String  // New field for image URL 2
});

// Create a Product model
const Product = mongoose.model('Product', productSchema);

// POST: Add or update product stock
app.post('/products', async (req, res) => {
    const { precio, codigo, descripcion, precio_cs, talla, stock, img_url1, img_url2 } = req.body; // Include new fields
    let product = await Product.findOne({ codigo, talla });
    if (product) {
        product.stock += stock;
        product.img_url1 = img_url1; // Update image URL 1
        product.img_url2 = img_url2; // Update image URL 2
        await product.save();
        res.status(200).json(product);
    } else {
        product = new Product({ precio, codigo, descripcion, precio_cs, talla, stock, img_url1, img_url2 });
        await product.save();
        res.status(201).json(product);
    }
});

// PUT: Update product details or stock
app.put('/products/:codigo/:talla', async (req, res) => {
    const { codigo, talla } = req.params;
    const { operation, stock, img_url1, img_url2 } = req.body; // Include new fields
    const product = await Product.findOne({ codigo, talla });
    if (product) {
        if (operation === 'sell') {
            if (product.stock >= stock) {
                product.stock -= stock;
            } else {
                return res.status(400).send('Insufficient stock');
            }
        } else if (operation === 'add') {
            product.stock += stock;
        } else {
            return res.status(400).send('Invalid operation');
        }
        product.img_url1 = img_url1; // Update image URL 1
        product.img_url2 = img_url2; // Update image URL 2
        await product.save();
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
});

// GET: Retrieve all products
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// DELETE: Remove product by codigo
app.delete('/products/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const result = await Product.deleteOne({ codigo });
    if (result.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(404).send('Product not found');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});