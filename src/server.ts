import express from "express";
import helmet from "helmet";
import _ from "lodash";
import {Server} from "socket.io";

import {generateRandomWalls} from "./game/utils/createBoard";
import {getRandomColor, getRandomName} from "./game/utils/players";
import {socketEventsDictonary} from "./game/domain/types";
import {Logger} from "./logger/logger";

const app = express();

app.use(helmet());

export type Player = {
    id: string,
    name: string,
    color: string,
    rotation: number,
    position: { x: number, y: number },
    stats: { kills: number, deaths: number }
    state: 'lobby' | 'alive' | 'dead'
};
export type Bullet = { id: string, playerId: string, position: { x: number, y: number } };

const http = require('http').Server(app);
const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


let players: Player[] = [];
let bullets: Bullet[] = [];


function generatePosition() {
    const possiblePossitions = _.range(20,420, 40)
    return {x: _.sample(possiblePossitions), y: _.sample(possiblePossitions)}
}

export function getPlayer({socketId, color, name, stats, state}: Partial<Player> & { socketId: string }): Player {
    let position = generatePosition();
    let safeCounter = 100;

    while (players.some(p => p?.position?.x === position.x && p?.position?.y === position.y) && safeCounter > 0) {
        position = generatePosition();
        safeCounter--;
    }

    const rotation = Math.floor(Math.random() * Math.PI * 2);
    return {
        id: socketId,
        color: color || getRandomColor(),
        name: name || getRandomName(),
        position,
        rotation,
        stats: stats || {kills: 0, deaths: 0},
        state: state || 'lobby',
    };
}

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
        io.emit(socketEventsDictonary.setNickname, {id: socket.id, nickname: data.nickname});
    });

    socket.on(socketEventsDictonary.startGame, () => {
        Logger.info('start game event');

        emitNextLevel();
        Logger.info('start game event broadcasted');
    });

    socket.on(socketEventsDictonary.moveTank, (data) => {
        const player = players.find(p => p.id === socket.id);

        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
        }

        socket.broadcast.emit(socketEventsDictonary.moveTank, data);
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

    socket.on(socketEventsDictonary.hitTarget, (data: { hitTankId: string, bulletId: string }) => {
        Logger.info('hit target event', data);
        const bullet = bullets.find(b => b.id === data.bulletId);

        if (bullet) {
            bullets = bullets.filter(b => b.id !== data.bulletId);
        }

        const deadPlayer = players.find(p => p.id === data.hitTankId);
        if (deadPlayer) {
            deadPlayer.stats.deaths++;
            deadPlayer.state = 'dead';
        }

        const killerPlayer = players.find(p => p.id === bullet?.playerId);
        if (killerPlayer) {
            killerPlayer.stats.kills++;
        }

        const alivePlayers = players.filter(p => p.state === 'alive');
        console.log('alivePlayers.length', alivePlayers.length)
        console.log('players.length', players.length)
        if (players.length > 1 && alivePlayers.length < 2) {
            setTimeout(() => {
                emitNextLevel();
            }, 3000);
        }


        io.emit(socketEventsDictonary.hitTarget, {...data, players});
        Logger.info('hit target event broadcasted');
    });


    socket.on(socketEventsDictonary.disconnect, () => {
        Logger.info('disconnect event', {socketId: socket.id});
        players = players.filter(p => p.id !== socket.id);

        socket.broadcast.emit(socketEventsDictonary.playerConnected, {socketId: socket.id});
    });

});

function emitNextLevel() {
    bullets = [];
    const newPlayers = players.map(p => getPlayer({
        socketId: p.id,
        color: p.color,
        name: p.name,
        stats: p.stats,
        state: 'alive'
    }));
    players = newPlayers;
    const walls = generateRandomWalls();

    io.emit(socketEventsDictonary.startGame, {walls, players: newPlayers})
}

const port = 8080;

http.listen(port, () => {
    Logger.info(`🚀 - Server is running on port ${port}`);
});