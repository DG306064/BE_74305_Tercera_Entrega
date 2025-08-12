// JavaScript específico para la página de realTimeProducts
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que estamos en la página correcta
    if (!window.location.pathname.includes('/api/realTimeProducts')) {
        console.log('realTimeProducts.js cargado en página incorrecta, saliendo...');
        return;
    }
    
    console.log('Página realTimeProducts cargada');
    
    const socket = io();
    let username = null;

    // Verificar que SweetAlert2 esté disponible
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 no está disponible');
    } else {
        console.log('SweetAlert2 está disponible');
    }

    // Verificar si ya hay un username guardado
    const savedUsername = sessionStorage.getItem('username');
    if (!savedUsername) {
        console.log('Intentando mostrar SweetAlert de bienvenida...');
        
        //Sweetalert para nombre de usuario
        Swal.fire({
            title: "Bienvenido",
            text: "Ingresa tu nombre de usuario",
            input: 'text',
            inputPlaceholder: 'Ingresa aqui tu nombre',
            confirmButtonText: 'Ingresar',
            allowOutsideClick: false,
            inputValidator: (value) =>{
                if(!value) return 'Debes ingresar tu nombre de usuario';
            }
        }).then(result => {
            username = result.value;
            sessionStorage.setItem('username', username);
            console.log('Usuario ingresado:', username);
        }).catch(error => {
            console.error('Error al mostrar SweetAlert:', error);
        });
    } else {
        username = savedUsername;
        console.log('Usuario ya guardado:', username);
    }

    // Escuchar cuando se agrega un producto
    socket.on('productAdded', data => {
        console.log('Producto agregado recibido: ', data);

        //Mostrar mensaje de exito
        Swal.fire({
            title:'Producto agregado con exito',
            text: data.message,
            icon: 'success',
            timer: 2000
        }).then(() => {
            console.log('SweetAlert de éxito mostrado');
        }).catch(error => {
            console.error('Error al mostrar SweetAlert de éxito:', error);
        });

        //Actualizar la lista de productos en la vista
        if (data.products && Array.isArray(data.products)) {
            updateProductsList(data.products);
        } else {
            console.error('Data de productos inválida:', data.products);
        }
    });

    //Funcion para actualizar la lista de productos
    function updateProductsList(products){
        console.log('Actualizando lista de productos:', products);
        const productsDiv = document.getElementById('productsDiv');
        
        if (products.length === 0) {
            productsDiv.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="bi bi-info-circle"></i> No hay productos cargados
                    </div>
                </div>
            `;
            console.log('No hay productos para mostrar');
            return;
        }
        
        // Limpiar lista actual
        productsDiv.innerHTML = '';
        
        // Agregar productos actualizados
        products.forEach((product, index) => {
            console.log(`Procesando producto ${index + 1}:`, product);
            
            const productCard = document.createElement('div');
            productCard.className = 'col-12 col-sm-6 col-lg-4 mb-3';
            productCard.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${product.thumbnails || '/static/img/default.jpg'}" class="card-img-top" alt="${product.title}" 
                         style="height: 200px; object-fit: cover;" onerror="this.src='/static/img/default.jpg'">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text text-muted small">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">$${product.price}</span>
                            <span class="badge bg-secondary">Stock: ${product.stock}</span>
                        </div>
                        <div class="mt-2">
                            <span class="badge bg-${product.status ? 'success' : 'danger'}">
                                ${product.status ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            productsDiv.appendChild(productCard);
        });
        
        console.log('Lista de productos actualizada exitosamente');
    }

    // Logs de conexión de Socket.IO
    socket.on('connect', () => {
        console.log('Conectado al servidor Socket.IO');
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor Socket.IO');
    });

    socket.on('connect_error', (error) => {
        console.error('Error de conexión Socket.IO:', error);
    });

    // Log cuando la página se carga completamente
    console.log('Página realTimeProducts cargada completamente');
    console.log('Elemento productsDiv encontrado:', !!document.getElementById('productsDiv'));
});