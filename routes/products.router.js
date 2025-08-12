import { Router } from "express";
import multer from "multer";
import path from 'path';
import ProductsManager from '../services/productsManager.js'

const router = Router();

router.get('/', async (req, res) => {
    const products = await ProductsManager.getProducts();
    console.log(`Productos enviados a la vista: ${products}`);
    res.render('products', {
        title: 'Productos',
        products
    });
});

//Products management routes

router.get('/', async (req, res) =>{
    const products = await ProductsManager.getProducts()
    res.status(200).json(products);
})

router.get('/api/products/:id', async (req, res) =>{
    const id = parseInt(req.params.id)
    const product = await ProductsManager.getProductById(id)
    res.status(201).json(product)
})

router.post('/api/products', async (req, res) =>{
    const { title, description, code, price, status, stock, category, thumbnails } = req.body
    
    if(typeof title !== 'string' || title.trim().length === 0 ){
        res.status(404).json("El titulo no es valido")
    }

    if(typeof description !== 'string' || description.trim().length === 0 ){
        res.status(404).json("La descripcion no es valida")
    }
    
    if(typeof code !== 'string' || code.trim().length === 0 ){
        res.status(404).json("El codigo no es valido")
    }

    if(typeof price !== 'number' || price <= 0){
        res.status(404).json("El precio debe ser mayor a 0")
    }

    if(typeof status !== 'boolean'){
        res.status(404).json("El status debe ser verdadero o falso")
    }

    if(typeof stock !== 'number' || stock < 0){
        res.status(404).json("El precio debe ser mayor o igual a 0")
    }

    if(typeof category !== 'string' || category.trim().length === 0 ){
        res.status(404).json("La categoria no es valida")
    }

    if(typeof thumbnails !== 'string' || thumbnails.trim().length === 0 ){
        res.status(404).json("La categoria no es valida")
    }

    const newProduct = {
        title: title,
        description: description,
        code: code,
        price: price,
        status: status,
        stock: stock,
        category: category,
        thumbnails: thumbnails
    }

    ProductsManager.addProduct(newProduct)

    res.status(201).json("Producto agregado correctamente")

})

router.put('/api/products/:id', async (req, res) => {
    const pid = parseInt(req.params.id)
    const productData = req.body;
    const updatedProduct = await ProductsManager.updateProduct(pid, productData);
    return res.status(200).json(updatedProduct);
})

router.delete('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await ProductsManager.deleteProduct(id)
    return res.status(204)
})

export default router;

