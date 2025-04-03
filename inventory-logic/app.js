require('dotenv').config(); // Load environment variables

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Log the URI to check if it's loaded correctly

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
const app = express();
const port = process.env.PORT || 3001; // Change port to 3001

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
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
    img_url1: String,
    img_url2: String,
    img_url3: String,
    img_url4: String,
    img_url5: String,
    location: String // Removed default value
});

// Create a Product model
const Product = mongoose.model('Product', productSchema);

// POST: Add or update product stock
app.post('/products', async (req, res) => {
    try {
        let products = req.body;
        // Convert single product to array if needed
        if (!Array.isArray(products)) {
            products = [products];
        }

        const results = [];
        for (const productData of products) {
            // Validate required fields
            if (!productData.codigo || !productData.talla) {
                results.push({ status: 'error', message: 'Missing required fields' });
                continue;
            }

            const { precio, codigo, descripcion, precio_cs, talla, stock, img_url1, img_url2, img_url3, img_url4, img_url5 } = productData;
            let product = await Product.findOne({ codigo, talla });
            
            if (product) {
                // Update existing product
                product.stock += stock || 0;
                product.img_url1 = img_url1 || product.img_url1;
                product.img_url2 = img_url2 || product.img_url2;
                product.img_url3 = img_url3 || product.img_url3;
                product.img_url4 = img_url4 || product.img_url4;
                product.img_url5 = img_url5 || product.img_url5;
                await product.save();
                results.push({ status: 'updated', product });
            } else {
                // Create new product
                product = new Product({
                    precio: precio || 0,
                    codigo,
                    descripcion: descripcion || '',
                    precio_cs: precio_cs || 0,
                    talla,
                    stock: stock || 0,
                    img_url1: img_url1 || '',
                    img_url2: img_url2 || '',
                    img_url3: img_url3 || '',
                    img_url4: img_url4 || '',
                    img_url5: img_url5 || '',
                    location: productData.location || ''
                });
                await product.save();
                results.push({ status: 'created', product });
            }
        }
        res.status(200).json(results);
    } catch (error) {
        console.error('Error in POST /products:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// PUT: Update product details or stock
app.put('/products/:codigo/:talla', async (req, res) => {
    const { codigo, talla } = req.params;
    const { precio, descripcion, precio_cs, stock, img_url1, img_url2, img_url3, img_url4, img_url5 } = req.body;
    const product = await Product.findOne({ codigo, talla });
    if (product) {
        if (precio !== undefined) product.precio = precio;
        if (descripcion !== undefined) product.descripcion = descripcion;
        if (precio_cs !== undefined) product.precio_cs = precio_cs;
        if (stock !== undefined) product.stock = stock;
        if (img_url1 !== undefined) product.img_url1 = img_url1;
        if (img_url2 !== undefined) product.img_url2 = img_url2;
        if (img_url3 !== undefined) product.img_url3 = img_url3; // Handle new field
        if (img_url4 !== undefined) product.img_url4 = img_url4; // Handle new field
        if (img_url5 !== undefined) product.img_url5 = img_url5; // Handle new field
        
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

// DELETE: Remove all products
app.delete('/products/all', async (req, res) => {
    try {
        console.log('DELETE /products/all request received');
        const result = await Product.deleteMany({});
        console.log('Delete result:', result);
        if (result.deletedCount > 0) {
            res.status(200).send(`${result.deletedCount} products deleted`);
        } else {
            res.status(404).send('No products found to delete');
        }
    } catch (error) {
        console.error('Error in DELETE /products/all:', error);
        res.status(500).send('Error deleting products');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});
