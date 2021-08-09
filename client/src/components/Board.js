import { Row } from "./Row";
import { Text } from "@chakra-ui/react";

export const Board = ({ message, grid, play }) => {
  return (
    <>
      <table>
        <tbody>
          {grid.map((row, i) => (
            <Row key={i} row={row} play={play} />
          ))}
        </tbody>
      </table>
      <Text>{message}</Text>
    </>
  );
};

export default Board;
