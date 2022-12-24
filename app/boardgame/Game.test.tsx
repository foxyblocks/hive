import { Client } from 'boardgame.io/client';
import Game, { colorForPlayer, HiveGameState, isValidMove, makePiece } from './Game';
import { Direction, PieceKind, Player } from './types';
import makePosition, { makeRelativePosition } from './lib/makePosition';

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
        const client = Client<HiveGameState>({
          game: Game,
        });

        const piece = makePiece(PieceKind.QUEEN, Player.WHITE);
        const position = { row: 0, column: 1, layer: 0 };

        client.moves.movePiece(piece, position);
        const state = client.getState()!;
        const statePiece = state.G.pieces.find((p) => p.id === piece.id);

        // const { G, ctx } = (client.store.getState() as HiveGameState);
        expect(statePiece?.position).toEqual(position);
      });
    });
  });
});

describe('isValidMove', () => {
  describe('placing a piece', () => {
    test('returns true if the board is empty', () => {
      const client = Client<HiveGameState>({
        game: Game,
      });
      const piece = makePiece(PieceKind.QUEEN, Player.WHITE);
      const space = makePosition({ row: 0, column: 1 });
      const state = client.getState()!;
      expect(isValidMove(piece, space, state.G, state.ctx)).toBe(true);
    });
  });
  test('returns false if a piece is already in the given position', () => {
    const client = Client<HiveGameState>({
      game: Game,
    });
    const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
    const position = { row: 0, column: 1, layer: 0 };
    client.moves.movePiece(whiteQueen, position);
    const piece = makePiece(PieceKind.QUEEN, Player.BLACK);
    const state = client.getState()!;

    expect(isValidMove(piece, position, state.G, state.ctx)).toBe(false);
  });
  describe('second turn', () => {
    test('placing a new piece on the board without touching opponent one', () => {
      const client = Client<HiveGameState>({
        game: Game,
      });
      const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
      const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);

      const firstPosition = { row: 0, column: 1, layer: 0 };
      client.moves.movePiece(whiteQueen, firstPosition);

      const farPosition = { row: 3, column: 1, layer: 0 };
      const topNeighbor = { row: -2, column: 1, layer: 0 };
      const state = client.getState()!;
      expect(isValidMove(blackQueen, farPosition, state.G, state.ctx)).toBe(false);
      expect(isValidMove(blackQueen, topNeighbor, state.G, state.ctx)).toBe(true);
    });
  });

  describe('third turn plus', () => {
    const whiteQueen = makePiece(PieceKind.QUEEN, Player.WHITE);
    const blackQueen = makePiece(PieceKind.QUEEN, Player.BLACK);
    const whiteAnt = makePiece(PieceKind.ANT, Player.WHITE);

    const firstPosition = makePosition({ row: 0, column: 1 });
    const topNeighbor = makeRelativePosition(firstPosition, Direction.TOP);
    const nextTopNeighbor = makeRelativePosition(topNeighbor, Direction.TOP);
    const bottomNeighbor = makeRelativePosition(firstPosition, Direction.BOTTOM);
    const nextBottomNeighbor = makeRelativePosition(bottomNeighbor, Direction.BOTTOM);
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
    // const whiteAnt = makePiece(PieceKind.QUEEN, Player.WHITE);
    // const blackAnt = makePiece(PieceKind.QUEEN, Player.BLACK);
    // const whiteAnt = makePiece(PieceKind.ANT, Player.WHITE);

    // const firstPosition = makePosition({ row: 0, column: 1 });
    // const topNeighbor = makeRelativePosition(firstPosition, Direction.TOP);
    // const nextTopNeighbor = makeRelativePosition(topNeighbor, Direction.TOP);
    // const bottomNeighbor = makeRelativePosition(firstPosition, Direction.BOTTOM);
    // const nextBottomNeighbor = makeRelativePosition(bottomNeighbor, Direction.BOTTOM);
    // const client = Client<HiveGameState>({
    //   game: Game,
    // });
    // beforeEach(() => {
    //   client.reset();
    //   client.moves.movePiece(whiteQueen, firstPosition);
    //   client.moves.movePiece(blackQueen, topNeighbor);
    // });

    it('is inValid if not placing the queen and she isnt on the board yet', () => {});
    it('is valid if not placing the queen and she is on the board', () => {});
  });
  describe('queen', () => {
    test.todo('returns false if the position is more than 1 space away from current position');
  });
  describe('ant', () => {
    test.todo('returns true if the position is more than 1 space away');
  });

  describe('beetle', () => {
    test.todo('returns true if a piece is already in the given position');
  });
  test.todo('grasshopper');
  test.todo('spider');
});
