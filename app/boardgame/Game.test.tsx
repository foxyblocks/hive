import { Client } from 'boardgame.io/client';
import Game, { colorForPlayer, HiveGameState, isValidMove, makePiece } from './Game';
import { Direction, Piece, PieceKind, Player, Position } from './types';
import makePosition, { makeRelativePosition } from './lib/makePosition';
import { makeGrid } from './lib/HexGrid';

type move = [piece: Piece, position: Position];

function testGame(startingPositions: move[] = []) {
  const client = Client<HiveGameState>({
    game: Game,
  });

  function getPiece(piece: Piece) {
    const state = client.getState()!;
    return state.G.pieces.find((p) => p.id === piece.id);
  }

  function doMoves(moves: move[]) {
    const state = client.getState()!;
    moves.forEach((move, index) => {
      const piece = state.G.pieces.find((p) => p.id === move[0].id);
      if (!checkMove(piece!, move[1])) {
        throw `INVALID MOVE at index ${index}: {${move[0].id},  ${move[1].q}, ${move[1].r}}`;
      }
      client.moves.movePiece(piece!, move[1]);
    });
    return api;
  }

  function checkMove(piece: Piece, position: Position) {
    const { G, ctx } = client.getState()!;
    return isValidMove(getPiece(piece)!, position, G, ctx);
  }

  const api = {
    client,
    getPiece,
    doMoves,
    isValidMove: checkMove,
  };

  doMoves(startingPositions);

  return api;
}

describe('colorForPlayer()', () => {
  test('it gets a valid css color for each player', () => {
    expect(colorForPlayer(Player.WHITE)).toBe('white');
    expect(colorForPlayer(Player.BLACK)).toBe('black');
  });
});

describe('Game', () => {
  describe('moves', () => {
    describe('movePiece', () => {
      test('it puts the piece on the board', () => {
        const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
        const game = testGame();
        const firstPosition = makePosition({ r: 0, q: 0 });
        game.doMoves([[whiteQueen, firstPosition]]);

        // const { G, ctx } = (client.store.getState() as HiveGameState);
        expect(game.getPiece(whiteQueen)?.position).toEqual(firstPosition);
      });
    });
  });
});

