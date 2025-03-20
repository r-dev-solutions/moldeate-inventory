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
app.use(cors());

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
    tipoCompra: String, // New field for Tipo de Compra
    nombre: String, // New field for Nombre
    apellido: String, // New field for Apellido
    correoElectronico: String, // New field for Correo electronico
    telefono: String, // New field for Telefono
    direccion: String, // New field for Direccion
    ciudad: String, // New field for Ciudad
    departamento: String, // New field for Departamento
    notasAdicionales: String, // New field for Notas adicionales
    metodoPago: String, // New field for Metodos de pago
    cantidad: Number, // New field for Cantidad
    totalPedido: Number // New field for Total Pedido
});

// Create a Product model
const Product = mongoose.model('Product', productSchema);

// POST: Add or update product stock or process a sale
app.post('/products', async (req, res) => {
    const { precio, codigo, descripcion, precio_cs, talla, stock, img_url1, img_url2, tipoCompra, nombre, apellido, correoElectronico, telefono, direccion, ciudad, departamento, notasAdicionales, metodoPago, cantidad, totalPedido } = req.body;
    let product = await Product.findOne({ codigo, talla });
    if (product) {
        product.stock += stock;
        product.img_url1 = img_url1;
        product.img_url2 = img_url2;
        product.tipoCompra = tipoCompra;
        product.nombre = nombre;
        product.apellido = apellido;
        product.correoElectronico = correoElectronico;
        product.telefono = telefono;
        product.direccion = direccion;
        product.ciudad = ciudad;
        product.departamento = departamento;
        product.notasAdicionales = notasAdicionales;
        product.metodoPago = metodoPago;
        product.cantidad = cantidad;
        product.totalPedido = totalPedido;
        await product.save();
        res.status(200).json(product);
    } else {
        product = new Product({ precio, codigo, descripcion, precio_cs, talla, stock, img_url1, img_url2, tipoCompra, nombre, apellido, correoElectronico, telefono, direccion, ciudad, departamento, notasAdicionales, metodoPago, cantidad, totalPedido });
        await product.save();
        res.status(201).json(product);
    }
});

// PUT: Update product details or stock
app.put('/products/:codigo/:talla', async (req, res) => {
    const { codigo, talla } = req.params;
    const { precio, descripcion, precio_cs, stock, img_url1, img_url2, tipoCompra, nombre, apellido, correoElectronico, telefono, direccion, ciudad, departamento, notasAdicionales, metodoPago, cantidad, totalPedido } = req.body;
    const product = await Product.findOne({ codigo, talla });
    if (product) {
        if (precio !== undefined) product.precio = precio;
        if (descripcion !== undefined) product.descripcion = descripcion;
        if (precio_cs !== undefined) product.precio_cs = precio_cs;
        if (stock !== undefined) product.stock = stock;
        if (img_url1 !== undefined) product.img_url1 = img_url1;
        if (img_url2 !== undefined) product.img_url2 = img_url2;
        if (tipoCompra !== undefined) product.tipoCompra = tipoCompra;
        if (nombre !== undefined) product.nombre = nombre;
        if (apellido !== undefined) product.apellido = apellido;
        if (correoElectronico !== undefined) product.correoElectronico = correoElectronico;
        if (telefono !== undefined) product.telefono = telefono;
        if (direccion !== undefined) product.direccion = direccion;
        if (ciudad !== undefined) product.ciudad = ciudad;
        if (departamento !== undefined) product.departamento = departamento;
        if (notasAdicionales !== undefined) product.notasAdicionales = notasAdicionales;
        if (metodoPago !== undefined) product.metodoPago = metodoPago;
        if (cantidad !== undefined) product.cantidad = cantidad;
        if (totalPedido !== undefined) product.totalPedido = totalPedido;
        
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