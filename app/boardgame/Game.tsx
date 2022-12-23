import type { Game, Move, Ctx } from 'boardgame.io';

export enum PieceKind {
  QUEEN = 'Q',
  BEETLE = 'B',
  GRASSHOPPER = 'G',
  SPIDER = 'S',
  ANT = 'A',
}

export type Piece = {
  kind: PieceKind;
  id: string;
  player: Player;
  position?: Position;
};

export type Position = {
  row: number; // can be 0 or positive or negative
  column: number; // can be 0 or positive or negative
  layer: number; // How high stacked is this piece can be 0 or positive
};

export enum Player {
  'WHITE' = '0',
  'BLACK' = '1',
}

export function findPiece(pieces: Piece[], id: string) {
  return pieces.find((piece) => piece.id === id);
}

export function makePiece(kind: PieceKind, player: Player, pieceNumber: number = 1) {
  const label = QUANTITIES[kind] > 1 ? `${kind}${pieceNumber}` : kind;
  const id = `${player}-${label}`;
  return {
    id,
    kind,
    player,
  };
}

export function colorForPlayer(player: Player) {
  return player === Player.WHITE ? 'white' : 'black';
}

export function isCurrentPlayer(player: Player, ctx: Ctx) {
  return ctx.currentPlayer.toString() === player.toString();
}

const QUANTITIES = {
  [PieceKind.QUEEN]: 1,
  [PieceKind.BEETLE]: 2,
  [PieceKind.GRASSHOPPER]: 3,
  [PieceKind.SPIDER]: 2,
  [PieceKind.ANT]: 3,
};

export interface HiveGameState {
  pieces: Piece[];
}

function makeBag(player: Player): Piece[] {
  const bag = [];
  for (const kind of Object.values(PieceKind)) {
    for (let i = 0; i < QUANTITIES[kind]; i++) {
      bag.push(makePiece(kind, player, i + 1));
    }
  }
  return bag;
}

function isOdd(num: number) {
  return Math.abs(num) % 2 === 1;
}

function isEven(num: number) {
  return Math.abs(num) % 2 === 0;
}

// make a board of spaces that goes 10 rows up, 10 rows down, 10 columns left, 10 columns right
export function makeBoard() {
  const spaces: Position[] = [];
  for (let row = -10; row <= 10; row++) {
    for (let column = -10; column <= 10; column++) {
      if (isEven(row) && isEven(column)) {
        continue;
      }
      if (isOdd(row) && isOdd(column)) {
        continue;
      }
      spaces.push({ row, column, layer: 0 });
    }
  }
  return spaces;
}

const Game: Game<HiveGameState> = {
  setup: () => ({
    pieces: [...makeBag(Player.WHITE), ...makeBag(Player.BLACK)],
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    movePiece: ({ G, playerID }, piece: Piece, position: Position) => {
      // TODO: make sure the piece doesn't have a position already
      // TODO: make sure the position doesn't have a piece already
      const index = G.pieces.findIndex((p) => p.id === piece.id);
      G.pieces[index].position = position;
    },
  },
};

export default Game;
