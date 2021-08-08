const { createServer, Server } = require("http");
const { expect } = require("chai");
const { AddressInfo } = require("net");
const { io, Socket } = require("socket.io-client");

const { createPartialDone } = require("../utils");
const createApplication = require("../../lib/app");

describe("game management", () => {
  let httpServer, socket, otherSocket, gameRepository;
  beforeEach((done) => {
    const partialDone = createPartialDone(2, done);
    httpServer = createServer();
    const { components } = createApplication(httpServer);
    gameRepository = components.gameRepository;
    httpServer.listen(() => {
      const port = httpServer.address().port;
      socket = io(`http://localhost:${port}`);
      socket.on("connect", partialDone);

      otherSocket = io(`http://localhost:${port}`);
      otherSocket.on("connect", partialDone);
    });
  });

  afterEach(() => {
    httpServer.close();
    socket.disconnect();
    otherSocket.disconnect();
  });

  describe("start game", function () {
    it("should start the game", (done) => {
      const partialDone = createPartialDone(4, done);

      otherSocket.on("game:started", async (data) => {
        expect(data.round).to.be.a("number");
        expect(data.round).to.equal(1);
        const gameStarted = await gameRepository.isStarted();
        expect(gameStarted).to.equal(true);
        partialDone();
      });

      socket.on("game:enabled", async (data) => {
        expect(data.enabled).to.be.a("boolean");
        expect(data.enabled).to.equal(true);
        const gameStarted = await gameRepository.isEnabled();
        expect(gameStarted).to.equal(true);
        partialDone();
      });

      otherSocket.on("game:enabled", async (data) => {
        expect(data.enabled).to.be.a("boolean");
        expect(data.enabled).to.equal(true);
        const gameEnabled = await gameRepository.isEnabled();
        expect(gameEnabled).to.equal(true);
        partialDone();
      });

      new Promise((resolve) => {
        const partialResolve = createPartialDone(2, resolve);
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialResolve();
        });

        otherSocket.emit("user:connect", { id: 2 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialResolve();
        });
      }).then(() => {
        socket.emit("game:start", {}, async (data) => {
          expect(data.round).to.be.a("number");
          expect(data.round).to.equal(1);
          const gameStarted = await gameRepository.isStarted();
          expect(gameStarted).to.equal(true);
          partialDone();
        });
      });
    });

    it("should not enable the game", (done) => {
      const partialDone = createPartialDone(2, done);
      socket.on("game:enabled", () => {
        done(new Error("should not happen"));
      });

      otherSocket.on("game:enabled", () => {
        done(new Error("should not happen"));
      });

      otherSocket.on("user:connected", (user) => {
        expect(user.id).to.be.a("number");
        expect(user.id).to.eql(1);
        partialDone();
      });

      socket.emit("user:connect", { id: 1 }, async (res) => {
        if ("error" in res) return done(new Error(res.error));
        expect(res.data).to.be.a("number");
        expect(res.data).to.eql(1);
        partialDone();
      });
    });
  });

  describe("disable the game", () => {
    it("should disable a enabled game", (done) => {
      const partialDone = createPartialDone(3, done);

      otherSocket.on("game:disabled", (data) => {
        expect(data.enabled).to.be.a("boolean");
        expect(data.enabled).to.equal(false);
        partialDone();
      });

      socket.on("game:disabled", (data) => {
        expect(data.enabled).to.be.a("boolean");
        expect(data.enabled).to.equal(false);
        partialDone();
      });

      new Promise((resolve) => {
        const partialResolve = createPartialDone(2, resolve);
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialResolve();
        });
        otherSocket.emit("user:connect", { id: 2 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialResolve();
        });
      }).then(() => {
        socket.emit("user:disconnect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
        });
      });
    });

    it("should disable a started game", (done) => {
      const partialDone = createPartialDone(7, done);
      socket.on("game:enabled", (res) => {
        if ("error" in res) return done(new Error(res.error));
        partialDone();
      });

      otherSocket.on("game:enabled", (res) => {
        if ("error" in res) return done(new Error(res.error));
        partialDone();
      });

      otherSocket.on("game:started", async (data) => {
        if ("error" in data) return done(new Error(data.error));
        expect(data.round).to.be.a("number");
        expect(data.round).to.equal(1);
        const gameStarted = await gameRepository.isStarted();
        expect(gameStarted).to.equal(true);
        partialDone();
      });

      otherSocket.on("game:disabled", (data) => {
        expect(data.enabled).to.be.a("boolean");
        expect(data.enabled).to.equal(false);
        partialDone();
      });

      socket.on("game:disabled", (data) => {
        expect(data.enabled).to.be.a("boolean");
        expect(data.enabled).to.equal(false);
        partialDone();
      });

      new Promise((resolve) => {
        const partialResolve = createPartialDone(2, resolve);
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialResolve();
        });
        otherSocket.emit("user:connect", { id: 2 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialResolve();
        });
      })
        .then(() => {
          return new Promise((resolve) => {
            socket.emit("game:start", {}, async (data) => {
              expect(data.round).to.be.a("number");
              expect(data.round).to.equal(1);
              const gameStarted = await gameRepository.isStarted();
              expect(gameStarted).to.equal(true);
              partialDone();
              resolve(true);
            });
          });
        })
        .then(() => {
          socket.emit("user:disconnect", { id: 1 }, async (res) => {
            if ("error" in res) return done(new Error(res.error));
            partialDone();
          });
        });
    });

    it("should not disable the game", (done) => {
      const partialDone = createPartialDone(2, done);

      socket.on("game:disabled", () => {
        done(new Error("should not happen"));
      });

      otherSocket.on("game:disabled", () => {
        done(new Error("should not happen"));
      });

      new Promise((resolve) => {
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          expect(res.data).to.be.a("number");
          partialDone();
          resolve();
        });
      }).then(() => {
        socket.emit("user:disconnect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          expect(res.user).to.be.a("number");
          expect(res.user).to.eql(1);
          partialDone();
        });
      });
    });
  });
});

