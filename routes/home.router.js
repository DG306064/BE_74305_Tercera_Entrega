import { Router } from "express";
import { Product } from "../config/models/Product.model.js";

const router = Router();

router.get('/', async (req, res) => {
    try{
        const products = await Product.find();
        
        // Transformar los datos para asegurar compatibilidad
        const transformedProducts = products.map(product => ({
            _id: product._id,
            title: product.title || 'Sin título',
            description: product.description || 'Sin descripción',
            code: product.code || 'Sin código',
            price: product.price || 0,
            status: product.status !== undefined ? product.status : true,
            stock: product.stock || 0,
            category: product.category || 'Sin categoría',
            thumbnails: product.thumbnails || '/static/img/default-product.jpg'
        }));        
        res.status(200).render('home', {
            title: 'Inicio',
            products: transformedProducts
        });
    }catch(error){
        console.error('Error al obtener productos:', error);
        res.status(503).json({ error: error.message })
    }
});

export default router;