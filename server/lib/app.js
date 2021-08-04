const { Server } = require("socket.io");
const createUserHandlers = require("./user/user.handlers");

module.exports = function createApplication(
  httpServer,
  components,
  serverOptions = {}
) {
  const io = new Server(httpServer, serverOptions);

  const { connectUser, disconnectUser, findAllUser } =
    createUserHandlers(components);

  io.on("connection", (socket) => {
    socket.on("user:connect", connectUser);
    socket.on("user:disconnect", disconnectUser);
    socket.on("user:findAll", findAllUser);
  });
  return io;
};
