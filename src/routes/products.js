const { Router } = require("express");
const Product = require("../models/Product.js")
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });
const router_products = Router()
const cloudinary = require('cloudinary').v2;
require("dotenv").config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

router_products.get('/', async (req, res)=>{
    try {
        const products = await Product.find()
        res.render("products", {products})
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
})

router_products.post('/', upload.single('image'), async (req, res) => {
    try {
        const imageFile = req.file.path;

        const result = await cloudinary.uploader.upload(imageFile, {
            folder: "my-images-lab09"
        });
        const url = cloudinary.url(result.public_id, {
            width: 100,
            height: 100,
            Crop: 'fill'
          });

        const product = req.body;
        const newProduct = new Product({
            name: product.name,
            brand: product.brand,
            price: product.price,
            stock: product.stock,
            imageUrl: url,
        });

        await newProduct.save();
        res.redirect("/products");
    } catch (error) {
        return res.status(500).json({ error: 'Error al subir la imagen o guardar el producto' });
    }
});




router_products.get('/delete/:id', async (req, res)=>{
    try {
        const { id } = req.params
        await Product.findByIdAndDelete(id)
        res.redirect("/products")
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });

    }
})

router_products.get('/:id', async (req, res)=>{
    try {
        const { id } = req.params
        const product = await Product.findById(id);
        res.render('product-edit', {product})
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
    
})

router_products.post('/:id', upload.single('image'),async (req, res)=>{
    try {
        const imageFile = req.file.path;

        const result = await cloudinary.uploader.upload(imageFile, {
            folder: "my-images-lab09"
        });
        const url = cloudinary.url(result.public_id, {
            width: 100,
            height: 100,
            Crop: 'fill'
          });

        const product = {
            name: req.body.name,
            brand: req.body.brand,
            price: req.body.price,
            stock: req.body.stock,
            imageUrl: url,
        }
        
        await Product.findByIdAndUpdate(req.params.id, product, { new: true });
        res.redirect('/products')
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
})


module.exports = router_products