describe("game states management", () => {
  let httpServer, socket, otherSocket;
  beforeEach((done) => {
    httpServer = createServer();
    const { components } = createApplication(httpServer);
    gameRepository = components.gameRepository;
    httpServer.listen(() => {
      const port = httpServer.address().port;
      socket = io(`http://localhost:${port}`);
      otherSocket = io(`http://localhost:${port}`);
      new Promise((resolve) => {
        const partialResolve = createPartialDone(2, resolve);
        socket.on("connect", partialResolve);
        otherSocket.on("connect", partialResolve);
      })
        .then(() => {
          return new Promise((resolve) => {
            const partialResolve = createPartialDone(2, resolve);
            socket.emit("user:connect", { id: 1 }, async (res) => {
              if ("error" in res) return done(new Error(res.error));
              partialResolve();
            });
            otherSocket.emit("user:connect", { id: 2 }, async (res) => {
              if ("error" in res) return done(new Error(res.error));
              partialResolve();
            });
          });
        })
        .then(() => {
          socket.emit("game:start", {}, async () => {
            done();
          });
        });
    });
  });

  afterEach(() => {
    httpServer.close();
    socket.disconnect();
    otherSocket.disconnect();
  });

  describe("reset game", () => {
    it("should reset the game", (done) => {
      const partialDone = createPartialDone(2, done);
      otherSocket.on("game:reseted", (res) => {
        if ("error" in res) return done(new Error(res.error));
        expect(res.round).to.be.a("number");
        expect(res.round).to.equal(1);
        partialDone();
      });

      socket.emit("game:reset", { id: 1 }, (res) => {
        if ("error" in res) return done(new Error(res.error));
        expect(res.round).to.be.a("number");
        expect(res.round).to.equal(1);
        partialDone();
      });
    });

    it("should not reset the game with invalid payload", (done) => {
      otherSocket.on("game:reseted", () => {
        done(new Error("should not happen"));
      });

      new Promise((resolve) => {
        socket.emit("user:disconnect", { id: 1 }, (res) => {
          if ("error" in res) return done(new Error(res.error));
          resolve();
        });
      }).then(() => {
        socket.emit("game:reset", {}, (res) => {
          if (!("error" in res)) return done(new Error("should not happen"));
          expect(res.error).to.eql("socket id not found");
          done();
        });
      });
    });

    it("should not reset the game with invalid payload", (done) => {
      const partialDone = createPartialDone(2, done);
      otherSocket.on("game:reseted", () => {
        done(new Error("should not happen"));
      });

      new Promise((resolve) => {
        otherSocket.emit("user:disconnect", { id: 2 }, (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
          resolve();
        });
      }).then(() => {
        socket.emit("game:reset", { id: 1 }, (res) => {
          if (!("error" in res)) return done(new Error("should not happen"));
          expect(res.error).to.be.a("string");
          expect(res.error).to.equal("game not started yet");
          partialDone();
        });
      });
    });
  });

  describe("play game", () => {
    it("should play a round", (done) => {
      const partialDone = createPartialDone(2, done);
      const expectedGrid = [
        [".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", "."],
        [1, ".", ".", ".", ".", "."],
      ];

      socket.emit("game:play", { id: 1, column: 0 }, (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.round).to.be.a("number");
        expect(res.round).to.equal(2);
        expect(res.position).to.be.an("array");
        expect(res.position).to.have.members([6, 0]);
        expect(res.grid).to.be.an("array");
        expect(res.grid).to.have.deep.members(expectedGrid);
        partialDone();
      });

      otherSocket.on("game:played", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.round).to.be.a("number");
        expect(res.round).to.equal(2);
        expect(res.position).to.be.an("array");
        expect(res.position).to.have.members([6, 0]);
        expect(res.grid).to.be.an("array");
        expect(res.grid).to.have.deep.members(expectedGrid);
        partialDone();
      });
    });

    it("should not play a round with invalid payload", (done) => {
      socket.emit("game:play", { id: 1 }, (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.be.a("string");
        expect(res.error).to.be.equal("invalid payload");
        expect(res.details).to.eql([
          {
            message: '"column" is required',
            path: ["column"],
            type: "any.required",
          },
        ]);
        done();
      });
      otherSocket.on("game:played", () => {
        return done(new Error("should not happen"));
      });
    });

    it("should not play a round with invalid player", (done) => {
      otherSocket.emit("game:play", { id: 2, column: 0 }, (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.be.a("string");
        expect(res.error).to.be.equal("it's not your turn");
        done();
      });
      otherSocket.on("game:played", () => {
        return done(new Error("should not happen"));
      });
    });

    it("should not play the second round with invalid player", (done) => {
      const partialDone = createPartialDone(2, done);
      new Promise((resolve) => {
        socket.emit("game:play", { id: 1, column: 0 }, (res) => {
          if ("error" in res) return done(new Error("should not happen"));
          expect(res.round).to.be.a("number");
          expect(res.round).to.equal(2);
          expect(res.position).to.be.an("array");
          expect(res.position).to.have.members([6, 0]);
          expect(res.grid).to.be.an("array");
          partialDone();
          resolve();
        });
      }).then(() => {
        socket.emit("game:play", { id: 1, column: 0 }, (res) => {
          if (!("error" in res)) return done(new Error("should not happen"));
          expect(res.error).to.be.a("string");
          expect(res.error).to.be.equal("it's not your turn");
          partialDone();
        });
      });
    });

    it("should not play a round with invalid column", (done) => {
      otherSocket.emit("game:play", { id: 1, column: -1 }, (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.be.a("string");
        expect(res.error).to.be.equal("invalid column");
        done();
      });
      otherSocket.on("game:played", () => {
        return done(new Error("should not happen"));
      });
    });
  });

  describe("win game", () => {
    it("should win vertical the game", (done) => {
      const partialDone = createPartialDone(4, done);
      socket.on("game:win", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.player).to.be.a("number");
        expect(res.player).to.equal(1);
        partialDone();
      });
      otherSocket.on("game:win", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.player).to.be.a("number");
        expect(res.player).to.equal(1);
        partialDone();
      });
      socket.on("game:ended", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.ended).to.be.a("boolean");
        expect(res.ended).to.equal(true);
        partialDone();
      });
      otherSocket.on("game:ended", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.ended).to.be.a("boolean");
        expect(res.ended).to.equal(true);
        partialDone();
      });

      new Promise((resolve) => {
        socket.emit("game:play", { id: 1, column: 0 }, (res) => {
          if ("error" in res) return done(new Error("should not happen"));
          resolve(true);
        });
      })
        .then((next) => {
          return new Promise((resolve) => {
            otherSocket.emit("game:play", { id: 2, column: 1 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            socket.emit("game:play", { id: 1, column: 0 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            otherSocket.emit("game:play", { id: 2, column: 1 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            socket.emit("game:play", { id: 1, column: 0 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            otherSocket.emit("game:play", { id: 2, column: 1 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            socket.emit("game:play", { id: 1, column: 0 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        });
    });

    it("should win horizontal the game", (done) => {
      const partialDone = createPartialDone(4, done);
      socket.on("game:win", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.player).to.be.a("number");
        expect(res.player).to.equal(1);
        partialDone();
      });
      otherSocket.on("game:win", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.player).to.be.a("number");
        expect(res.player).to.equal(1);
        partialDone();
      });
      socket.on("game:ended", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.ended).to.be.a("boolean");
        expect(res.ended).to.equal(true);
        partialDone();
      });
      otherSocket.on("game:ended", (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.ended).to.be.a("boolean");
        expect(res.ended).to.equal(true);
        partialDone();
      });

      new Promise((resolve) => {
        socket.emit("game:play", { id: 1, column: 0 }, (res) => {
          if ("error" in res) return done(new Error("should not happen"));
          resolve(true);
        });
      })
        .then((next) => {
          return new Promise((resolve) => {
            otherSocket.emit("game:play", { id: 2, column: 5 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            socket.emit("game:play", { id: 1, column: 1 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            otherSocket.emit("game:play", { id: 2, column: 5 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            socket.emit("game:play", { id: 1, column: 2 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            otherSocket.emit("game:play", { id: 2, column: 5 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        })
        .then((next) => {
          return new Promise((resolve) => {
            socket.emit("game:play", { id: 1, column: 3 }, (res) => {
              if ("error" in res) return done(new Error("should not happen"));
              resolve(next);
            });
          });
        });
    });
  });
});
