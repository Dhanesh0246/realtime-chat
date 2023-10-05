import bcryptjs from "bcryptjs";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { Code } from "../models/code.js";
import { User } from "../models/user.js";

import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const newUser = TryCatch(async (req, res, next) => {
  const { email, name, password, bio, code } = req.body;
  console.log(email, name, password, bio, code);
  let present = await Code.findOne({ email });
  if (present) {
    if (present.code !== code.toString()) {
      return res.status(400).send("Incorrect code");
    } else {
      const file = req.file;

      if (!file) return next(new ErrorHandler("Please Upload Avatar"));

      const result = await uploadFilesToCloudinary([file]);

      const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
      };

      const user = await User.create({
        email,
        bio,
        name,
        password,
        avatar,
      });
      sendToken(res, user, 201, "User created");
    }
  }
});

const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid name or Password", 404));

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) return next(new ErrorHandler("Invalid name or Password", 404));
  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});

const profile = async (req, res, next) => {
  try {
    const { name, password, bio, email } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    user.name = name;
    user.bio = bio;
    user.password = password;

    const file = req.file;
    let avatar;

    if (file) {
      const result = await uploadFilesToCloudinary([file]);
      avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
      };
      user.avatar = avatar;
    }

    await user.save();

    sendToken(res, user, 200, "User profile updated");
  } catch (error) {
    console.log(error);
  }
};

const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie("chat-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
const searchUser = TryCatch(async (req, res) => {
  const { email = "" } = req.query;
  const myChats = await Chat.find({ groupChat: false, members: req.user });
  console.log(email, "gg");

  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: [req.user, ...allUsersFromMyChats] },
    email: { $regex: email, $options: "i" },
  });
  console.log(email, "gg");

  const users = allUsersExceptMeAndFriends.map(
    ({ _id, name, avatar, email }) => ({
      _id,
      name,
      avatar: avatar.url,
      email,
    })
  );

  return res.status(200).json({
    success: true,
    users,
  });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new ErrorHandler("Request already sent", 400));

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});

const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) return next(new ErrorHandler("Request not found", 404));

  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});

const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user);

    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});

const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      sendToken(res, user, 200, `Welcome Back, ${name}`);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const result = await cloudinary.uploader.upload(googlePhotoUrl, {
        resource_type: "image",
      });

      const newUser = new User({
        name:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        avatar: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });

      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
const mail = async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000);

  try {
    let present = await Code.findOne({ email });

    if (present) {
      present.code = code;
      await present.save();
    } else {
      await Code.create({ email, code });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gldhanesh22@gmail.com",
        pass: "vzkrnsbrhzhdihvf",
      },
    });

    const info = await transporter.sendMail({
      from: '"note-hub" <gldhanesh22@gmail.com>',
      to: email,
      subject: "Verification Code",
      html: `<div style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
        <h3 style="color: rgb(8, 56, 188)">Please enter the verification code</h3>
        <hr>
        <h4>Hi</h4>
        <p>
          Please use the following 4-digit code to verify your email address:
          <br>
          <b>${code}</b>
          <br>
        </p>
        <div style="margin-top: 20px;">
          <h5>Best Regards</h5>
        </div>
      </div>`,
    });

    res.status(200).json({ success: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  profile,
  google,
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  mail,
};
