const Post = require("../models/Post");

// CREATE
const createPost = async (req, res) => {
  try {
    const { content, author } = req.body;

    const post = await Post.create({
      content,
      author
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// READ ALL
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// READ ONE
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found"
      });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// UPDATE
const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!post) {
      return res.status(404).json({
        error: "Post not found"
      });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// DELETE
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found"
      });
    }

    res.status(200).json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost
};