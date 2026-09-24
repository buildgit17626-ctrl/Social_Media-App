const Post = require("../models/Post");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const cloudinary = require("../config/cloudinary");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // A post must contain either text or an image
    if ((!content || !content.trim()) && !req.file) {
      return res.status(400).json({
        message: "Post must contain text or an image"
      });
    }

    let imageUrl = null;
    let imagePublicId = null;

    // Upload image to Cloudinary if an image was provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Create the post in MongoDB
    const post = await Post.create({
      content: content ? content.trim() : "",
      author: req.user.userId,
      image: imageUrl,
      imagePublicId: imagePublicId
    });

    // Add author information to the response
    const populatedPost = await post.populate(
      "author",
      "username email"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ONE POST
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { content } = req.body;

    // Find the post and verify ownership
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or you are not the owner"
      });
    }

    // Update text if provided
    if (content !== undefined) {
      post.content = content.trim();
    }

    // Upload a new image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      // Delete the old image from Cloudinary
      if (post.imagePublicId) {
        await cloudinary.uploader.destroy(post.imagePublicId);
      }

      post.image = result.secure_url;
      post.imagePublicId = result.public_id;
    }

    // Prevent the post from becoming empty
    if (!post.content && !post.image) {
      return res.status(400).json({
        message: "Post must contain text or an image"
      });
    }

    await post.save();

    const populatedPost = await post.populate(
      "author",
      "username email"
    );

    res.status(200).json(populatedPost);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or you are not the owner"
      });
    }

    // Delete image from Cloudinary if the post has one
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    // Delete post from MongoDB
    await Post.findByIdAndDelete(post._id);

    res.status(200).json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// LIKE / UNLIKE POST
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const userId = req.user.userId;

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Remove the user's like
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add the user's like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      likesCount: post.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost
};