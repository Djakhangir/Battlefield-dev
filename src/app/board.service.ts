import { Injectable } from '@angular/core';
import { Player } from './player';
import { Board } from './board';

@Injectable()
export class BoardService {
  playerId:number = 1;
  boards:Board[]=[];

  constructor() { }

  // Method which creates a Board that takes optional size parameters that default is 5
createBoard(size:number=5){
    //To create tiles for the board
    let tiles=[];
    for(let i=0; i < size; i++){
      tiles[i] = [];
        for(let j=0; j < size; j++){
          tiles[i][j] = { used: false, value:0, status:'' } ;
          }
        }
      //Generate random ship locations for the board
for(let i=0; i < size*2; i++){
  tiles = this.randomShips(tiles, size);
}
  //Create a Board
let board = new Board({
  player: new Player ({ id: this.playerId++ }),
  tiles: tiles
});
  //Append created board to 'boards' property
this.boards.push(board);
  return this;
}

  //function to return the tiles after a value of 1 (ship) inserted into a random  tile in the array of tiles...
randomShips(board: Object[], len:number): Object[] {
  len = len - 1;
  let randomRow = this.getRandomInt(0, len),
  randomColumn = this.getRandomInt(0, len); 
if (board[randomRow][randomColumn].value == 1) {
  return this.randomShips(board, len);
} else {
  board[randomRow][randomColumn].value = 1; 
  return board;
  }
}

//helper function to  return a random number between min and max

getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + min;
}

//return all created boards
getBoards(): Board[] {
  return this.boards;
  }
}
