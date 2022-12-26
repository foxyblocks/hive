import { Grid as HexGrid, rectangle, Hex } from 'honeycomb-grid';
import type { BoardProps } from 'boardgame.io/react';
import { HiveGameState, colorForPlayer, isCurrentPlayer, allValidMoves } from './Game';
import { PieceKind, Piece, Player, Position } from './types';
import {
  Box,
  Center,
  chakra,
  Flex,
  Grid,
  Heading,
  Square,
  Text,
  useBoolean,
} from '@chakra-ui/react';
import { ReactNode, useMemo, useState } from 'react';
import { Tile } from './lib/HexGrid';
import { positionFromTile } from './lib/makePosition';

const GRID_SIZE = 9;
const EMOJIS = {
  [PieceKind.QUEEN]: '👑',
  [PieceKind.BEETLE]: '🐞',
  [PieceKind.GRASSHOPPER]: '🦗',
  [PieceKind.SPIDER]: '🕷',
  [PieceKind.ANT]: '🐜',
};

function Hexagon({
  fill,
  stroke,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isInteractive,
}: {
  fill: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  stroke?: string;
  isInteractive?: boolean;
}) {
  return (
    <chakra.svg width="100%" height="100%" viewBox="0 0 300 300" display="block">
      <chakra.polygon
        stroke={stroke ?? '#ddd'}
        strokeWidth={3}
        fill={fill}
        points="300,150 225,280 75,280 0,150 75,20 225,20"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        pointerEvents={isInteractive ? 'all' : 'none'}
        cursor={isInteractive ? 'pointer' : 'default'}
      ></chakra.polygon>
    </chakra.svg>
  );
}

function BoardPosition({ position, children }: { position: Position; children: ReactNode }) {
  const tile = useMemo(() => new Tile(position), [position]);

  const { x, y } = tile.center;
  const xOffset = x * GRID_SIZE * -0.52;
  const yOffset = y * GRID_SIZE * -0.52;
  return (
    <Center
      className="BoardPosition"
      w={`${GRID_SIZE}vmax`}
      h={`${GRID_SIZE}vmax`}
      pos="absolute"
      top={`${yOffset}vmax`}
      left={`${xOffset}vmax`}
      transform="translate(-50%, -50%)"
      display={'grid'}
      gridTemplateRows={'1fr'}
      gridTemplateColumns={'1fr'}
      placeContent={'center'}
      pointerEvents="all"
      zIndex={position.layer ? position.layer + 1 : 0}
    >
      {children}
    </Center>
  );
}

interface BoardBgSpaceProps {
  position: Position;
}
function BoardBgSpace({ position }: BoardBgSpaceProps) {
  return (
    <BoardPosition position={position}>
      <Hexagon fill="#efefef" />
      <Center position={'absolute'} width="100%" height="100%">
        <Text>
          {Math.round(position.q)}, {Math.round(position.r)}
        </Text>
      </Center>
    </BoardPosition>
  );
}

interface BoardTargetSpaceProps {
  position: Position;
  isSelectable?: boolean;
  onSelect?: (pos: Position) => void;
}
function BoardTargetSpace({ position, isSelectable, onSelect }: BoardTargetSpaceProps) {
  const [isHovered, setIsHovered] = useState(false);
  function handleSelect() {
    onSelect && isSelectable && onSelect(position);
  }

  const strokeColor = isSelectable ? (isHovered ? 'black' : 'blue') : undefined;
  return (
    <BoardPosition position={position}>
      <Hexagon
        fill="transparent"
        stroke={strokeColor}
        onClick={handleSelect}
        isInteractive={isSelectable}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </BoardPosition>
  );
}

interface PlayerPieceProps {
  piece: Piece;
  isSelected?: boolean;
  isInteractive?: boolean;
  onSelect?: () => void;
}
function PlayerPiece({ piece, isSelected, onSelect, isInteractive }: PlayerPieceProps) {
  const [isHovered, setIsHovered] = useBoolean(false);
  const layer = piece.position?.layer ?? 0;
  return (
    <Box
      className="PlayerPiece"
      width="100%"
      height="100%"
      display="grid"
      gridTemplateColumns="1fr"
      gridTemplateRows="1fr"
      onClick={onSelect}
      pointerEvents={isInteractive ? 'all' : 'none'}
      onMouseEnter={setIsHovered.on}
      onMouseLeave={setIsHovered.off}
      transform={`translate(${layer * 5}%, ${layer * 5}%)`}
    >
      <Box gridRow={1} gridColumn={1}>
        <Hexagon
          fill={isSelected ? 'blue' : colorForPlayer(piece.player)}
          isInteractive={isInteractive}
          stroke={isHovered ? 'blue' : undefined}
        />
      </Box>
      <Box
        gridRow={1}
        gridColumn={1}
        display="grid"
        placeContent={'center'}
        fontSize="calc(2rem * 100vmax)"
        pointerEvents="none"
      >
        {EMOJIS[piece.kind]}
      </Box>
    </Box>
  );
}

