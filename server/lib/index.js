const { createServer } = require("http");

const createApplication = require("./app");
const { port } = require("./config");

const httpServer = createServer();

createApplication(httpServer, {
  cors: {
    origin: "*",
  },
});

httpServer.listen(port);
