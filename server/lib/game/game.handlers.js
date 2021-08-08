const Joi = require("joi");
const { mapErrorDetails } = require("../common/utils");

const userSchema = Joi.object().keys({
  socketId: Joi.string().required(),
});

const movementSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
  column: Joi.number().required(),
});

module.exports = function (components, eventEmitter) {
  const { gameRepository, userRepository } = components;

  return {
    enableGame: async function (io) {
      gameRepository.enable();
      return io.emit("game:enabled", { enabled: true });
    },
    disableGame: async function (io) {
      await gameRepository.disable();
      return io.emit("game:disabled", { enabled: false });
    },
    startGame: async function (payload, callback) {
      const socket = this;
      const { error, value } = userSchema.validate(payload);

      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

      try {
        await userRepository.findBySocketId(value.socketId);
      } catch (e) {
        return callback({ error: e });
      }

      try {
        const result = await gameRepository.start();
        callback(result);
        return socket.broadcast.emit("game:started", result);
      } catch (e) {
        return callback({ error: e });
      }
    },
    endGame: async function (io) {
      try {
        const result = await gameRepository.end();
        return io.emit("game:ended", result);
      } catch (e) {
        return io.emit("game:ended", { error: e });
      }
    },
    resetGame: async function (payload, callback) {
      const socket = this;
      const { error, value } = userSchema.validate(payload);

      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

      try {
        await userRepository.findBySocketId(value.socketId);
      } catch (e) {
        return callback({ error: e });
      }

      let result;
      try {
        result = await gameRepository.reset();
      } catch (e) {
        return callback({ error: e });
      }

      callback(result);
      socket.broadcast.emit("game:reseted", result);
    },
    dropDisc: async function (payload, callback) {
      const socket = this;
      const { error, value } = movementSchema.validate(payload);
      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

      try {
        await gameRepository.checkIsplayerTurn(value.id);
      } catch (e) {
        return callback({ error: e });
      }

      let result;
      try {
        result = await gameRepository.drop(value.id, value.column);
      } catch (e) {
        return callback({ error: e });
      }
      result = { ...result, round: gameRepository.getPlayerRound() };
      callback(result);
      socket.broadcast.emit("game:played", result);
      eventEmitter.emit("game:checkRound");
    },
    checkRoundGame: async function (io) {
      if (gameRepository.isWinning()) {
        const winnerPlayer = gameRepository.getLastPlayer();
        io.emit("game:win", { player: winnerPlayer });
        eventEmitter.emit("game:end");
      }
    },
  };
};
