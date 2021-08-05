const Joi = require("joi");
const { mapErrorDetails } = require("../common/utils");

const userSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
});

const movementSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
  column: Joi.number().required(),
});

module.exports = function (components, state) {
  const { userRepository, gameRepository } = components;

  return {
    startGame: async function (payload, callback) {
      const socket = this;
      const { error, value } = userSchema.tailor("connect").validate(payload);
      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

      let result;
      try {
        result = await gameRepository.start();
      } catch (e) {
        return callback({ error: e });
      }
      callback(result);
      socket.broadcast.emit("game:started", result);
    },
    resetGame: async function (payload, callback) {
      const socket = this;
      if (!gameRepository.isStarted)
        return callback({ error: "game not started yet" });
    },
  };
};
