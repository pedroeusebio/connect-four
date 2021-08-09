import { Flex } from "@chakra-ui/layout";
import * as styles from "../styles/game.module.css";

const Cell = ({ value, columnIndex, play }) => {
  let color = "whiteCircle";

  if (value === 1) {
    color = "redCircle";
  } else if (value === 2) {
    color = "yellowCircle";
  }

  return (
    <td>
      <Flex
        justify="center"
        align="center"
        className={styles.gameCell}
        onClick={() => {
          play(columnIndex);
        }}
      >
        <div className={styles[color]}></div>
      </Flex>
    </td>
  );
};

export const Row = ({ row, play }) => {
  return (
    <tr>
      {row.map((cell, i) => (
        <Cell key={i} value={cell} columnIndex={i} play={play} />
      ))}
    </tr>
  );
};
