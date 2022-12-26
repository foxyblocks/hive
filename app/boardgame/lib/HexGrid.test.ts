import { Direction } from "honeycomb-grid"
import { makeBufferGrid, makeGrid, Tile } from "./HexGrid"

describe("HexGrid", () => {
  describe('makeBufferGrid', () => {
    test('it makes a buffer from a 1x1 grid', () => {
      const grid = makeGrid()
      const startingHex = grid.createHex({ q: 0, r: 0});
      grid.setHexes([startingHex]);

      const bufferGrid = makeBufferGrid(grid);
      expect(bufferGrid.size).toEqual(6);
      expect(bufferGrid.hasHex(grid.createHex([0, -1]))).toEqual(true);
      expect(bufferGrid.hasHex(grid.createHex([1, -1]))).toEqual(true);
      expect(bufferGrid.hasHex(grid.createHex([1, 0]))).toEqual(true);
      expect(bufferGrid.hasHex(grid.createHex([0, 1]))).toEqual(true);
      expect(bufferGrid.hasHex(grid.createHex([-1, 0]))).toEqual(true);
      expect(bufferGrid.hasHex(grid.createHex([-1, 1]))).toEqual(true);
    })
    test('it makes a buffer from a 1x2 grid', () => {
      const grid = makeGrid()
      const startingHex = grid.createHex([0, 0]);
      const topNeighbor = grid.neighborOf(startingHex, Direction.N);
      grid.setHexes([startingHex, topNeighbor]);

      const bufferGrid = makeBufferGrid(grid);
      expect(bufferGrid.size).toEqual(8);
      expect(bufferGrid.hasHex(startingHex)).toEqual(false);
      expect(bufferGrid.hasHex(topNeighbor)).toEqual(false);
    })
  })
  describe('includingOriginal option is true', () => {
    test('it makes a buffer from with original hexes', () => {
      const grid = makeGrid()
      const startingHex = grid.createHex([0, 0]);
      const topNeighbor = grid.neighborOf(startingHex, Direction.N);
      grid.setHexes([startingHex, topNeighbor]);

      const bufferGrid = makeBufferGrid(grid, true);
      expect(bufferGrid.size).toEqual(10);
      expect(bufferGrid.hasHex(startingHex)).toEqual(true);
      expect(bufferGrid.hasHex(topNeighbor)).toEqual(true);
    });
  })
})