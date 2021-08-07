const { createServer } = require("http");

const createApplication = require("./app");
const { port } = require("./config");
const InMemoryUserRepository = require("./user/user.repository");

const httpServer = createServer();

createApplication(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

httpServer.listen(port);
