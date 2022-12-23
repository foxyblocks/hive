import type { BoardProps } from 'boardgame.io/react';
import {
  HiveGameState,
  PieceKind,
  Piece,
  Space,
  colorForPlayer,
  Player,
  isCurrentPlayer,
} from './Game';
import { Box, chakra, Flex, Grid, Heading, Square, Text, useBoolean } from '@chakra-ui/react';
import { useState } from 'react';

const SPACE_SIZE = 9;

function Hexagon({
  fill,
  stroke,
  onClick,
  isInteractive,
}: {
  fill: string;
  onClick?: () => void;
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
        cursor={isInteractive ? 'pointer' : 'default'}
      ></chakra.polygon>
    </chakra.svg>
  );
}

interface BoardSpaceProps {
  space: Space;
  isInteractive?: boolean;
  onSelect?: (space: Space) => void;
}

/**
 * React component that returns a hexagon SVG
 */
function BoardSpace({ space, isInteractive, onSelect }: BoardSpaceProps) {
  const [isHovered, setIsHovered] = useState(false);
  const xOffset = space.column * ((SPACE_SIZE / 10) * 7.8);
  const yOffset = space.row * ((SPACE_SIZE / 10) * 4.5);
  const fill = space.piece ? colorForPlayer(space.piece.player) : '#efefef';
  function handleSelect() {
    onSelect && isInteractive && onSelect(space);
  }
  return (
    <Box
      w={`${SPACE_SIZE}vmax`}
      h={`${SPACE_SIZE}vmax`}
      pos="absolute"
      top={`calc(50% + ${yOffset}vmax)`}
      left={`calc(50% + ${xOffset}vmax)`}
      transform="translate(-50%, -50%)"
      display={'grid'}
      gridTemplateRows={'1fr'}
      gridTemplateColumns={'1fr'}
      placeContent={'center'}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box position="absolute" top={0} left={0} right={0} bottom={0}>
        <Hexagon
          onClick={handleSelect}
          fill={fill}
          isInteractive={isInteractive}
          stroke={isHovered && isInteractive ? 'black' : undefined}
        />
      </Box>
      <Text
        pos="absolute"
        top="50%"
        left="50%"
        transform={'translate(-50%, -50%)'}
        pointerEvents="none"
      >
        {space.row}, {space.column}
      </Text>
      {space.piece && (
        <Box
          pos="absolute"
          top="50%"
          left="50%"
          transform={'translate(-50%, -50%)'}
          width="100%"
          height="100%"
        >
          <PlayerPiece piece={space.piece} />
        </Box>
      )}
    </Box>
  );
}

const emojis = {
  [PieceKind.QUEEN]: '👑',
  [PieceKind.BEETLE]: '🐞',
  [PieceKind.GRASSHOPPER]: '🦗',
  [PieceKind.SPIDER]: '🕷',
  [PieceKind.ANT]: '🐜',
};

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
        {emojis[piece.kind]}
      </Box>
    </Box>
  );
}

interface HiveBoardProps extends BoardProps<HiveGameState> {
  // Additional custom properties for your component
}

export default function Board(props: HiveBoardProps) {
  const [selectedPiece, setSelectedPiece] = useState<number | undefined>(undefined);

  function handleSelectSpace(space: Space) {
    if (selectedPiece === undefined) {
      return;
    }
    const bag = isCurrentPlayer(Player.WHITE, props.ctx) ? props.G.whiteBag : props.G.blackBag;
    const piece = bag[selectedPiece];

    props.moves.playPiece(piece, space);
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
      <Box position="relative" gridRow={2}>
        {props.G.board.map((space) => (
          <BoardSpace
            key={`${space.row},${space.column}`}
            space={space}
            isInteractive={selectedPiece !== undefined}
            onSelect={handleSelectSpace}
          />
        ))}
      </Box>
      {[Player.BLACK, Player.WHITE].map((player) => {
        const bag = player === Player.BLACK ? props.G.blackBag : props.G.whiteBag;
        const playerIsCurrent = player === props.ctx.currentPlayer;
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
      {/* <Flex pos="absolute" top="0">
        {props.G.blackBag.map((piece, i) => (
          <Square key={piece.id} size="5vmax">
            <PlayerPiece piece={piece} />
          </Square>
        ))}
      </Flex> */}
      {/* <Flex pos="absolute" bottom="0">
        {props.G.whiteBag.map((piece, i) => (
          <Square key={piece.id} size="5vmax">
            <PlayerPiece
              key={i}
              piece={piece}
              isSelected={selectedPiece === i}
              onSelect={() => setSelectedPiece(i)}
            />
          </Square>
        ))}
      </Flex> */}
    </Grid>
  );
}
