import { isAdjacent } from "./isAdjacent"
import makePosition from "./makePosition"



const startingCell = makePosition({ column: 1, row: 0, })

describe('isAdjacent', () => {
  test('topNeighbor', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 1, row: -2, }))).toBe(true)
  })
  test('bottomNeighbor', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 1, row: 2, }))).toBe(true)
  })
  test('topRightNeighbor', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 2, row: -1 }))).toBe(true)
  })
  test('topLeftNeighbor', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 0, row: -1 }))).toBe(true)
  })
  test('bottomLeftNeighbor', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 0, row: 1 }))).toBe(true)
  })
  test('bottomRightNeighbor', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 2, row: 1 }))).toBe(true)
  })
  test('topRightNext', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 3, row: -2 }))).toBe(false)
  })
  test('topLeftNext', () => {
    expect(isAdjacent(startingCell, makePosition({ column: -1, row: -2 }))).toBe(false)
  })
  test('bottomNext', () => {
    expect(isAdjacent(startingCell, makePosition({ column: 1, row: 3 }))).toBe(false)
  })
})