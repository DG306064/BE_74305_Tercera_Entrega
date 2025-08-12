import { Router } from "express";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Product } from "../config/models/Product.model.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//CONFIGURAR EN STORAGE EL LUGAR DONDE GUARDAR LAS IMAGENES
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({storage});

// Ruta principal que maneja tanto vista web como API
router.get('/', async (req, res) => {
    try {
        // Obtener query parameters
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort;
        const query = req.query.query;
        
        // Construir filtro de búsqueda
        let filter = {};
        if (query) {
            // Buscar por categoría o disponibilidad (status)
            filter = {
                $or: [
                    { category: { $regex: query, $options: 'i' } },
                    { status: query.toLowerCase() === 'true' ? true : query.toLowerCase() === 'false' ? false : undefined }
                ].filter(condition => {
                    // Filtrar condiciones undefined
                    if (condition.status === undefined) {
                        delete condition.status;
                        return Object.keys(condition).length > 0;
                    }
                    return true;
                })
            };
        }
        
        // Construir opciones de ordenamiento
        let sortOptions = {};
        if (sort) {
            if (sort.toLowerCase() === 'asc') {
                sortOptions = { price: 1 };
            } else if (sort.toLowerCase() === 'desc') {
                sortOptions = { price: -1 };
            }
        }
        
        // Calcular skip para paginación
        const skip = (page - 1) * limit;
        
        // Obtener productos con filtros, ordenamiento y paginación
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();
        
        // Obtener total de productos para calcular páginas
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Calcular páginas anterior y siguiente
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? page - 1 : null;
        const nextPage = hasNextPage ? page + 1 : null;
        
        // Construir links
        const baseUrl = req.protocol + '://' + req.get('host') + '/realTimeProducts';
        const buildQueryString = (params) => {
            const queryParams = new URLSearchParams();
            if (limit !== 10) queryParams.append('limit', limit);
            if (page !== 1) queryParams.append('page', params.page || page);
            if (sort) queryParams.append('sort', sort);
            if (query) queryParams.append('query', query);
            return queryParams.toString();
        };
        
        const prevLink = hasPrevPage 
            ? `${baseUrl}?${buildQueryString({ page: prevPage })}`
            : null;
        const nextLink = hasNextPage 
            ? `${baseUrl}?${buildQueryString({ page: nextPage })}`
            : null;
        
        // Construir respuesta según el formato solicitado
        const response = {
            status: 'success',
            payload: products,
            totalPages: totalPages,
            prevPage: prevPage,
            nextPage: nextPage,
            page: page,
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink
        };
        
        // Si hay parámetros de query, devolver JSON (API)
        if (req.query.limit || req.query.page || req.query.sort || req.query.query) {
            return res.json(response);
        }
        
        // Si no hay parámetros, renderizar vista web
        console.log(`Productos enviados a la vista: ${products.length}`);
        console.log('Primer producto:', products[0]);
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products,
            isRealTimeProducts: true
        });
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        
        const errorResponse = {
            status: 'error',
            payload: [],
            totalPages: 0,
            prevPage: null,
            nextPage: null,
            page: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevLink: null,
            nextLink: null
        };
        
        // Si hay parámetros de query, devolver JSON (API)
        if (req.query.limit || req.query.page || req.query.sort || req.query.query) {
            return res.status(500).json(errorResponse);
        }
        
        // Si no hay parámetros, renderizar vista web
        res.status(500).render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products: [],
            msg: 'Error al cargar los productos',
            isRealTimeProducts: true
        });
    }    
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID Invalido' })
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
});

router.post('/', upload.single('image'), async (req, res) =>{
    try{
        console.log('=== POST /realTimeProducts ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

        // Validar que todos los campos requeridos estén presentes
        if (!req.body.title || !req.body.code || !req.body.price || !req.body.stock || !req.body.category) {
            console.error('Campos faltantes:', {
                title: !!req.body.title,
                code: !!req.body.code,
                price: !!req.body.price,
                stock: !!req.body.stock,
                category: !!req.body.category
            });
            return res.status(400).json("Faltan campos requeridos");
        }

        const newProduct = {
            title: req.body.title.trim(),
            description: req.body.description ? req.body.description.trim() : '',
            code: req.body.code.trim(),
            price: parseFloat(req.body.price),
            status: req.body.status === 'true',
            stock: parseInt(req.body.stock),
            category: req.body.category.trim(),
            thumbnails: req.file ? `/static/img/${req.file.filename}` : '/static/img/default-product.jpg'
        }

        console.log('newProduct creado:', newProduct);

        // Validaciones adicionales
        if (newProduct.title.length === 0) {
            return res.status(400).json("El título no puede estar vacío");
        }

        if (newProduct.code.length === 0) {
            return res.status(400).json("El código no puede estar vacío");
        }

        if (isNaN(newProduct.price) || newProduct.price <= 0) {
            return res.status(400).json("El precio debe ser mayor a 0");
        }

        if (isNaN(newProduct.stock) || newProduct.stock < 0) {
            return res.status(400).json("El stock debe ser mayor o igual a 0");
        }

        if (newProduct.category.length === 0) {
            return res.status(400).json("La categoría no puede estar vacía");
        }

        console.log('Intentando guardar producto en MongoDB...');
        const savedProduct = await new Product(newProduct).save();

        console.log('Producto guardado exitosamente:', savedProduct);
        console.log('ID del producto guardado:', savedProduct._id);

        const products = await Product.find().lean();
        console.log('Productos obtenidos después de guardar:', products.length);
        console.log('Primer producto en la lista:', products[0]);

        // Emitir evento socket.io
        req.app.get('io').emit('productAdded', {
            message: 'Producto agregado exitosamente',
            products: products
        });

        // Respuesta exitosa
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products: products,
            msg: 'Producto agregado correctamente',
            isRealTimeProducts: true
        });
    }catch(error){
        console.error('Error al agregar el producto: ', error);
        
        try {
            const products = await Product.find().lean();
            return res.status(503).render('realTimeProducts', {
                title: 'Productos en tiempo real',
                products: products,
                msg: `Error al agregar el producto: ${error.message}`,
                isRealTimeProducts: true
            });
        } catch (dbError) {
            console.error('Error adicional al obtener productos:', dbError);
            return res.status(503).render('realTimeProducts', {
                title: 'Productos en tiempo real',
                products: [],
                msg: 'Error crítico al procesar la solicitud',
                isRealTimeProducts: true
            });
        }
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID Invalido' })
        }
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID Invalido' });
        }; 
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
        res.json({ message: 'Producto eliminado con exito.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

export default router;