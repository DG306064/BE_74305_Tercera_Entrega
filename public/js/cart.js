// JavaScript específico para la página del carrito
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página del carrito cargada');
    
    // Verificar que SweetAlert2 esté disponible
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 no está disponible');
    } else {
        console.log('SweetAlert2 está disponible');
    }

    // Manejar botones de "Agregar al carrito"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productTitle = this.getAttribute('data-product-title');
            const productPrice = this.getAttribute('data-product-price');
            
            // Mostrar prompt para cantidad
            Swal.fire({
                title: `Agregar ${productTitle}`,
                text: 'Ingresa la cantidad que deseas agregar:',
                input: 'number',
                inputValue: 1,
                inputAttributes: {
                    min: '1',
                    step: '1'
                },
                showCancelButton: true,
                confirmButtonText: 'Agregar al Carrito',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                    if (!value || value <= 0) {
                        return 'La cantidad debe ser mayor a 0';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    addProductToCart(productId, result.value, productTitle);
                }
            });
        });
    });

    // Función para agregar producto al carrito
    function addProductToCart(productId, quantity, productTitle) {
        fetch('/api/carts/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: parseInt(quantity)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                Swal.fire({
                    title: 'Error',
                    text: data.error,
                    icon: 'error'
                });
            } else {
                Swal.fire({
                    title: '¡Éxito!',
                    text: `${productTitle} agregado al carrito`,
                    icon: 'success',
                    timer: 2000
                });
                // Aquí se puede actualizar la vista del carrito
                updateCartDisplay();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al agregar el producto',
                icon: 'error'
            });
        });
    }

    // Función para actualizar la visualización del carrito
    function updateCartDisplay() {
        // Por ahora solo mostramos un mensaje
        console.log('Carrito actualizado');
        // Aquí se puede implementar la lógica para mostrar los productos en el carrito
    }

    // Manejar el formulario de checkout
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Mostrar confirmación antes de enviar
            Swal.fire({
                title: 'Confirmar Pedido',
                text: '¿Estás seguro de que quieres procesar este pedido?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, procesar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    processCheckout(formObject);
                }
            });
        });
    }

    // Función para procesar el checkout
    function processCheckout(formData) {
        fetch('/api/carts/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                Swal.fire({
                    title: 'Error',
                    text: data.error,
                    icon: 'error'
                });
            } else {
                Swal.fire({
                    title: '¡Pedido Procesado!',
                    text: `Tu pedido ha sido procesado correctamente. ID: ${data.orderId}`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirigir a la página principal
                    window.location.href = '/';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al procesar el pedido',
                icon: 'error'
            });
        });
    }

    // Logs de conexión
    console.log('Carrito inicializado correctamente');
    console.log('Botones de agregar al carrito encontrados:', addToCartButtons.length);
});

