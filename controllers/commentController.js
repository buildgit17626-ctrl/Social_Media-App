const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Add a comment
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.userId;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: userId,
      post: postId
    });

    const populatedComment = await comment.populate(
      "author",
      "username"
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.log("CREATE COMMENT ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const comments = await Comment.find({
      post: postId
    })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    console.log("GET COMMENTS ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can delete only your own comments"
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.log("DELETE COMMENT ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment
};