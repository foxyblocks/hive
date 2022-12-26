import { Hex } from "honeycomb-grid";
import { Direction, Position } from "../types";
import { makeGrid } from "./HexGrid";

export default function makePosition(position: Partial<Position>): Position {
  return {
    q: 0,
    r: 0,
    layer: 0,
    ...position
  }
}


export function makeRelativePosition(firstPosition: Position, direction: Direction, relativeLayer = 0): Position {
  const hex =  makeGrid().neighborOf(makeGrid().createHex(firstPosition), direction)

  return {
    q: hex.col,
    r: hex.row,
    layer: (firstPosition.layer || 0) + relativeLayer,
  }
}

export function positionFromTile(tile: Hex): Position {
  return {
    q: tile.q,
    r: tile.r,
    layer: 0,
  }
}