const express = require("express");

const router = express.Router();

const {
  createComment,
  getComments,
  deleteComment
} = require("../controllers/commentController");

const authMiddleware = require("../middlewares/authMiddleware");

// Add a comment to a post
router.post(
  "/post/:postId",
  authMiddleware,
  createComment
);

// Get all comments of a post
router.get(
  "/post/:postId",
  authMiddleware,
  getComments
);

// Delete a comment
router.delete(
  "/:id",
  authMiddleware,
  deleteComment
);

module.exports = router;