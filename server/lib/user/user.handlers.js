const Joi = require("joi");
const { mapErrorDetails } = require("../common/utils");

const userSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
});

module.exports = function (components, eventEmitter) {
  const { userRepository, gameRepository } = components;

  return {
    connectUser: async function (payload, callback) {
      const socket = this;
      const { error, value } = userSchema.tailor("connect").validate(payload);

      if (error) {
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });
      }

      try {
        await userRepository.connect(value);
      } catch (e) {
        return callback({ error: e });
      }

      callback({ data: value.id });

      socket.broadcast.emit("user:connected", value);
      eventEmitter.emit("user:connected");
    },

    disconnectUser: async function (payload, callback) {
      const socket = this;
      const { error, value } = userSchema
        .tailor("disconnect")
        .validate(payload);
      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

      let result;
      try {
        result = await userRepository.disconnectById(value.id);
      } catch (e) {
        return callback({ error: e });
      }
      callback({ ...result });
      socket.broadcast.emit("user:disconnected", value);
      eventEmitter.emit("user:disconnected");
    },

    findAllUser: async function (payload, callback) {
      const result = await userRepository.findAll();
      return callback({ users: result });
    },

    checkAllConnectedUsers: async function (io) {
      const users = await userRepository.findAll();
      if (users.length == 2) {
        eventEmitter.emit("game:start");
      } else if (await gameRepository.isStarted()) {
        eventEmitter.emit("game:end");
      }
    },
  };
};
