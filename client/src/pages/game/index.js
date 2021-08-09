import { useHistory, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "../../components/Board.js";
import { Button, Heading  } from "@chakra-ui/react";
import * as gameStyles from "../../styles/game.module.css";

const useUnload = (fn) => {
  const cb = useRef(fn);

  useEffect(() => {
    const onUnload = cb.current;
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [cb]);
};

export default function Game({ socket }) {
  const { id } = useParams();
  let history = useHistory();
  const [isUserConnected, setIsUserConnected] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameEnabled, setIsGameEnabled] = useState(false);
  const [grid, setGrid] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState();
  const [message, setMessage] = useState();

  const disconnect = useCallback(() => {
    socket.emit("user:disconnect", { id }, (res) => {
      if ("error" in res) return alert(res.error);
      setIsUserConnected(false);
    });
  }, [id, socket]);

  const sendStartGame = () => {
    socket.emit("game:start", {}, (res) => {
      if ("error" in res) return alert(res.error);
      setGrid(res.grid);
      setIsGameStarted(true);
      setCurrentPlayer(res.round);
    });
  };

  const sendResetGame = () => {
    socket.emit("game:reset", {}, (res) => {
      if ("error" in res) return alert(res.error);
      setGrid(res.grid);
      setCurrentPlayer(res.round);
    });
  };

  const play = (c) => {
    if (parseInt(id) !== currentPlayer)
      return setMessage("it's not your turn yet");
    socket.emit("game:play", { column: c, id }, (res) => {
      if ("error" in res) return setMessage(res.error);
      setCurrentPlayer(res.round);
      setGrid(res.grid);
      setMessage();
    });
  };

  useUnload(disconnect);

  useEffect(() => {
    socket.emit("user:connect", { id }, (res) => {
      if ("error" in res && res.error === "user already connected") {
        alert(res.error);
        return history.push("/");
      }
      setIsUserConnected(true);
    });

    socket.on("game:enabled", (res) => {
      setIsGameEnabled(res.enabled);
    });
    socket.on("game:disabled", (res) => {
      setIsGameEnabled(res.enabled);
      setIsGameStarted(res.enabled);
      setGrid([]);
      setCurrentPlayer();
    });
    socket.on("game:started", (res) => {
      if ("error" in res) return alert(res.error);
      setGrid(res.grid);
      setIsGameStarted(true);
      setCurrentPlayer(res.round);
    });
    socket.on("game:played", (res) => {
      setMessage();
      setCurrentPlayer(res.round);
      setGrid(res.grid);
    });
    socket.on("game:win", (res) => {
      const message =
        res.player === parseInt(id)
          ? "You won the game!!"
          : "You lose the game :(";
      alert(message);
    });
    socket.on("game:ended", () => {
      setCurrentPlayer();
      setGrid([]);
      setIsGameStarted(false);
      setMessage();
    });
    socket.on("game:reseted", (res) => {
      if ("error" in res) return alert(res.error);
      setGrid(res.grid);
      setCurrentPlayer(res.round);
    });

    return () => {
      socket.off("game:enabled");
      socket.off("game:disbled");
      socket.off("game:started");
      socket.off("game:played");
      socket.off("game:win");
      socket.off("game:ended");
      socket.off("game:resetd");
      return disconnect();
    };
  }, [socket, id, history, disconnect]);

  return (
    <>
      <Heading>Connect 4</Heading>
      {isGameEnabled && (
        <Button
          colorScheme="purple"
          className={gameStyles.button}
          disabled={!isGameStarted}
          onClick={sendResetGame}
        >
          Reset Game
        </Button>
      )}
      {!isGameStarted && isUserConnected && (
        <Button
          colorScheme="green"
          className={gameStyles.button}
          disabled={!isGameEnabled}
          onClick={sendStartGame}
        >
          New Game
        </Button>
      )}
      {isGameStarted && <Board grid={grid} message={message} play={play} />}
    </>
  );
}
