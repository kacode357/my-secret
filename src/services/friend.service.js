// File: src/services/friend.service.js
const User = require("../models/User.model");
const FriendRequest = require("../models/FriendRequest.model");

function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

class FriendService {
  /**
   * User tạo mã kết bạn
   */
  static async generateFriendCode({ ownerUsername }) {
    const owner = await User.findOne({
      username: ownerUsername.toLowerCase().trim(),
    });

    if (!owner) {
      throw new Error("User không tồn tại");
    }

    // tạo code unique
    let code;
    let tryCount = 0;
    let exists = true;

    while (exists && tryCount < 5) {
      code = generateRandomCode(6);
      const found = await FriendRequest.findOne({ code });
      exists = !!found;
      tryCount++;
    }

    if (exists) {
      throw new Error("Không tạo được mã, thử lại sau");
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const request = await FriendRequest.create({
      owner: owner._id,
      code,
      status: "code_generated",
      expiresAt,
    });

    return {
      code: request.code,
      expiresAt: request.expiresAt,
      requestId: request._id,
    };
  }

  /**
   * Người khác nhập mã
   */
  static async submitFriendCode({ requesterUsername, code }) {
    const requester = await User.findOne({
      username: requesterUsername.toLowerCase().trim(),
    });

    if (!requester) {
      throw new Error("User không tồn tại");
    }

    const now = new Date();

    const fr = await FriendRequest.findOne({
      code: code.trim().toUpperCase(),
      status: "code_generated",
      expiresAt: { $gt: now },
    }).populate("owner");

    if (!fr) {
      throw new Error("Mã không hợp lệ hoặc đã hết hạn");
    }

    if (fr.owner._id.equals(requester._id)) {
      throw new Error("Không thể sử dụng mã của chính mình");
    }

    // đã là bạn chưa
    const alreadyFriend = requester.friends?.some((id) =>
      id.equals(fr.owner._id)
    );
    if (alreadyFriend) {
      throw new Error("Hai người đã là bạn bè rồi");
    }

    fr.requester = requester._id;
    fr.status = "pending_approval";
    await fr.save();

    return {
      requestId: fr._id,
      owner: {
        id: fr.owner._id,
        username: fr.owner.username,
        displayName: fr.owner.displayName,
      },
    };
  }

  /**
   * Owner accept/reject
   */
  static async respondFriendRequest({ ownerUsername, requestId, accept }) {
    const owner = await User.findOne({
      username: ownerUsername.toLowerCase().trim(),
    });

    if (!owner) {
      throw new Error("User không tồn tại");
    }

    const fr = await FriendRequest.findOne({
      _id: requestId,
      owner: owner._id,
      status: "pending_approval",
    }).populate("requester");

    if (!fr) {
      throw new Error("Yêu cầu kết bạn không tồn tại hoặc đã xử lý");
    }

    if (!accept) {
      fr.status = "rejected";
      await fr.save();
      return { accepted: false };
    }

    const requester = fr.requester;
    if (!requester) {
      throw new Error("Yêu cầu kết bạn không hợp lệ");
    }

    // thêm bạn 2 chiều
    const ownerFriends = owner.friends.map((id) => id.toString());
    const requesterFriends = requester.friends.map((id) => id.toString());

    if (!ownerFriends.includes(requester._id.toString())) {
      owner.friends.push(requester._id);
    }
    if (!requesterFriends.includes(owner._id.toString())) {
      requester.friends.push(owner._id);
    }

    await owner.save();
    await requester.save();

    fr.status = "accepted";
    await fr.save();

    return {
      accepted: true,
      friend: {
        id: requester._id,
        username: requester.username,
        displayName: requester.displayName,
      },
    };
  }

  /**
   * List yêu cầu đang chờ owner duyệt
   */
  static async getPendingRequestsForOwner({ ownerUsername }) {
    const owner = await User.findOne({
      username: ownerUsername.toLowerCase().trim(),
    });

    if (!owner) {
      throw new Error("User không tồn tại");
    }

    const list = await FriendRequest.find({
      owner: owner._id,
      status: "pending_approval",
    })
      .sort({ createdAt: -1 })
      .populate("requester", "username displayName avatarUrl");

    return list.map((fr) => ({
      requestId: fr._id,
      code: fr.code,
      requester: fr.requester
        ? {
            id: fr.requester._id,
            username: fr.requester.username,
            displayName: fr.requester.displayName,
            avatarUrl: fr.requester.avatarUrl,
          }
        : null,
      createdAt: fr.createdAt,
    }));
  }
}

module.exports = FriendService;
