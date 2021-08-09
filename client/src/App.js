import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ChakraProvider, extendTheme, VStack } from "@chakra-ui/react";

import Home from "./pages/home";
import Game from "./pages/game";

import io from "socket.io-client";

const socket = io.connect("localhost:4000");

const theme = extendTheme({
  styles: {
    global: {
      body: {
        backgroundColor: "#8fc2e5",
      },
    },
  },
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <VStack spacing="3rem">
        <Router>
          <Switch>
            <Route exact path="/">
              <Home socket={socket} />
            </Route>
            <Route path="/game/:id">
              <Game socket={socket} />
            </Route>
          </Switch>
        </Router>
      </VStack>
    </ChakraProvider>
  );
}
