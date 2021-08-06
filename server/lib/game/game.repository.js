module.exports = class InMemoryGameRepository {
  players = [1, 2];
  playerIndex;
  width;
  height;
  moves;
  grid = [];
  lastCol = -1;
  lastTop = -1;
  started = false;

  constructor() {
    this.width = 6;
    this.height = 7;
    this.moves = this.width * this.height;
  }

  getPlayerRound() {
    return this.players[this.playerIndex];
  }

  isStarted() {
    return Promise.resolve(this.started);
  }

  start() {
    if (this.started)
      return Promise.reject("game already started");
    this.started = true;
    this.resetGrid();
    return Promise.resolve({round: this.getPlayerRound()});
  }

  reset() {
    if(!this.started)
      return Promise.reject("game not started yet");
    this.resetGrid();
    return Promise.resolve({round: this.getPlayerRound()});
  }
   
  end() {
    if(!this.started)
      return Promise.reject("game not started yet");
    this.started = false;
    this.resetGrid();
    return Promise.resolve({ended: true});
  }

  resetGrid() {
    let index = 0;
    this.grid = [];
    while (index < this.height) {
      this.grid.push(new Array(this.width).fill("."));
      index += 1;
    }
    this.playerIndex = 0;
  }

  horizontal() {
    return this.grid[lasTop].join("");
  }

  vertical() {
    let vertical = [];
    for (let i = 0; i < this.height; i++) {
      vertical.push(this.grid[i][this.lastCol]);
    }
    return vertical.join("");
  }

  slashDiagonal() {
    let diagonal = [];
    for (let i = 0; i < this.height; i++) {
      const w = this.lastCol + this.lastTop - i;
      if (w >= 0 && w < this.width) diagonal.push(this.grid[i][w]);
    }

    return diagonal.join("");
  }

  backSlashDiagonal() {
    let backSlashDiagonal = [];
    for (let i = 0; i < this.height; i++) {
      let w = this.lastCol - this.lastTop + i;
      if (w >= 0 && w < this.width) backSlashDiagonal.push(this.grid[i][w]);
    }

    return backSlashDiagonal.join("");
  }

  isWinning() {
    if (this.lastCol == -1) return false;

    const lastPlay = this.grid[this.lastTop][this.lastCol];
    const streak = `${lastPlay}${lastPlay}${lastPlay}${lastPlay}`;

    return (
      this.horizontal().includes(streak) ||
      this.vertical().includes(streak) ||
      this.slashDiagonal().includes(streak) ||
      this.backSlashDiagonal().includes(streak)
    );
  }

  drop(player, column) {
    if (!(column >= 0 && column < this.width))
      return Promise.reject("invalid column");
    for (let h = this.width - 1; h >= 0; h--) {
      if (this.grid[h][col] == ".") {
        grid[h][column] = player;
        this.lastCol = column;
        this.lastTop = h;
        return Promise.resolve(true);
      }
    }
  }
};
