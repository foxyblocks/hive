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
};

export type Space = {
  row: number; // can be 0 or positive or negative
  column: number; // can be 0 or positive or negative
  piece?: Piece;
};

export enum Player {
  'WHITE' = '0',
  'BLACK' = '1',
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
  whiteBag: Piece[];
  blackBag: Piece[];
  board: Space[];
}

function makeBag(player: Player): Piece[] {
  const bag = [];
  for (const kind of Object.values(PieceKind)) {
    for (let i = 0; i < QUANTITIES[kind]; i++) {
      const id = QUANTITIES[kind] > 1 ? `${kind}${i + 1}` : kind;
      bag.push({
        kind,
        id,
        player,
      });
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
function makeBoard() {
  const spaces: Space[] = [];
  for (let row = -10; row <= 10; row++) {
    for (let column = -10; column <= 10; column++) {
      if (isEven(row) && isEven(column)) {
        continue;
      }
      if (isOdd(row) && isOdd(column)) {
        continue;
      }
      spaces.push({ row, column });
    }
  }
  return spaces;
}

const Game: Game<HiveGameState> = {
  setup: () => ({
    whiteBag: makeBag(Player.WHITE),
    blackBag: makeBag(Player.BLACK),
    board: makeBoard(),
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    playPiece: ({ G, playerID }, piece: Piece, space: Space) => {
      // loop through the bag and remove the piece
      const bag = playerID === Player.WHITE ? G.whiteBag : G.blackBag;
      const index = bag.findIndex((p) => p.id === piece.id);
      bag.splice(index, 1);
      const boardSpace = G.board.find((s) => s.row === space.row && s.column === space.column);
      if (boardSpace) {
        boardSpace.piece = piece;
      }
    },
  },
};

export default Game;
