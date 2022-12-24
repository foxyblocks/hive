import { Direction, Position } from "../types";

export default function makePosition(position: Partial<Position>): Position {
  return {
    column: 0,
    row: 1,
    layer: 0,
    ...position
  }
}


export function makeRelativePosition(firstPosition: Position, direction: Direction, relativeLayer = 0): Position {
  let { column, row, layer } = firstPosition;

  switch(direction) {
    case Direction.TOP:
      row -= 2;
      break;
    case Direction.BOTTOM:
      row += 2;
      break;
    case Direction.TOP_LEFT:
      row -= 1;
      column -= 1;
      break;
    case Direction.TOP_RIGHT:
      row -= 1;
      column += 1;
      break;
    case Direction.BOTTOM_LEFT:
      row += 1;
      column -= 1;
      break;
    case Direction.BOTTOM_RIGHT:
      row += 1;
      column += 1;
      break;
  }

  return {
    column,
    row,
    layer: layer + relativeLayer,
  }
}