module.exports = class InMemoryUserRepository {
  users = new Map();
  idBySocketId = new Map();

  findAll() {
    const users = Array.from(this.users.values());
    return Promise.resolve(users);
  }

  findById(id) {
    if (this.users.has(id)) return Promise.resolve(this.users.get(id));
    return Promise.reject("user not found");
  }

  findBySocketId(socketId) {
    if (!this.idBySocketId.has(socketId))
      return Promise.reject("socket id not found");
    return Promise.resolve(this.users.get(this.idBySocketId.get(socketId)));
  }

  connect(user) {
    if (this.users.has(user.id))
      return Promise.reject("user already connected");
    this.users.set(user.id, user);
    this.idBySocketId.set(user.socketId, user.id);
    return Promise.resolve(true);
  }

  disconnectById(id) {
    const deleteUser = this.users.get(id);
    const deleted = this.users.delete(id);
    if (deleted) {
      this.idBySocketId.delete(deleteUser.socketId);
      return Promise.resolve({ user: id });
    }
    return Promise.reject("user not found");
  }
};
