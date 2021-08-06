const Joi = require("joi");
const { mapErrorDetails } = require("../common/utils");

const userSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
});

const movementSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
  column: Joi.number().required(),
});

module.exports = function (components, eventEmitter) {
  const { userRepository, gameRepository } = components;

  return {
    startGame: async function (io) {
      try {
        const result = await gameRepository.start();
        return io.emit("game:started", result);
      } catch (e) {
        return io.emit("game:started", { error: e });
      }
    },
    endGame: async function (io) {
      if (!(await gameRepository.isStarted()))
        return io.emit("game:ended", { error: "game not started yet" });
      try {
        const result = await gameRepository.end();
        return io.emit("game:ended", result);
      } catch (e) {
        return io.emit("game:ended", { error: e });
      }
    },
    resetGame: async function (payload, callback) {
      const socket = this;
      const { error } = userSchema.validate(payload);

      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

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
    },
  };
};
