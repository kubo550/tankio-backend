import express from "express";
import helmet from "helmet";
import {Server} from "socket.io";
import {generateRandomWalls} from "./game/utils";

const app = express();

app.use(helmet());

type Player = { id: string, color: string, position: { x: number, y: number }, rotation: number, name: string, isHost: boolean };
type Bullet = { id: string, playerId: string, position: { x: number, y: number } };

const http = require('http').Server(app);
const io = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let walls = generateRandomWalls();


function getColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}


function getPlayer(socketId: string) {
    const position = {x: 40 * Math.floor(Math.random() * 10) + 20, y: 40 * Math.floor(Math.random() * 10) + 20};
    return {
        id: socketId,
        color: getColor(),
        position,
        rotation: 0,
        name: 'Kuba',
        isHost: false
    };
}

let players: Player[] = [];
let bullets: Bullet[] = [];
let host: Player;


io.on('connection', socket => {
    const player = getPlayer(socket.id);

    if (!host) {
        host = player;
        player.isHost = true;
    }
    players.push(player);

    socket.on('restartGame', () => {
        const newPlayers = players.map(p => getPlayer(p.id));
        players = newPlayers;
        io.emit('initLevel', {walls, players: newPlayers})
    });


    socket.on('playerMoved', (data) => {
        const player = players.find(p => p.id === socket.id);


        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
        }

        socket.broadcast.emit('playerMoved', data);
    });


    socket.on('playerShoot', (data) => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            const bullet = {playerId: socket.id, position: data.position, id: data.id};
            bullets.push(bullet);
            socket.broadcast.emit('playerShoot', bullet);
        }
    });

    socket.on('bulletMoved', (data) => {
        const bullet = bullets.find(b => b.id === data.id);
        if (bullet) {
            bullet.position = data.position;
            socket.broadcast.emit('bulletMoved', data);
        }

    });


    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);

    });
});

const port = process.env.PORT || 8080;

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});