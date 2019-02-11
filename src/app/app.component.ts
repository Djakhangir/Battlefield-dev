import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BoardService } from "./board.service";
import { Board } from './board';

// declare the pusher for use:
declare let Pusher: any;
//Set game contants...
let NUM_PLAYERS:number = 2;
let BOARD_SIZE: number = 6;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BoardService]
})

export class AppComponent {
  pusherChannel:any;
  canPlay: boolean=true;
  player: number=0;
  players: number=0;
  gameId: string;
  gameUrl: string = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port: '');

  constructor(
    private toastr: ToastrService,
    private boardService:BoardService
  ) {
    this.createBoards();
    this.initPusher();
    this.listenForChanges();
  }

    // initialise Pusher on the client side and bind to presence channel by subscription to the presence channel
  // We also make some use of functionality from the pusher presence channel to update the players count and set turns of the players.
 initPusher() {
  // findOrCreate unique channel ID
  let id = this.getQueryParam('id');
  if (!id) {
    id = this.getUniqueId();
    location.search = location.search ? '&id=' + id : 'id=' + id;
  }
  this.gameId = id;
  
   // init pusher
   const pusher = new Pusher('APP_KEY', {
    authEndpoint: '/pusher/auth',
    cluster: 'eu'
  });

// bind to relevant Pusher presence channel
this.pusherChannel = pusher.subscribe(id);
this.pusherChannel.bind('pusher:member_added', member => { this.players++ })
this.pusherChannel.bind('pusher:subscription_succeeded', members => {
  this.players = members.count;
  this.setPlayer(this.players);
  this.toastr.success("Success", 'You are In!');
})
this.pusherChannel.bind('pusher:member_removed', member => { this.players-- });

    return this;
}

// Listen for `client-fire` events and Update the board object and other properties when event triggered.
// Client-fire is triggered in the fireTorpedo() when torpedo fired successfully.
  listenForChanges() {
    this.pusherChannel.bind('client-fire', (obj) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });
      return this;
  }

// initialise player and set turn
setPlayer(players:number = 0) {
  this.player = players - 1;
  if (players == 1) {
    this.canPlay = true;
  } else if (players == 2) {
    this.canPlay = false;
  }
  return this;
}

//Event handler for click event on each tile  - fires torpedo at selected  tile
  fireTorpedo(e:any) {
    let id = e.target.id,
    boardId = id.substr(1,2),
    row = id.substring(2,3), col = id.substring(3,4),
    tile = this.boards[boardId].tiles[row][col];
    if(!this.checkTheHit(boardId, tile)) {
      return;
    }
    if ( tile.value == 1) {
      this.toastr.success("You Got This.", "HUUURRRAAA!!! YOU SANK A SHIP!!!");
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.toastr.info("UGH Keep trying...", "YOU MISSED AGAIN, OOPSYYY!");
      this.boards[boardId].tiles[row][col].status = 'fail'
    } 
    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = "X";

// trigger `client-fire` event once a torpedo is successfully fired, takes the event name as argument and data in this case is object
    this.pusherChannel.trigger('client-fire', {
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId: boardId,
      board: this.boards[boardId]
    });
    return this;
  }
//Create board for the game and users...
createBoards() {
    for(let i = 0; i < NUM_PLAYERS; i++)
    this.boardService.createBoard(BOARD_SIZE);
    return this;
  }
// Mehtod that check the valid hiot, proper hit of the board or the turn and so on
checkTheHit(boardId:number, tile:any): boolean{
    if(boardId == this.player) {
      this.toastr.error("Don't Commit Suicide.", "You can't hit your own ship." )
      return false;
    }
    if (this.winner){
      this.toastr.error("Game Is Over!!!");
      return false;
    }
    if(!this.canPlay) {
      this.toastr.error("A bit too eager", "It's not your turn to play");
      return false;
    }
    if(tile.value == "X") {
      this.toastr.error("Don't waste your torpedos", "You've already shot here");
      return false;
    }
return true;
  }

  // helper function to get a query param
getQueryParam(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// helper function to create a unique presence channel
  // name for each game
getUniqueId () {
    return 'presence-' + Math.random().toString(36).substr(2, 8);
  }

  // get all the boards and assign to boards property
get boards (): Board[] {
  return this.boardService.getBoards()
  }

  //Winner property to determine if user won- once user gets a score higher than the game board, he wins.
get winner(): Board {
  return this.boards.find(board=> board.player.score >= BOARD_SIZE);
  }

  // check if player is a valid player for the game
get validPlayer(): boolean {
  return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
}


}
 


