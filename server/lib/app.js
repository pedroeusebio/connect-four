const { Server } = require("socket.io");
const createUserHandlers = require("./user/user.handlers");
const EventEmitter = require("events");

module.exports = function createApplication(
  httpServer,
  components,
  serverOptions = {}
) {
  const io = new Server(httpServer, serverOptions);
  const eventEmitter = new EventEmitter();
  const state = { gameEnabled: false };

  const { connectUser, disconnectUser, findAllUser, checkAllConnectedUsers } =
    createUserHandlers(components, eventEmitter, state);

  io.on("connection", (socket) => {
    socket.on("user:connect", connectUser);
    socket.on("user:disconnect", disconnectUser);
    socket.on("user:findAll", findAllUser);
  });

  eventEmitter.on("user:connected", function () {
    return checkAllConnectedUsers(io);
  });

  eventEmitter.on("user:disconnected", function () {
    return checkAllConnectedUsers(io);
  });

  return io;
};
