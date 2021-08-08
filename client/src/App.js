import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./pages/home";
import Game from "./pages/game";

import io from "socket.io-client";

const socket = io.connect("localhost:4000");

export default function App() {
  return (
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
  );
}
