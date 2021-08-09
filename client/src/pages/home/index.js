import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Heading, Center, Text, VStack } from "@chakra-ui/react";
import * as gameStyles from "../../styles/game.module.css";


export default function Home({ socket }) {
  const [playerOne, setPlayerOne] = useState(false);
  const [playerTwo, setPlayerTwo] = useState(false);

  useEffect(() => {
    socket.emit("user:findAll", {}, (res) => {
      if ("error" in res) alert(res.error);
      res.users.forEach((user) => {
        if (user.id === 1) setPlayerOne(true);
        else if (user.id === 2) setPlayerTwo(true);
      });
    });
    socket.on("user:connected", (user) => {
      if (user.id === 1) setPlayerOne(true);
      else if (user.id === 2) setPlayerTwo(true);
    });

    socket.on("user:disconnected", (data) => {
      if (data.user === 1) setPlayerOne(false);
      else if (data.user === 2) setPlayerTwo(false);
    });
  }, [socket]);

  return (
    <>
      <Heading> Connect 4 </Heading>
      <Heading as="h2">Lobby</Heading>
      <Center h="20vw" w="30vw" bg="gray.300">
        <VStack>
          <Center h="15vw" w="30vw">
            <Button
              colorScheme="red"
              className={gameStyles.button}
              disabled={playerOne}
              style={{ marginRight: "40px" }}
            >
              <Link to="/game/1">
                Player 1 {playerOne ? "(connected)" : ""}
              </Link>
            </Button>
            <Button
              colorScheme="yellow"
              className={gameStyles.button}
              disabled={playerTwo}
            >
              <Link to="/game/2">
                Player 2 
                {playerTwo ? "(connected)" : ""}
              </Link>
            </Button>
          </Center>
          <Text> Select a Player to start the game</Text>
        </VStack>
      </Center>
    </>
  );
}
