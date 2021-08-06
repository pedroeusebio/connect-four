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

  const { startGame, endGame, resetGame } = createGameHandlers(
    components,
    eventEmitter
  );

  io.on("connection", (socket) => {
    socket.on("user:connect", connectUser);
    socket.on("user:disconnect", disconnectUser);
    socket.on("user:findAll", findAllUser);

    socket.on("game:reset", resetGame);
  });

  eventEmitter.on("user:connected", function () {
    return checkAllConnectedUsers(io);
  });

  eventEmitter.on("user:disconnected", function () {
    return checkAllConnectedUsers(io);
  });

  eventEmitter.on("game:start", function () {
    return startGame(io);
  });

  eventEmitter.on("game:end", function () {
    return endGame(io);
  });

  return { io, components };
};
