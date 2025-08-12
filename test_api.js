// Archivo de prueba para la API de productos con paginación
// Ejecutar con: node test_api.js

const baseUrl = 'http://localhost:3000';

// Función para hacer peticiones HTTP
async function testAPI(endpoint, description) {
    try {
        console.log(`\n🔍 Probando: ${description}`);
        console.log(`URL: ${baseUrl}${endpoint}`);
        
        const response = await fetch(`${baseUrl}${endpoint}`);
        const data = await response.json();
        
        console.log('✅ Respuesta exitosa:');
        console.log(`Status: ${data.status}`);
        console.log(`Productos encontrados: ${data.payload.length}`);
        console.log(`Página actual: ${data.page}`);
        console.log(`Total de páginas: ${data.totalPages}`);
        console.log(`Tiene página anterior: ${data.hasPrevPage}`);
        console.log(`Tiene página siguiente: ${data.hasNextPage}`);
        
        if (data.payload.length > 0) {
            console.log('Primer producto:');
            console.log(`  - Título: ${data.payload[0].title}`);
            console.log(`  - Precio: $${data.payload[0].price}`);
            console.log(`  - Categoría: ${data.payload[0].category}`);
            console.log(`  - Disponible: ${data.payload[0].status}`);
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Error en ${description}:`, error.message);
    }
}

// Función principal de pruebas
async function runTests() {
    console.log('🚀 Iniciando pruebas de la API de productos con paginación\n');
    
    // Test 1: Obtener productos con paginación básica
    await testAPI('/realTimeProducts?limit=5&page=1', 'Paginación básica (5 productos, página 1)');
    
    // Test 2: Buscar productos por categoría
    await testAPI('/realTimeProducts?query=electronics', 'Búsqueda por categoría "electronics"');
    
    // Test 3: Ordenar productos por precio ascendente
    await testAPI('/realTimeProducts?sort=asc', 'Ordenamiento por precio ascendente');
    
    // Test 4: Ordenar productos por precio descendente
    await testAPI('/realTimeProducts?sort=desc', 'Ordenamiento por precio descendente');
    
    // Test 5: Filtrar productos disponibles
    await testAPI('/realTimeProducts?query=true', 'Filtrar productos disponibles');
    
    // Test 6: Filtrar productos no disponibles
    await testAPI('/realTimeProducts?query=false', 'Filtrar productos no disponibles');
    
    // Test 7: Combinación de filtros
    await testAPI('/realTimeProducts?limit=3&page=1&sort=asc&query=electronics', 'Combinación de filtros');
    
    // Test 8: Página específica
    await testAPI('/realTimeProducts?limit=2&page=2', 'Página específica (página 2, 2 productos)');
    
    // Test 9: Sin parámetros (valores por defecto)
    await testAPI('/realTimeProducts', 'Sin parámetros (valores por defecto)');
    
    console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar las pruebas si el archivo se ejecuta directamente
if (typeof window === 'undefined') {
    // Verificar si fetch está disponible (Node.js 18+)
    if (typeof fetch === 'undefined') {
        console.log('⚠️  Este script requiere Node.js 18+ o instalar node-fetch');
        console.log('Para instalar node-fetch: npm install node-fetch');
        process.exit(1);
    }
    
    runTests().catch(console.error);
} else {
    // Si se ejecuta en el navegador
    console.log('🌐 Ejecutando en el navegador...');
    runTests().catch(console.error);
}

// Exportar para uso en otros archivos
export { testAPI, runTests };
