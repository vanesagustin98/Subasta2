// app.js
let precioActual = 0;
let socket;
let contadorInterval;
let primeraOfertaRecibida = false;

function ofertar() {
    const nuevaOferta = parseFloat(prompt('Ingrese su oferta:'));

    if (!isNaN(nuevaOferta) && nuevaOferta >= precioActual) {
        precioActual = nuevaOferta;
        actualizarPrecio();

        if (!primeraOfertaRecibida) {
            iniciarContador();
            primeraOfertaRecibida = true;
        }

        enviarOferta(precioActual);
    } else {
        alert('Ingrese una oferta válida y mayor o igual al precio actual.');
    }
}

function actualizarPrecio() {
    document.getElementById('precio-actual').textContent = `Precio Actual: $${precioActual}`;
}

function iniciarContador() {
    let contador = 10;
    contadorInterval = setInterval(() => {
        if (contador >= 0) {
            document.getElementById('contador').textContent = `Contador: ${contador}s`;
            contador--;
        } else {
            document.getElementById('mensaje').textContent = '¡Tiempo agotado! El ganador es el que hizo la última oferta.';
            clearInterval(contadorInterval);
        }
    }, 1000);
}

function reiniciarContador() {
    clearInterval(contadorInterval);
    iniciarContador();
    document.getElementById('contador').textContent = ''; // Reiniciar el texto del contador
    document.getElementById('mensaje').textContent = ''; // Reiniciar el texto del mensaje
}

function iniciarWebSocket() {
    socket = new WebSocket('ws://localhost:5500');

    socket.addEventListener('open', (event) => {
        console.log('Conexión establecida con el servidor.');
    });

    socket.addEventListener('message', (event) => {
        const nuevaOferta = parseFloat(event.data);

        if (!isNaN(nuevaOferta)) {
            precioActual = nuevaOferta;
            actualizarPrecio();

            if (!primeraOfertaRecibida) {
                iniciarContador();
                primeraOfertaRecibida = true;
            }

            reiniciarContador();
        } else if (event.data === '¡Usted es el ganador!') {
            // Mostrar el mensaje del ganador en la página
            document.getElementById('mensaje').textContent = '¡Felicidades! ¡Usted es el ganador!';
        }
    });

    socket.addEventListener('close', () => {
        console.log('Conexión cerrada. Intentando reconectar...');
        setTimeout(iniciarWebSocket, 1000);
    });
}

function enviarOferta(oferta) {
    socket.send(oferta.toString());
}

// Iniciar la conexión WebSocket al cargar la página
iniciarWebSocket();
