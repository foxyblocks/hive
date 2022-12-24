import { Position } from "../types";

function isOdd(num: number) {
  return Math.abs(num) % 2 === 1;
}

function isEven(num: number) {
  return Math.abs(num) % 2 === 0;
}


export function isValidGridSpace(position: Position) {
  const { column, row } = position;
  if (isOdd(column) && isOdd(row)) {
    return false;
  }
  if (isEven(column) && isEven(row)) {
    return false;
  }
  return true;
}


// Check if two hexagonal cells are adjacent
export function isAdjacent(
  a: Position,
  b: Position
): boolean {
  const { column: col1, row: row1 } = a;
  const { column: col2, row: row2 } = b;

  if (!isValidGridSpace(a) || !isValidGridSpace(b)) {
    // invalid position
    return false;
  }

  if (col1 === col2 && row1 === row2) {
    return false;
  }

  if (col1 === col2) {
    return Math.abs(row1 - row2) === 2;
  }

  if (row1 === row2) {
    return Math.abs(col1 - col2) === 1;
  }

  return Math.abs(col1 - col2) === 1 && Math.abs(row1 - row2) === 1;
}