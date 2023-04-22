import {Player} from "../../server";

function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

function getRandomName() {
    const nicknames = ["Canidae", "Felidae", "Cat", "Cattle", "Dog", "Donkey", "Goat", "Guinea pig", "Horse", "Pig",
        "Rabbit", "Fancy rat varieties", "laboratory rat strains", "Sheep breeds", "Water buffalo breeds"]
    return nicknames[Math.floor(Math.random() * nicknames.length)];
}

export function getPlayer({socketId, color, name}: Partial<Player> & { socketId: string }): Player {
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