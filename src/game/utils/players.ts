import {Player} from "../../server";

function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

function getRandomName() {
    const nicknames = ["Canidae", "Felidae", "Cat", "Cattle", "Dog", "Donkey", "Goat", "Guinea pig", "Horse", "Pig",
        "Rabbit", "Rat", "Sheep", "Bird", "Chicken", "Duck", "Goose", "Ostrich", "Turkey", "Fish", "Goldfish", "Tuna"
        , "Lizard", "Snake", "Turtle", "Amphibian", "Frog", "Toad", "Insect", "Ant", "Bee", "Butterfly", "Cockroach",
        "Spider", "Crustacean", "Crab", "Lobster", "Shrimp", "Mollusk", "Clam", "Oyster", "Snail", "Slug", "Jellyfish"]
    return nicknames[Math.floor(Math.random() * nicknames.length)];
}

export function getPlayer({socketId, color, name, stats, state}: Partial<Player> & { socketId: string }): Player {
    const position = {x: 40 * Math.floor(Math.random() * 10) + 20, y: 40 * Math.floor(Math.random() * 10) + 20};
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