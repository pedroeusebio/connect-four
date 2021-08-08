const { Server } = require("socket.io");
const EventEmitter = require("events");

const createUserHandlers = require("./user/user.handlers");
const createGameHandlers = require("./game/game.handlers");
const InMemoryUserRepository = require("./user/user.repository");
const InMemoryGameRepository = require("./game/game.repository");

module.exports = function createApplication(httpServer, serverOptions = {}) {
  const io = new Server(httpServer, serverOptions);
  const eventEmitter = new EventEmitter();
  const components = {
    userRepository: new InMemoryUserRepository(),
    gameRepository: new InMemoryGameRepository(),
  };

  const { connectUser, disconnectUser, findAllUser, checkAllConnectedUsers } =
    createUserHandlers(components, eventEmitter);

  const {
    enableGame,
    disableGame,
    startGame,
    endGame,
    resetGame,
    dropDisc,
    checkRoundGame,
  } = createGameHandlers(components, eventEmitter);

  io.on("connection", (socket) => {
    const socketId = socket.id;
    socket.on("user:connect", function (payload, callback) {
      return connectUser.call(this, { ...payload, socketId }, callback);
    });
    socket.on("user:disconnect", disconnectUser);
    socket.on("user:findAll", findAllUser);

    socket.on("game:start", function (payload, callback) {
      return startGame.call(this, { socketId }, callback);
    });
    socket.on("game:reset", function (payload, callback) {
      return resetGame.call(this, { socketId }, callback);
    });
    socket.on("game:play", dropDisc);
    socket.on("disconnect", function () {
      return disconnectUser.call(this, { socketId }, () => null);
    });
  });

  eventEmitter.on("user:connected", function () {
    return checkAllConnectedUsers();
  });

  eventEmitter.on("user:disconnected", function () {
    return checkAllConnectedUsers();
  });

  eventEmitter.on("game:enable", function () {
    return enableGame(io);
  });

  eventEmitter.on("game:disable", function () {
    return disableGame(io);
  });

  eventEmitter.on("game:end", function () {
    return endGame(io);
  });

  eventEmitter.on("game:checkRound", function () {
    return checkRoundGame(io);
  });

  return { io, components };
};
