const tileSize = 40;
const cols = 10;
const rows = 10;
const grid: Cell[] = [];
let current: Cell;


export const generateRandomWalls = () => {
    grid.length = 0;
    const stack: Cell[] = [];


    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = new Cell(x, y);
            grid.push(cell);
        }
    }

    current = grid[0];

    while (true) {
        current.isVisited = true;
        let next = current.checkNeighbors();
        if (next) {
            next.isVisited = true;
            stack.push(current);
            [current, next] = removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            // @ts-ignore
            current = stack.pop();
        } else {
            return createWallsBasedOnGrid(grid);
        }
    }
}

function createWallsBasedOnGrid(grid: Cell[]) {
    const walls: Wall[] = [];
    grid.forEach(cell => {
        const x = cell.x * tileSize;
        const y = cell.y * tileSize;
        const wallSize = 3;
        if (cell.walls[0]) {
            walls.push(new Wall(x, y, tileSize, wallSize));
        }
        if (cell.walls[1]) {
            walls.push(new Wall(x + tileSize, y, wallSize, tileSize));
        }
        if (cell.walls[2]) {
            walls.push(new Wall(x, y + tileSize, tileSize, wallSize));
        }
        if (cell.walls[3]) {
            walls.push(new Wall(x, y, wallSize, tileSize));
        }
    });
    return walls;
}


class Cell {
    walls: [boolean, boolean, boolean, boolean];
    isVisited: boolean;

    constructor(public x: number, public y: number) {
        this.walls = [true, true, true, true];
        this.isVisited = false;
    }


    checkNeighbors() {
        const neighbors = [];
        const top = grid[index(this.x, this.y - 1)];
        const right = grid[index(this.x + 1, this.y)];
        const bottom = grid[index(this.x, this.y + 1)];
        const left = grid[index(this.x - 1, this.y)];

        if (top && !top.isVisited) {
            neighbors.push(top);
        }
        if (right && !right.isVisited) {
            neighbors.push(right);
        }
        if (bottom && !bottom.isVisited) {
            neighbors.push(bottom);
        }
        if (left && !left.isVisited) {
            neighbors.push(left);
        }

        if (neighbors.length > 0) {
            const r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    }
}

function index(x: number, y: number) {
    if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) {
        return -1;
    }
    return x + y * cols;
}

function removeWalls(current: Cell, next: Cell): [Cell, Cell] {
    const x = current.x - next.x;
    if (x === 1) {
        current.walls[3] = false;
        next.walls[1] = false;
    } else if (x === -1) {
        current.walls[1] = false;
        next.walls[3] = false;
    }

    const y = current.y - next.y;
    if (y === 1) {
        current.walls[0] = false;
        next.walls[2] = false;
    } else if (y === -1) {
        current.walls[2] = false;
        next.walls[0] = false;
    }

    return [current, next];
}

class Wall {

    constructor(public x: number, public y: number, public width: number, public height: number) {
    }

}