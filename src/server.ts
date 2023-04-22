import express from "express";
import helmet from "helmet";
import {Server} from "socket.io";
import {generateRandomWalls} from "./game/utils/createBoard";
import {getPlayer} from "./game/utils/players";
import {socketEventsDictonary} from "./game/domain/types";
import {Logger} from "./logger/logger";

const app = express();

app.use(helmet());

export type Player = { id: string, color: string, position: { x: number, y: number }, rotation: number, name: string };
export type Bullet = { id: string, playerId: string, position: { x: number, y: number } };

const http = require('http').Server(app);
const io = new Server(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


let players: Player[] = [];
let bullets: Bullet[] = [];


io.on(socketEventsDictonary.connection, socket => {
    Logger.info('connection event', {socketId: socket.id});

    const player = getPlayer({socketId: socket.id});

    players.push(player);

    socket.on(socketEventsDictonary.setNickname, (data: { nickname: string }) => {
        Logger.info('set nickname event', data);
        const player = players.find(p => p.id === socket.id);

        if (player) {
            player.name = data.nickname;
        }
    });

    socket.on(socketEventsDictonary.startGame, () => {
        Logger.info('start game event');

        const newPlayers = players.map(p => getPlayer({socketId: p.id, color: p.color, name: p.name}));
        players = newPlayers;
        const walls = generateRandomWalls();

        io.emit(socketEventsDictonary.startGame, {walls, players: newPlayers})
        Logger.info('start game event broadcasted');
    });

    socket.on(socketEventsDictonary.moveTank, (data) => {
        Logger.info('move tank event', data);
        const player = players.find(p => p.id === socket.id);

        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
        }

        socket.broadcast.emit(socketEventsDictonary.moveTank, data);
        Logger.info('move tank event broadcasted');
    });

    socket.on(socketEventsDictonary.fireBullet, (data) => {
        Logger.info('fire bullet event', data);
        const player = players.find(p => p.id === socket.id);

        if (player) {
            const bullet = {playerId: socket.id, position: data.position, id: data.id};
            bullets.push(bullet);
            socket.broadcast.emit(socketEventsDictonary.fireBullet, bullet);
            Logger.info('fire bullet event broadcasted');
        }

    });

    // todo: refactor this
    socket.on('bulletMoved', (data) => {

        const bullet = bullets.find(b => b.id === data.id);
        if (bullet) {
            bullet.position = data.position;
            socket.broadcast.emit('bulletMoved', data);
        }
    });

    socket.on(socketEventsDictonary.disconnect, () => {
        Logger.info('disconnect event', {socketId: socket.id});
        players = players.filter(p => p.id !== socket.id);
    });

});

const port = process.env.PORT || 8080;

http.listen(port, () => {
    Logger.info(`🚀 - Server is running on port ${port}`);
});