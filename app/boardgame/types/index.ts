export enum Direction {
  TOP = 'TOP',
  TOP_RIGHT = 'TOP_RIGHT',
  TOP_LEFT = 'TOP_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM = 'BOTTOM',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
}

export enum Player {
  'WHITE' = '0',
  'BLACK' = '1',
}

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
