"use client";

import { Client } from 'boardgame.io/react';
import Board from './Board';
import Game from './Game';

const HiveClient = Client({
  game: Game,
   // The number of players.
   numPlayers: 2,
   board: Board,

});

export default HiveClient;