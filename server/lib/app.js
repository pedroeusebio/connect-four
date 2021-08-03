const { Server } = require("socket.io");
const createUserHandlers = require("./user/user.handlers");

module.exports = function createApplication(
  httpServer,
  components = {},
  serverOptions = {}
) {
  const io = new Server(httpServer, serverOptions);

  //add handlers;
  const { connectUser } = createUserHandlers(components);

  io.on("connection", (socket) => {
    socket.on("user:connect", connectUser);
  });
  return io;
};
