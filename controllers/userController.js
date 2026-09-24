const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.js");

// REGISTRATION
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required"
      });
    }

    // Check if user already exists
    const alreadyExists = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (alreadyExists) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    const hashedpass = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      email: email,
      password: hashedpass
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const psv = await bcrypt.compare(
      password,
      user.password
    );

    if (!psv) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    // Store JWT in an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// GET CURRENT USER
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// LOGOUT
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  res.status(200).json({
    message: "Logged out successfully"
  });
};

//Follow 
const followUser = async (req,res)=>{
  try{
    const currentUserId = req.user.userId 
    const targetUserId = req.params.id 
    
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself"
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        message: "You are already following this user"
      });
    }


    currentUser.following.push(targetUser)
    targetUser.followers.push(currentUserId);
  
     await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      message: "User followed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

//Unfollow 
// UNFOLLOW
const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const targetUserId = req.params.id;

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({
        message: "User is missing"
      });
    }

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        message: "You cannot unfollow yourself"
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString()
    );

    if (!isFollowing) {
      return res.status(400).json({
        message: "You are already not following this user"
      });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString()
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      message: "User unfollowed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;

    const user = await User.findById(targetUserId)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isFollowing = user.followers.some(
      (follower) =>
        follower._id.toString() === currentUserId.toString()
    );

    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: isFollowing
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  followUser,
  unfollowUser,
  getUserProfile,
};
