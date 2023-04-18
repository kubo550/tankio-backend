import express from "express";
import helmet from "helmet";
import {Server} from "socket.io";
import {generateRandomWalls} from "./game/utils";

const app = express();

app.use(helmet());

const http = require('http').Server(app);
const io = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let walls = generateRandomWalls();

app.get('/', (req, res) => {
        io.emit('initLevel', {walls, players})
        return res.send('Hello World!')
    }
);

function getColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

function getPlayer(socket: { id: string }) {
    return {
        id: socket.id,
        color: getColor(),
        position: {
            x: 20,
            y: 20
        },
        rotation: 0,
        name: 'Kuba'
    };
}

let players: ReturnType<typeof getPlayer>[] = [];
let bullets: any[] = [];


io.on('connection', socket => {
    console.log('A player connected');

    const player = getPlayer(socket);

    players.push(player);

    io.emit('initLevel', {walls, players})
    socket.broadcast.emit('newPlayer', player);


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
            bullets.push(data);
        }
        socket.broadcast.emit('playerShoot', data);

    });

    socket.on('disconnect', () => {
        console.log('A player disconnected');
        players = players.filter(p => p.id !== socket.id);
    });
});

const port = process.env.PORT || 8080;

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});