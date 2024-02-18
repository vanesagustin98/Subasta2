// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 5500 });

let precioActual = 0;
let ganador = null;
let contador;

server.on('connection', (socket) => {
    console.log('Cliente conectado.');

    socket.on('message', (message) => {
        const nuevaOferta = parseFloat(message);

        if (!isNaN(nuevaOferta) && nuevaOferta >= precioActual) {
            console.log(`Nueva oferta recibida: $${nuevaOferta}`);

            // Actualizar la oferta máxima actual y al ganador
            precioActual = nuevaOferta;
            ganador = socket;

            reiniciarContador();
            
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(precioActual.toString());
                }
            });
        }
    });

    socket.on('close', () => {
        console.log('Cliente desconectado.');
        if (socket === ganador) {
            console.log('¡El ganador se desconectó! Reiniciando contador.');

            if (socket.readyState === WebSocket.OPEN) {
                socket.send('¡Usted es el ganador!');
            }

            reiniciarContador();
        }
    });
});

function reiniciarContador() {
    clearInterval(contador);
    iniciarContador();
}

function iniciarContador() {
    contador = 10;
    const intervalId = setInterval(() => {
        if (contador >= 0) {
            console.log(`Contador: ${contador}s`);
            contador--;
        } else {
            console.log('¡Tiempo agotado! El ganador es el que hizo la última oferta.');
            if (ganador && ganador.readyState === WebSocket.OPEN) {
                ganador.send('¡Usted es el ganador!');
            }
            ganador = null;
            clearInterval(intervalId);
        }
    }, 1000);
}
