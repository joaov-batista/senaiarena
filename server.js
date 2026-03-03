const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

let players = {};

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    // Atribui lado (Esquerda ou Direita)
    if (Object.keys(players).length < 2) {
        players[socket.id] = {
            side: Object.keys(players).length === 0 ? 'left' : 'right',
            y: 175
        };
        socket.emit('playerID', players[socket.id].side);
    }

    socket.on('move', (y) => {
        if (players[socket.id]) {
            players[socket.id].y = y;
            socket.broadcast.emit('opponentMove', { y, side: players[socket.id].side });
        }
    });

    socket.on('shoot', (data) => {
        socket.broadcast.emit('opponentShoot', data);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        console.log('Usuário desconectado');
    });
});

server.listen(3000, () => console.log('Acesse: http://localhost:3000'));