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
      socket.on("game:started", async (data) => {
        expect(data.round).to.be.a("number");
        expect(data.round).to.equal(1);
        const gameStarted = await gameRepository.isStarted();
        expect(gameStarted).to.equal(true);
        partialDone();
      });

      otherSocket.on("game:started", async (data) => {
        expect(data.round).to.be.a("number");
        expect(data.round).to.equal(1);
        const gameStarted = await gameRepository.isStarted();
        expect(gameStarted).to.equal(true);
        partialDone();
      });

      socket.emit("user:connect", { id: 1 }, async (res) => {
        if ("error" in res) return done(new Error(res.error));
        partialDone();
      });

      otherSocket.emit("user:connect", { id: 2 }, async (res) => {
        if ("error" in res) return done(new Error(res.error));
        partialDone();
      });
    });

    it("should not started the game", (done) => {
      const partialDone = createPartialDone(2, done);
      socket.on("game:started", () => {
        done(new Error("should not happen"));
      });

      otherSocket.on("game:started", () => {
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

  describe("end the game", () => {
    it("should end the game", (done) => {
      const partialDone = createPartialDone(7, done);
      socket.on("game:started", (res) => {
        if ("error" in res) return done(new Error(res.error));
        partialDone();
      });

      otherSocket.on("game:started", (res) => {
        if ("error" in res) return done(new Error(res.error));
        partialDone();
      });

      otherSocket.on("game:ended", (data) => {
        expect(data.ended).to.be.a("boolean");
        expect(data.ended).to.equal(true);
        partialDone();
      });

      socket.on("game:ended", (data) => {
        expect(data.ended).to.be.a("boolean");
        expect(data.ended).to.equal(true);
        partialDone();
      });

      new Promise((resolve) => {
        const partialResolve = createPartialDone(2, resolve);
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
          partialResolve();
        });
        otherSocket.emit("user:connect", { id: 2 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
          partialResolve();
        });
      }).then(() => {
        socket.emit("user:disconnect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
        });
      });
    });

    it("should not end the game", (done) => {
      const partialDone = createPartialDone(2, done);

      socket.on("game:ended", () => {
        done(new Error("should not happen"));
      });

      otherSocket.on("game:ended", () => {
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
  let httpServer, socket, otherSocket, gameRepository;
  beforeEach((done) => {
    const partialDone = createPartialDone(2, done);
    httpServer = createServer();
    const { components } = createApplication(httpServer);
    gameRepository = components.gameRepository;
    httpServer.listen(() => {
      const port = httpServer.address().port;
      socket = io(`http://localhost:${port}`);
      new Promise((resolve) => socket.on("connect", resolve)).then(() => {
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
        });
      });

      otherSocket = io(`http://localhost:${port}`);
      new Promise((resolve) => otherSocket.on("connect", resolve)).then(() => {
        otherSocket.emit("user:connect", { id: 2 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
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

      socket.emit("game:reset", { id: 4 }, (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.eql("invalid payload");
        expect(res.details).to.eql([
          {
            message: '"id" must be one of [1, 2]',
            path: ["id"],
            type: "any.only",
          },
        ]);
        done();
      });
    });

    it("should not reset the game with invalid payload", (done) => {
      const partialDone = createPartialDone(2, done);
      otherSocket.on("game:reseted", () => {
        done(new Error("should not happen"));
      });

      new Promise((resolve) => {
        socket.emit("user:disconnect", { id: 1 }, (res) => {
          if ("error" in res) return done(new Error(res.error));
          partialDone();
          resolve();
        });
      }).then(() => {
        socket.emit("game:reset", { id: 1 }, (res) => {
          console.log(res);
          if (!("error" in res)) return done(new Error("should not happen"));
          expect(res.error).to.be.a("string");
          expect(res.error).to.equal("game not started yet");
          partialDone();
        });
      });
    });
  });
});
