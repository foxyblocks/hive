import { Direction } from "honeycomb-grid";

export {Direction};

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

// Uses the axial coordinate system. See https://www.redblobgames.com/grids/hexagons-v1/#coordinates-axial
export type Position = {
  r: number; // row: can be 0 or positive or negative
  q: number; // column: can be 0 or positive or negative
  layer?: number; // How high stacked is this piece can be 0 or positive. If not present is assumed to be 0
};
