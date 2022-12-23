import { Client } from 'boardgame.io/client';
import Game, { colorForPlayer, HiveGameState, makePiece, PieceKind, Player } from './Game';

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
