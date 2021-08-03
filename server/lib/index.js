const { createServer } = require("http");

const createApplication = require("./app");
const { port } = require("./config");
const InMemoryUserRepository = require("./user/user.repository");

const httpServer = createServer();

createApplication(
  httpServer,
  {
    userRepository: new InMemoryUserRepository(),
  },
  {
    cors: {
      origin: ["http://localhost:4200"],
    },
  }
);

httpServer.listen(port);
