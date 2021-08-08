import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function Home({ socket }) {
  const classes = useStyles();
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
    <div className={classes.root}>
      <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="space-around"
          style={{
            backgroundColor: "#cfe8fc",
            width: "40vw",
            minHeight: "30vw",
          }}
        >
          <Button variant="contained" color="primary" disabled={playerOne}>
            <Link to="/game/1">
              {" "}
              Player 1 {playerOne ? "(already connected)" : ""}
            </Link>
          </Button>
          <Button variant="contained" color="secondary" disabled={playerTwo}>
            <Link to="/game/2">
              {" "}
              Player 2 {playerTwo ? "(already connected)" : ""}
            </Link>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
