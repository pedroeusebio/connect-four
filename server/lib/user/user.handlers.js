const Joi = require("joi");
const { mapErrorDetails } = require("../common/utils");

const userSchema = Joi.object()
  .keys({
    id: Joi.number().valid(1, 2),
    socketId: Joi.string(),
  })
  .or("id", "socketId");

const userConnectSchema = Joi.object().keys({
  id: Joi.number().valid(1, 2).required(),
  socketId: Joi.string().required(),
});

module.exports = function (components, eventEmitter) {
  const { userRepository, gameRepository } = components;

  return {
    connectUser: async function (payload, callback) {
      const socket = this;
      const { error, value } = userConnectSchema.validate(payload);

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
      const { error, value } = userSchema.validate(payload);

      if (error)
        return callback({
          error: "invalid payload",
          details: mapErrorDetails(error.details),
        });

      let result;
      try {
        if (value.id) result = await userRepository.disconnectById(value.id);
        else {
          const user = await userRepository.findBySocketId(value.socketId);
          result = await userRepository.disconnectById(user.id);
        }
      } catch (e) {
        return callback({ error: e });
      }
      callback({ ...result });
      socket.broadcast.emit("user:disconnected", result);
      eventEmitter.emit("user:disconnected");
    },

    findAllUser: async function (payload, callback) {
      const result = await userRepository.findAll();
      return callback({ users: result });
    },

    checkAllConnectedUsers: async function () {
      const users = await userRepository.findAll();
      if (users.length == 2) {
        eventEmitter.emit("game:enable");
      } else if (await gameRepository.isEnabled()) {
        eventEmitter.emit("game:disable");
      }
    },
  };
};
