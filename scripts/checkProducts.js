import { connectToMongoDB } from '../config/db/connect.config.js';
import { Product } from '../config/models/Product.model.js';

const checkProducts = async () => {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await connectToMongoDB();
        console.log('✅ Conexión exitosa a MongoDB');

        console.log('📊 Verificando productos en la base de datos...');
        const products = await Product.find().lean();
        
        console.log(`📈 Total de productos encontrados: ${products.length}`);
        
        if (products.length > 0) {
            console.log('📋 Productos encontrados:');
            products.forEach((product, index) => {
                console.log(`\n--- Producto ${index + 1} ---`);
                console.log('ID:', product._id);
                console.log('Título:', product.title);
                console.log('Descripción:', product.description);
                console.log('Código:', product.code);
                console.log('Precio:', product.price);
                console.log('Stock:', product.stock);
                console.log('Categoría:', product.category);
                console.log('Estado:', product.status);
                console.log('Imagen:', product.thumbnails);
            });
        } else {
            console.log('❌ No se encontraron productos en la base de datos');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        process.exit(0);
    }
};

checkProducts();

