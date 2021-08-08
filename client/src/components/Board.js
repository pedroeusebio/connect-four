import { useReducer } from "react";
import { Row } from "./Row";
import { Text } from "@chakra-ui/react";

const initialGameState = {
  player1: 1,
  player2: 2,
  currentPlayer: 1,
  board: [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ],
  gameOver: false,
  message: "",
};

const gameReducer = (state, action) => {
  return state;
};

export const Board = () => {
  const [gameState, dispatchGameState] = useReducer(
    gameReducer,
    initialGameState
  );

  const play = (c) => {};

  return (
    <>
      <table>
        <tbody>
          {gameState.board.map((row, i) => (
            <Row key={i} row={row} play={play} />
          ))}
        </tbody>
      </table>
      <Text>{gameState.message}</Text>
    </>
  );
};

export default Board;
