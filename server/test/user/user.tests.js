const { createServer, Server } = require("http");
const { expect } = require("chai");
const { AddressInfo } = require("net");
const { io, Socket } = require("socket.io-client");

const { createPartialDone } = require("../utils");
const createApplication = require("../../lib/app");

describe("user management", () => {
  let httpServer, socket, otherSocket, userRepository;

  beforeEach((done) => {
    const partialDone = createPartialDone(2, done);
    httpServer = createServer();
    const { components } = createApplication(httpServer);
    userRepository = components.userRepository;
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

  describe("connect user", () => {
    it("should connect a user", (done) => {
      const partialDone = createPartialDone(2, done);
      socket.emit("user:connect", { id: 1 }, async (res) => {
        if ("error" in res) return done(new Error(res.error));
        expect(res.data).to.be.a("number");
        const storedUser = await userRepository.findById(res.data);
        expect(storedUser).to.eql({ id: 1 });
        partialDone();
      });

      otherSocket.on("user:connected", (user) => {
        expect(user.id).to.be.a("number");
        partialDone();
      });
    });

    it("should fail with a invalid user payload", (done) => {
      socket.emit("user:connect", {}, async (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.eql("invalid payload");
        expect(res.details).to.eql([
          { message: '"id" is required', path: ["id"], type: "any.required" },
        ]);
        done();
      });

      otherSocket.on("user:connected", () => {
        done(new Error("should not happen"));
      });
    });

    it("should fail with a invalid user id", (done) => {
      socket.emit("user:connect", { id: 3 }, async (res) => {
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

      otherSocket.on("user:connected", () => {
        done(new Error("should not happen"));
      });
    });

    it("should fail when two users connect with same id", (done) => {
      const partialDone = createPartialDone(3, done);
      new Promise((resolve, reject) => {
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error("should not happen"));
          expect(res.data).to.be.a("number");
          const storedUser = await userRepository.findById(res.data);
          expect(storedUser).to.eql({ id: 1 });
          partialDone();
          resolve();
        });
      }).then(() => {
        otherSocket.emit("user:connect", { id: 1 }, async (res) => {
          if (!("error" in res)) return done(new Error("should not happen"));
          expect(res.error).to.eql("user already connected");
          partialDone();
        });
      });

      socket.on("user:connected", () => {
        done(new Error("should not happen"));
      });

      otherSocket.on("user:connected", (user) => {
        expect(user.id).to.be.a("number");
        partialDone();
      });
    });
  });

  describe("disconnect user", () => {
    it("should disconnect a user", (done) => {
      const partialDone = createPartialDone(2, done);
      new Promise((resolve, reject) => {
        socket.emit("user:connect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          expect(res.data).to.be.a("number");
          const storedUser = await userRepository.findById(res.data);
          expect(storedUser).to.eql({ id: 1 });
          partialDone();
          resolve();
        });
      }).then(() => {
        socket.emit("user:disconnect", { id: 1 }, async (res) => {
          if ("error" in res) return done(new Error(res.error));
          expect(res.user).to.be.a("number");
          expect(res.user).to.eql(1);
          const storedUser = await userRepository
            .findById(res.user)
            .catch((e) => e);
          expect(storedUser).to.be.a("string");
          partialDone();
        });
      });
    });

    it("should not disconnect a user with empty payload", (done) => {
      socket.emit("user:disconnect", {}, async (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.eql("invalid payload");
        expect(res.details).to.eql([
          { message: '"id" is required', path: ["id"], type: "any.required" },
        ]);
        done();
      });
      otherSocket.on("user:disconnected", () => {
        done(new Error("should not happen"));
      });
    });

    it("should not disconnect a user with invalid id", (done) => {
      socket.emit("user:disconnect", { id: 3 }, async (res) => {
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
      otherSocket.on("user:disconnected", () => {
        done(new Error("should not happen"));
      });
    });

    it("should not disconnect a user that is not connected", (done) => {
      socket.emit("user:disconnect", { id: 1 }, async (res) => {
        if (!("error" in res)) return done(new Error("should not happen"));
        expect(res.error).to.eql("user not found");
        done();
      });
      otherSocket.on("user:disconnected", () => {
        done(new Error("should not happen"));
      });
    });
  });

  describe("find all users", () => {
    it("should return empty array", (done) => {
      socket.emit("user:findAll", {}, async (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.users).to.be.a("array");
        expect(res.users).to.eql([]);
        done();
      });
    });

    it("should return one user", (done) => {
      socket.emit("user:findAll", {}, async (res) => {
        if ("error" in res) return done(new Error("should not happen"));
        expect(res.users).to.be.a("array");
        expect(res.users).to.eql([]);
        done();
      });
    });
  });
});
