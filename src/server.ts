import express from "express";
import helmet from "helmet";
import {Server} from "socket.io";
import {generateRandomWalls} from "./game/utils/createBoard";

const app = express();

app.use(helmet());

type Player = { id: string, color: string, position: { x: number, y: number }, rotation: number, name: string };
type Bullet = { id: string, playerId: string, position: { x: number, y: number } };

const http = require('http').Server(app);
const io = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

function getRandomName() {
    const nicknames = ["Canidae", "Felidae", "Cat", "Cattle", "Dog", "Donkey", "Goat", "Guinea pig", "Horse", "Pig",
        "Rabbit", "Fancy rat varieties", "laboratory rat strains", "Sheep breeds", "Water buffalo breeds"]
    return nicknames[Math.floor(Math.random() * nicknames.length)];
}

function getPlayer({socketId, color, name}: Partial<Player> & { socketId: string }): Player {
    const position = {x: 40 * Math.floor(Math.random() * 10) + 20, y: 40 * Math.floor(Math.random() * 10) + 20};
    const rotation = Math.floor(Math.random() * Math.PI * 2);
    return {
        id: socketId,
        color: color || getRandomColor(),
        name: name || getRandomName(),
        position,
        rotation,
    };
}

let players: Player[] = [];
let bullets: Bullet[] = [];


io.on('connection', socket => {
    const player = getPlayer({socketId: socket.id});

    players.push(player);

    socket.on('setNickname', (data: { nickname: string }) => {
        console.log('🚀 - data', data)
        const player = players.find(p => p.id === socket.id);
        if (player) {
            player.name = data.nickname;
        }
        console.log(player)
    });

    socket.on('restartGame', () => {
        const newPlayers = players.map(p => getPlayer({socketId: p.id, color: p.color, name: p.name}));
        players = newPlayers;
        const walls = generateRandomWalls();
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