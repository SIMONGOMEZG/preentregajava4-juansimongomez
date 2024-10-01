let productos = [];
let carrito = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json');
        productos = await respuesta.json();
        mostrarProductos();
        mostrarOfertas();
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        mostrarNotificacion('Error al cargar los productos. Por favor, intenta de nuevo más tarde.');
    }
}

function mostrarProductos() {
    const listaProductos = document.getElementById('lista-productos');
    listaProductos.innerHTML = '';
    
    productos.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.classList.add('producto');
        productoElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="producto-info">
                <h3>${producto.nombre}</h3>
                <p class="precio">${producto.precio.toFixed(2)}€</p>
                <button onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
            </div>
        `;
        listaProductos.appendChild(productoElement);
    });
}

function mostrarOfertas() {
    const listaOfertas = document.getElementById('lista-ofertas');
    listaOfertas.innerHTML = '';
    
    const ofertas = productos.filter(producto => producto.oferta);
    ofertas.forEach(producto => {
        const ofertaElement = document.createElement('div');
        ofertaElement.classList.add('producto');
        ofertaElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="producto-info">
                <h3>${producto.nombre}</h3>
                <p class="precio"><del>${producto.precio.toFixed(2)}€</del> ${(producto.precio * 0.8).toFixed(2)}€</p>
                <button onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
            </div>
        `;
        listaOfertas.appendChild(ofertaElement);
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        const itemEnCarrito = carrito.find(item => item.id === id);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad++;
        } else {
            carrito.push({...producto, cantidad: 1});
        }
        actualizarCarrito();
        animarProducto(id);
        mostrarNotificacion(`${producto.nombre} añadido al carrito`);
    }
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const subtotalCarrito = document.getElementById('subtotal-carrito');
    const ivaCarrito = document.getElementById('iva-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const carritoCount = document.getElementById('carrito-count');
    
    listaCarrito.innerHTML = '';
    let subtotal = 0;
    
    carrito.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.nombre} - ${item.precio.toFixed(2)}€ x ${item.cantidad}
            <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
        subtotal += item.precio * item.cantidad;
    });
    
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    subtotalCarrito.textContent = subtotal.toFixed(2);
    ivaCarrito.textContent = iva.toFixed(2);
    totalCarrito.textContent = total.toFixed(2);
    carritoCount.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function eliminarDelCarrito(id) {
    const index = carrito.findIndex(item => item.id === id);
    if (index !== -1) {
        const item = carrito[index];
        if (item.cantidad > 1) {
            item.cantidad--;
        } else {
            carrito.splice(index, 1);
        }
        actualizarCarrito();
        mostrarNotificacion(`${item.nombre} eliminado del carrito`);
    }
}

function animarProducto(id) {
    const productoElement = document.querySelector(`[onclick="agregarAlCarrito(${id})"]`).closest('.producto');
    anime({
        targets: productoElement,
        scale: [1, 1.1, 1],
        duration: 300,
        easing: 'easeInOutQuad'
    });
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.style.opacity = '1';
    setTimeout(() => {
        notificacion.style.opacity = '0';
    }, 3000);
}

async function simularCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify({
                userId: 1,
                title: 'Compra realizada',
                body: JSON.stringify(carrito)
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        
        if (response.ok) {
            mostrarNotificacion('Compra realizada con éxito');
            carrito = [];
            actualizarCarrito();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al procesar la compra:', error);
        mostrarNotificacion('Error al procesar la compra. Por favor, intenta de nuevo más tarde.');
    }
}

function filtrarProductos() {
    const categoria = document.getElementById('categoria').value;
    const productosFiltrados = categoria === 'todos' 
        ? productos 
        : productos.filter(p => p.categoria === categoria);
    
    const listaProductos = document.getElementById('lista-productos');
    listaProductos.innerHTML = '';
    
    productosFiltrados.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.classList.add('producto');
        productoElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="producto-info">
                <h3>${producto.nombre}</h3>
                <p class="precio">${producto.precio.toFixed(2)}€</p>
                <button onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
            </div>
        `;
        listaProductos.appendChild(productoElement);
    });
}

function ordenarProductos() {
    const orden = document.getElementById('ordenar').value;
    const productosOrdenados = [...productos];
    
    switch(orden) {
        case 'nombre':
            productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'precio-asc':
            productosOrdenados.sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            productosOrdenados.sort((a, b) => b.precio - a.precio);
            break;
    }
    
    const listaProductos = document.getElementById('lista-productos');
    listaProductos.innerHTML = '';
    
    productosOrdenados.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.classList.add('producto');
        productoElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="producto-info">
                <h3>${producto.nombre}</h3>
                <p class="precio">${producto.precio.toFixed(2)}€</p>
                <button onclick="agregarAlCarrito(${producto.id})">Añadir al carrito</button>
            </div>
        `;
        listaProductos.appendChild(productoElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
    
    document.getElementById('comprar').addEventListener('click', simularCompra);
    document.getElementById('categoria').addEventListener('change', filtrarProductos);
    document.getElementById('ordenar').addEventListener('change', ordenarProductos);
});