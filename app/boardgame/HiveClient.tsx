'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { BoardProps, Client } from 'boardgame.io/react';
import Board from './Board';
import Game, { HiveGameState } from './Game';

interface HiveBoardProps extends BoardProps<HiveGameState> {
  // Additional custom properties for your component
}

function Main(props: HiveBoardProps) {
  return (
    <ChakraProvider>
      <Board {...props} />
    </ChakraProvider>
  );
}

const HiveClient = Client({
  game: Game,
  // The number of players.
  numPlayers: 2,
  board: Main,
});

export default HiveClient;
