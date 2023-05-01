
export function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

export function getRandomName() {
    const nicknames = ["Canidae", "Felidae", "Cat", "Cattle", "Dog", "Donkey", "Goat", "Guinea pig", "Horse", "Pig",
        "Rabbit", "Rat", "Sheep", "Bird", "Chicken", "Duck", "Goose", "Ostrich", "Turkey", "Fish", "Goldfish", "Tuna"
        , "Lizard", "Snake", "Turtle", "Amphibian", "Frog", "Toad", "Insect", "Ant", "Bee", "Butterfly", "Cockroach",
        "Spider", "Crustacean", "Crab", "Lobster", "Shrimp", "Mollusk", "Clam", "Oyster", "Snail", "Slug", "Jellyfish"]
    return nicknames[Math.floor(Math.random() * nicknames.length)];
}

