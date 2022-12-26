import { defineHex, Grid, rectangle, Orientation, HexCoordinates, Hex, spiral, ring, line, Direction } from 'honeycomb-grid'

export class Tile extends defineHex({ dimensions: 1, orientation: Orientation.FLAT }) {

}

export function makeRectangleGrid(width: number, height: number) {
  return new Grid(Tile, rectangle({ width, height }));
}

export function makeGrid(coordinates: HexCoordinates[] = []) {
  return new Grid(Tile, coordinates);
}

// singleton grid class
export const HexGrid = new Grid(Tile);

export function allNeighbors(hex: Hex) {
  return new Grid(Tile, ring({ center: hex, radius: 1 }))
}

export function intersectGrids(grid1: typeof HexGrid, grid2: typeof HexGrid) {
  return grid1.filter(hex => grid2.hasHex(hex))
}

export function subtractGrids(grid1: typeof HexGrid, grid2: typeof HexGrid) {
  return grid1.filter(hex => !grid2.hasHex(hex))
}

/*
 *  for a given Grid will return a new Grid that is the tiles adjacent to all tiles in the given Grid.
 *  Does not include the tiles in the starting Grid.
 */
export function makeBufferGrid(firstGrid: typeof HexGrid, includeOriginal = false): typeof HexGrid {
  const newHexes: Hex[] = [];

  firstGrid.forEach((hex: Hex) => {
    const neighbors = allNeighbors(hex);
    neighbors.forEach(neighbor => {
      if (!firstGrid.hasHex(neighbor)) {
        newHexes.push(neighbor)
      }
    });
    if (includeOriginal) {
      newHexes.push(hex)
    }
  });

  return new Grid(Tile, newHexes);
}
