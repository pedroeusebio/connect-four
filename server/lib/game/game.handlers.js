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
  };
};
