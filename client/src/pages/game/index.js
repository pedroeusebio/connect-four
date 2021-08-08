import { useHistory, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChakraProvider, Heading, VStack } from "@chakra-ui/react";
import { Board } from "../../components/Board.js";
import { Button } from "@chakra-ui/react";
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
  const [isConnected, setIsConnected] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const disconnect = (id) => {
    socket.emit("user:disconnect", { id }, (res) => {
      if ("error" in res) return alert(res.error);
      setIsConnected(false);
    });
  };

  useUnload(disconnect);

  useEffect(() => {
    socket.emit("user:connect", { id }, (res) => {
      if ("error" in res && res.error === "user already connected") {
        alert(res.error);
        return history.push("/");
      }
      setIsConnected(true);
    });

    socket.on("game:started", (res) => {
      setIsGameStarted(true);
    });
    socket.on("game:ended", (res) => {
      setIsGameStarted(false);
    });

    return () => {
      socket.off("game:started");
      socket.off("game:ended");
      return disconnect(id);
    };
  }, [socket, id, history, disconnect]);

  return (
    <ChakraProvider>
      <VStack spacing="3rem">
        <Heading>Connect 4</Heading>
        <Button
          colorScheme="purple"
          className={gameStyles.button}
          disabled={!isGameStarted}
        >
          Reset Game
        </Button>
        <Board />;
      </VStack>
    </ChakraProvider>
  );
}
