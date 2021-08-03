module.exports = class InMemoryUserRepository {
  users = new Map();

  findAll() {
    const users = Array.from(this.users.values());
    return Promise.resolve(users);
  }

  findById(id) {
    if (this.users.has(id)) return Promise.resolve(this.users.get(id));
    return Promise.reject("user not found");
  }

  connect(user) {
    if (this.users.has(user.id))
      return Promise.reject("user already connected");
    this.users.set(user.id, user);
    return Promise.resolve(true);
  }

  disconnectById(id) {
    const deleted = this.users.delete(id);
    if (deleted) return Promise.resolve(true);
    return Promise.reject("user not found");
  }
};
