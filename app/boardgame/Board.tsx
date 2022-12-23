import type { BoardProps } from 'boardgame.io/react';
import {
  HiveGameState,
  PieceKind,
  Piece,
  Position,
  colorForPlayer,
  Player,
  isCurrentPlayer,
  makeBoard,
} from './Game';
import { Box, chakra, Flex, Grid, Heading, Square, Text, useBoolean } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';

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
        cursor={isInteractive ? 'pointer' : 'default'}
      ></chakra.polygon>
    </chakra.svg>
  );
}

function BoardPosition({ position, children }: { position: Position; children: ReactNode }) {
  const xOffset = position.column * ((GRID_SIZE / 10) * 7.8);
  const yOffset = position.row * ((GRID_SIZE / 10) * 4.5);
  return (
    <Box
      w={`${GRID_SIZE}vmax`}
      h={`${GRID_SIZE}vmax`}
      pos="absolute"
      top={`calc(50% + ${yOffset}vmax)`}
      left={`calc(50% + ${xOffset}vmax)`}
      transform="translate(-50%, -50%)"
      display={'grid'}
      gridTemplateRows={'1fr'}
      gridTemplateColumns={'1fr'}
      placeContent={'center'}
      pointerEvents="all"
    >
      {children}
    </Box>
  );
}

interface BoardSpaceProps {
  position: Position;
  isInteractive?: boolean;
  onSelect?: (pos: Position) => void;
}

function EmptyBoardSpace({ position, isInteractive, onSelect }: BoardSpaceProps) {
  const [isHovered, setIsHovered] = useState(false);
  function handleSelect() {
    onSelect && isInteractive && onSelect(position);
  }
  return (
    <BoardPosition position={position}>
      <Hexagon
        fill="#efefef"
        stroke={isHovered ? '#ccc' : undefined}
        onClick={handleSelect}
        isInteractive={isInteractive}
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

export default function Board(props: HiveBoardProps) {
  const [selectedPiece, setSelectedPiece] = useState<number | undefined>(undefined);

  const boardLayer = makeBoard();

  const piecesOnBoard = props.G.pieces.filter((piece) => piece.position !== undefined);
  const currentPlayer = isCurrentPlayer(Player.WHITE, props.ctx) ? Player.WHITE : Player.BLACK;
  const piecesInCurrentPlayerBag = props.G.pieces.filter(
    (piece) => piece.position === undefined && piece.player === currentPlayer,
  );
  const piecesInOppositePlayerBat = props.G.pieces.filter(
    (piece) => piece.position === undefined && piece.player !== currentPlayer,
  );

  function handleSelectSpace(position: Position) {
    if (selectedPiece === undefined) {
      return;
    }

    const piece = piecesInCurrentPlayerBag[selectedPiece];

    props.moves.movePiece(piece, position);
    setSelectedPiece(undefined);
  }

  return (
    <Grid
      width="100vw"
      height="100vh"
      position={'relative'}
      gridTemplateRows="auto 1fr auto"
      bgColor="gray.50"
    >
      <Box
        position="absolute"
        left={0}
        top={0}
        width="100%"
        height={'100%'}
        zIndex={10}
        pointerEvents="none"
      >
        {boardLayer.map((position) => (
          <EmptyBoardSpace
            key={`${position.row},${position.column}`}
            position={position}
            isInteractive={selectedPiece !== undefined}
            onSelect={handleSelectSpace}
          />
        ))}
      </Box>
      <Box
        position="absolute"
        left={0}
        top={0}
        width="100%"
        height={'100%'}
        zIndex={10}
        pointerEvents="none"
      >
        {piecesOnBoard.map((piece) => (
          <BoardPosition key={piece.id} position={piece.position!}>
            <PlayerPiece key={piece.id} piece={piece} isInteractive={selectedPiece !== undefined} />
          </BoardPosition>
        ))}
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
                    isSelected={playerIsCurrent && selectedPiece === i}
                    onSelect={() => setSelectedPiece(i)}
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