interface HiveBoardProps extends BoardProps<HiveGameState> {
  // Additional custom properties for your component
}

const emptyGridBoard = new HexGrid(
  Tile,
  rectangle({ width: 16, height: 14, start: { col: -7, row: -7 } }),
);

export default function Board(props: HiveBoardProps) {
  const [selectedPieceId, setSelectedPieceId] = useState<string | undefined>(undefined);

  const selectedPiece = useMemo(
    () => props.G.pieces.find((piece) => piece.id === selectedPieceId),
    [selectedPieceId, props.G],
  );

  const piecesOnBoard = props.G.pieces.filter((piece) => piece.position !== undefined);
  const currentPlayer = isCurrentPlayer(Player.WHITE, props.ctx) ? Player.WHITE : Player.BLACK;
  const piecesInCurrentPlayerBag = props.G.pieces.filter(
    (piece) => piece.position === undefined && piece.player === currentPlayer,
  );
  const piecesInOppositePlayerBat = props.G.pieces.filter(
    (piece) => piece.position === undefined && piece.player !== currentPlayer,
  );

  const isPlacingFirstPiece = piecesOnBoard.length === 0;

  function handleSelectSpace(pos: Position) {
    if (selectedPieceId === undefined) {
      return;
    }

    const piece = props.G.pieces.find((piece) => piece.id === selectedPieceId);

    props.moves.movePiece(piece, pos);
    setSelectedPieceId(undefined);
  }

  const validPositionsForSelectedPiece = useMemo(() => {
    if (!selectedPiece) {
      return [];
    }
    return allValidMoves(selectedPiece, props.G, props.ctx).toArray();
  }, [selectedPiece, props.G, props.ctx]);

  return (
    <Grid
      width="100vw"
      height="100vh"
      position={'relative'}
      gridTemplateRows="auto 1fr auto"
      bgColor="gray.50"
    >
      <Box
        className="Layers"
        position="absolute"
        top="50%"
        left={'50%'}
        width="100%"
        height={'100%'}
      >
        <Box
          className="BgSpaces"
          position="absolute"
          width="100%"
          height={'100%'}
          pointerEvents="none"
        >
          {emptyGridBoard.toArray().map((hex) => (
            <BoardBgSpace key={hex.toString()} position={positionFromTile(hex)} />
          ))}
        </Box>
        <Box className="PlayerPieces" width="100%" height={'100%'} pointerEvents="none">
          {piecesOnBoard.map((piece) => (
            <BoardPosition key={piece.id} position={piece.position!}>
              <PlayerPiece
                key={piece.id}
                piece={piece}
                isInteractive={piece.player === props.ctx.currentPlayer}
                isSelected={selectedPieceId === piece.id}
                onSelect={() => setSelectedPieceId(piece.id)}
              />
            </BoardPosition>
          ))}
        </Box>
        {selectedPieceId && (
          <Box
            className="TargetSpaces"
            position="absolute"
            left={0}
            top={0}
            width="100%"
            height={'100%'}
          >
            {validPositionsForSelectedPiece.map((hex) => (
              <BoardTargetSpace
                key={hex.toString()}
                position={positionFromTile(hex)}
                isSelectable
                onSelect={handleSelectSpace}
              />
            ))}
          </Box>
        )}
      </Box>
      {[Player.BLACK, Player.WHITE].map((player) => {
        const playerIsCurrent = player === props.ctx.currentPlayer;
        const bag = playerIsCurrent ? piecesInCurrentPlayerBag : piecesInOppositePlayerBat;
        const playerName = player === Player.BLACK ? 'Black' : 'White';
        return (
          <Flex
            className="PlayerBag"
            key={player}
            pos="absolute"
            paddingX={6}
            paddingY={4}
            background="white"
            flexDirection={'column'}
            boxShadow="md"
            zIndex={10}
            border="1px solid black"
            bottom={playerIsCurrent ? '0' : 'unset'}
            top={playerIsCurrent ? 'unset' : '0'}
          >
            {playerIsCurrent && (
              <Heading size="md" textAlign={'center'}>
                {playerName}
                {"'"}s Turn
              </Heading>
            )}
            <Flex gap={1}>
              {bag.map((piece, i) => (
                <Square key={piece.id} size="5vmax">
                  <PlayerPiece
                    key={i}
                    piece={piece}
                    isInteractive={playerIsCurrent}
                    isSelected={selectedPieceId === piece.id}
                    onSelect={() => setSelectedPieceId(piece.id)}
                  />
                </Square>
              ))}
            </Flex>
          </Flex>
        );
      })}
    </Grid>
  );
}
