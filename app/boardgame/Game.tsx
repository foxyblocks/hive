import { aStar } from 'abstract-astar';
import type { Game, Move, Ctx, State } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { ring } from 'honeycomb-grid';
import {
  HexGrid,
  Tile,
  makeGrid,
  makeBufferGrid,
  intersectGrids,
  allNeighbors,
  subtractGrids,
} from './lib/HexGrid';
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

// Converts a game turn to a player turn
export function playerTurn(player: Player, turn: number) {
  return Math.round(turn / 2);
}

export function allValidMoves(piece: Piece, state: HiveGameState, ctx: Ctx): typeof HexGrid {
  if (ctx.turn === 1) {
    // just return the center square
    return makeGrid([{ row: 0, col: 0 }]);
  }

  const piecesOnBoard = state.pieces.filter((p) => !!p.position);
  const opponentPositions = piecesOnBoard
    .filter((p) => p.player !== piece.player)
    .map((p) => p.position!);
  const ownPositions = piecesOnBoard
    .filter((p) => p.player === piece.player)
    .map((p) => p.position!);

  const existingPositions = [...opponentPositions, ...ownPositions];

  const HiveGrid = makeGrid(existingPositions);
  const opponentGrid = makeGrid(opponentPositions);
  const ownGrid = makeGrid(ownPositions);
  const bufferGrid = makeBufferGrid(HiveGrid, true);
  const borderGrid = makeBufferGrid(HiveGrid, false);

  // second player's first turn, must place a piece adjacent to the first piece
  if (ctx.turn === 2) {
    return borderGrid;
  }

  // this is the either player's fourth turn
  if (playerTurn(piece.player, ctx.turn) === 4) {
    const ownQueenIsOnBoard = piecesOnBoard.find(
      (p) => p.player === piece.player && p.kind === PieceKind.QUEEN,
    );
    if (!ownQueenIsOnBoard && piece.kind != PieceKind.QUEEN) {
      // empty grid, this move is invalid
      return makeGrid();
    }
  }

  // Placing a piece, just make sure it's adjacent to something and not adjacent to the opponent
  if (ctx.turn >= 3 && !piece.position) {
    const opponentBufferGrid = makeBufferGrid(opponentGrid);
    return subtractGrids(borderGrid, opponentBufferGrid);
  }

  let validMoves = bufferGrid;

  // TODO: check for piece specific rules here!

  if (piece.kind !== PieceKind.BEETLE) {
    // filter out existing positions grid
    validMoves = borderGrid;
  }

  if (piece.kind === PieceKind.QUEEN || piece.kind === PieceKind.BEETLE) {
    // filter moves to only those that are one space away
    validMoves = intersectGrids(validMoves, allNeighbors(new Tile(piece.position!)));
  }

  if (piece.position) {
    // this is a normal move, check for two hive rule
    const anotherPiecePosition = piecesOnBoard.filter((p) => p.id !== piece.id)[0].position!;
    validMoves = validMoves.filter((hex) => {
      const newHiveGrid = makeGrid(
        piecesOnBoard.map((p) => (p.id === piece.id ? hex : p.position!)),
      );
      const startingPosition = new Tile(anotherPiecePosition);
      const hexesOfOtherPieces = newHiveGrid.filter((hex) => !hex.equals(startingPosition));

      const isOneHive = hexesOfOtherPieces.toArray().every((hex) => {
        const shortestPath = aStar<Tile>({
          start: startingPosition,
          goal: hex,
          estimateFromNodeToGoal: (tile) => newHiveGrid.distance(tile, hex),
          neighborsAdjacentToNode: (center) =>
            newHiveGrid.traverse(ring({ center, radius: 1 })).toArray(),
          actualCostToMove: (_, __, tile) => 1,
        });
        return !!shortestPath;
      });
      return isOneHive;
    });
  }

  return validMoves;
}

export function isValidMove(
  piece: Piece,
  position: Position,
  state: HiveGameState,
  ctx: Ctx,
): boolean {
  const hex = new Tile(position);
  return allValidMoves(piece, state, ctx).hasHex(new Tile(position));
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
