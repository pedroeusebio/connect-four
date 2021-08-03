const Joi = require("joi");
const { mapErrorDetails } = require("../common/utils");

const userSchema = Joi.object().keys({
  id: Joi.number().required(),
});

module.exports = function (components) {
  const { userRepository } = components;

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

      callback({data: value.id});

      socket.broadcast.emit("user:connected", value);
    },
  };
};
