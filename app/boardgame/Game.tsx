import type { Game, Move, Ctx, State } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { isAdjacent, isValidGridSpace } from './lib/isAdjacent';
import { Piece, PieceKind, Player, Position } from './types';

export function findPiece(pieces: Piece[], id: string) {
  return pieces.find((piece) => piece.id === id);
}

export function makePiece(kind: PieceKind, player: Player, pieceNumber: number = 1): Piece {
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

// make a board of spaces that goes 10 rows up, 10 rows down, 10 columns left, 10 columns right
export function makeBoard() {
  const spaces: Position[] = [];
  for (let row = -10; row <= 10; row++) {
    for (let column = -10; column <= 10; column++) {
      const space = { row, column, layer: 0 };
      if (!isValidGridSpace(space)) {
        continue;
      }
      spaces.push(space);
    }
  }
  return spaces;
}

export function isValidMove(piece: Piece, position: Position, state: HiveGameState, ctx: Ctx) {
  const existingPosition = state.pieces.find(
    (p) => p.position?.row === position.row && p.position?.column === position.column,
  );
  if (existingPosition) {
    return false;
  }

  if (ctx.turn === 2) {
    const firstPiecePosition = state.pieces.find((p) => Boolean(p.position))!.position!;
    return isAdjacent(firstPiecePosition, position);
  }
  if (ctx.turn >= 3) {
    const opponentPositions = state.pieces
      .filter((p) => p.player !== piece.player && p.position)
      .map((p) => p.position!);
    const ownPositions = state.pieces
      .filter((p) => p.player === piece.player && p.position)
      .map((p) => p.position!);
    if (opponentPositions.some((p) => isAdjacent(p, position))) {
      return false;
    }

    if (!ownPositions.some((p) => isAdjacent(p, position))) {
      return false;
    }

    return true;
  }

  return true;
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
    movePiece: (gameState, piece: Piece, position: Position) => {
      const { G, playerID, ctx } = gameState;
      // TODO: make sure the piece doesn't have a position already
      // TODO: make sure the position doesn't have a piece already
      if (!isValidMove(piece, position, G, ctx)) {
        return INVALID_MOVE;
      }
      const index = G.pieces.findIndex((p) => p.id === piece.id);
      G.pieces[index].position = position;
    },
  },
};

export default Game;
function isEven(row: number) {
  throw new Error('Function not implemented.');
}
