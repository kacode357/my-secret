// File: src/services/user.service.js
const { User } = require("../models");

class UserService {
  async getAllUsers() {
    const users = await User.find({})
      .select("username displayName avatarUrl status lastSeenAt")
      .lean();

    return users;
  }

  async getFriendsOfUser(userId) {
    const user = await User.findById(userId).populate(
      "friends",
      "username displayName avatarUrl status lastSeenAt"
    );

    if (!user) return [];
    return user.friends || [];
  }

  async getUserByUsername(username) {
    if (!username) return null;

    return User.findOne({
      username: username.toLowerCase().trim(),
    }).select("username displayName avatarUrl status friends lastSeenAt");
  }

  async checkFriendship(userId, peerId) {
    const user = await User.findById(userId).select("friends");
    if (!user) return false;

    return user.friends.some((id) => id.equals(peerId));
  }

  async setOnline(username) {
    if (!username) return null;
    const now = new Date();
    return User.findOneAndUpdate(
      { username: username.toLowerCase().trim() },
      { status: "online", lastSeenAt: now },
      { new: true }
    ).select("username displayName avatarUrl status lastSeenAt");
  }

  async setOffline(username) {
    if (!username) return null;
    const now = new Date();
    return User.findOneAndUpdate(
      { username: username.toLowerCase().trim() },
      { status: "offline", lastSeenAt: now },
      { new: true }
    ).select("username displayName avatarUrl status lastSeenAt");
  }
}

module.exports = new UserService();