describe('isValidMove', () => {
  describe('placing a piece', () => {
    test('returns true if the board is empty', () => {
      const piece = makePiece(PieceKind.QUEEN, Player.WHITE);
      const space = makePosition({ r: 0, q: 0 });
      expect(testGame().isValidMove(piece, space)).toBe(true);
    });
    test('returns false if a piece is already in the given position', () => {
      const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
      const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
      const position = { r: 0, q: 0 };
      const game = testGame().doMoves([[whiteQueen, position]]);

      expect(game.isValidMove(blackQueen, position)).toBe(false);
    });
  });
  describe('moving a piece', () => {
    const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
    const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
    const whiteAnt = makePiece(PieceKind.ANT, Player.WHITE);
    const blackAnt = makePiece(PieceKind.ANT, Player.BLACK);

    const firstPosition = makePosition({ r: 0, q: 0 });
    const topNeighbor = makeRelativePosition(firstPosition, Direction.N);
    const bottomNeighbor = makeRelativePosition(firstPosition, Direction.S);
    const topRightNeighbor = makeRelativePosition(firstPosition, Direction.NE);
    const client = Client<HiveGameState>({
      game: Game,
    });
    beforeEach(() => {
      client.reset();
      /*
       *  B-Q
       *   |
       *  W-Q
       */
      client.moves.movePiece(whiteQueen, firstPosition);
      client.moves.movePiece(blackQueen, topNeighbor);
    });
    test('it allows moving a piece next to an opponent', () => {
      /*
       * B-Q
       *  | W-Q
       *
       */
      const state = client.getState()!;
      const pieceToMove = state.G.pieces.find((p) => p.id === whiteQueen.id)!;

      expect(
        isValidMove(pieceToMove, topRightNeighbor, client.getState()!.G, client.getState()!.ctx),
      ).toBe(true);
    });
    test('does not allow the creation of two hives', () => {
      client.moves.movePiece(whiteAnt, bottomNeighbor);
      client.moves.movePiece(blackAnt, topNeighbor);
      const state = client.getState()!;
      const pieceToMove = state.G.pieces.find((p) => p.id === whiteQueen.id)!;

      expect(isValidMove(pieceToMove, topRightNeighbor, state!.G, state!.ctx)).toBe(false);
    });
  });
  describe('second turn', () => {
    test('must touch the opponent piece when placing second piece', () => {
      const grid = makeGrid();
      const client = Client<HiveGameState>({
        game: Game,
      });
      const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
      const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);

      const firstPosition = makePosition({ r: 0, q: 0 });
      client.moves.movePiece(whiteQueen, firstPosition);

      const topNeighbor = makeRelativePosition(firstPosition, Direction.N);
      const farPosition = makeRelativePosition(topNeighbor, Direction.N);
      const state = client.getState()!;
      expect(isValidMove(blackQueen, farPosition, state.G, state.ctx)).toBe(false);
      expect(isValidMove(blackQueen, topNeighbor, state.G, state.ctx)).toBe(true);
    });
  });

  describe('third turn plus', () => {
    const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
    const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
    const whiteAnt = makePiece(PieceKind.ANT, Player.WHITE);

    const firstPosition = makePosition({ r: 0, q: 0 });
    const topNeighbor = makeRelativePosition(firstPosition, Direction.N);
    const nextTopNeighbor = makeRelativePosition(topNeighbor, Direction.N);
    const bottomNeighbor = makeRelativePosition(firstPosition, Direction.S);
    const nextBottomNeighbor = makeRelativePosition(bottomNeighbor, Direction.S);
    const client = Client<HiveGameState>({
      game: Game,
    });
    beforeEach(() => {
      client.reset();
      client.moves.movePiece(whiteQueen, firstPosition);
      client.moves.movePiece(blackQueen, topNeighbor);
    });

    test('is invalid if touching an opponent when placing', () => {
      const state = client.getState()!;
      expect(isValidMove(whiteAnt, nextTopNeighbor, state.G, state.ctx)).toBe(false);
    });
    test('is invalid if not adjacent a piece at all', () => {
      const state = client.getState()!;
      expect(isValidMove(whiteAnt, nextBottomNeighbor, state.G, state.ctx)).toBe(false);
    });
    test('is valid if touching own piece', () => {
      const state = client.getState()!;
      expect(isValidMove(whiteAnt, bottomNeighbor, state.G, state.ctx)).toBe(true);
    });
  });
  describe('fourth turn', () => {
    const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
    const whiteBeetle = makePiece(PieceKind.BEETLE, Player.WHITE, 1);
    // make three white ants
    const whiteAnts = Array.from({ length: 3 }, (_, i) =>
      makePiece(PieceKind.ANT, Player.WHITE, i + 1),
    );
    // make 3 black ants
    const blackAnts = Array.from({ length: 3 }, (_, i) =>
      makePiece(PieceKind.ANT, Player.BLACK, i + 1),
    );

    const client = Client<HiveGameState>({
      game: Game,
    });
    beforeEach(() => {
      client.reset();
      client.moves.movePiece(whiteAnts[0], { row: 0, col: 0 });
      client.moves.movePiece(blackAnts[0], { row: -1, col: 0 });
      client.moves.movePiece(whiteAnts[1], { row: 1, col: 0 });
      client.moves.movePiece(blackAnts[1], { row: -2, col: 0 });
    });

    it('is inValid if not placing the queen and she isnt on the board yet', () => {
      client.moves.movePiece(whiteAnts[2], { row: 2, col: 0 });
      client.moves.movePiece(blackAnts[2], { row: -3, col: 0 });
      const { G, ctx } = client.getState()!;
      const nextMove = makePosition({ r: 3, q: 0 });
      expect(Math.round(ctx.turn! / 2)).toBe(4);
      expect(isValidMove(whiteBeetle, nextMove, G, ctx)).toBe(false);
    });
    it('is valid if not placing the queen and she is on the board', () => {
      client.moves.movePiece(whiteQueen, { row: 2, col: 0 });
      client.moves.movePiece(blackAnts[2], { row: -3, col: 0 });
      const { G, ctx } = client.getState()!;
      const nextMove = makePosition({ r: 3, q: 0 });
      expect(Math.round(ctx.turn! / 2)).toBe(4);
      expect(isValidMove(whiteBeetle, nextMove, G, ctx)).toBe(true);
    });
  });
  describe('queen', () => {
    const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
    const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
    const firstPosition = makePosition({ r: 0, q: 0 });
    const topNeighbor = makeRelativePosition(firstPosition, Direction.N);
    const client = Client<HiveGameState>({
      game: Game,
    });
    beforeEach(() => {
      client.reset();
      /*
        *  B-Q
          \____/
         / --- \
        *  W-Q
        */
      client.moves.movePiece(whiteQueen, firstPosition);
      client.moves.movePiece(blackQueen, topNeighbor);
    });
    test('returns false if the position is more than 1 space away from current position', () => {
      /* . ___  W-Q
       * B-Q \\ _ /
       *
       */
      const targetPosition = makeRelativePosition(topNeighbor, Direction.N);
      const state = client.getState()!;
      const pieceToMove = state.G.pieces.find((p) => p.id === whiteQueen.id)!;

      expect(
        isValidMove(pieceToMove, targetPosition, client.getState()!.G, client.getState()!.ctx),
      ).toBe(false);
    });
  });
  describe('ant', () => {
    test('returns true if the position is more than 1 space away', () => {
      const whiteAnt = makePiece(PieceKind.ANT, Player.WHITE, 1);
      const blackAnt = makePiece(PieceKind.ANT, Player.BLACK, 1);

      const game = testGame();
      game.doMoves([
        // put white ant in the middle
        [whiteAnt, { r: 0, q: 0 }],
        // put black ant on top
        [blackAnt, { r: 1, q: 0 }],
      ]);

      // run white round the the board to the top
      expect(game.isValidMove(whiteAnt, { r: 2, q: 0 })).toBe(true);
    });
  });

  describe('beetle', () => {
    test('allows climbing on opponent pieces', () => {
      const whiteBeetle = makePiece(PieceKind.BEETLE, Player.WHITE, 1);
      const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
      const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);

      const game = testGame();
      game.doMoves([
        // put white ant in the middle
        [whiteQueen, { q: 0, r: 0 }],
        // put black queen to the north
        [blackQueen, { q: 0, r: -1 }],
        // put white beetle to the south west
        [whiteBeetle, { q: -1, r: 1 }],
        // move black queen to the south west
        [blackQueen, { q: -1, r: 0 }],
      ]);

      // move white beetle on top of black queen
      expect(game.isValidMove(whiteBeetle, { q: -1, r: 0 })).toBe(true);
    });

    test('it allows climbing on own pieces', () => {
      const whiteBeetle = makePiece(PieceKind.BEETLE, Player.WHITE, 1);
      const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
      const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);

      const game = testGame();
      game.doMoves([
        // put white ant in the middle
        [whiteQueen, { q: 0, r: 0 }],
        // put black queen to the north
        [blackQueen, { q: 0, r: -1 }],
        // put white beetle to the south west
        [whiteBeetle, { q: -1, r: 1 }],
        // move black queen to the south west
        [blackQueen, { q: -1, r: 0 }],
      ]);

      // move white beetle on top of white queen
      expect(game.isValidMove(whiteBeetle, game.getPiece(whiteQueen)?.position!)).toBe(true);
    });
  });

  test.todo('grasshopper');
  test.todo('spider');

  test.todo('freedom to move');
});
