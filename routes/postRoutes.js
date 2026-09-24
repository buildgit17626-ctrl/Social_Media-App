const express = require("express");

const router = express.Router();
const upload = require("../middlewares/upload");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost
} = require("../controllers/postController");

const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.get("/", authMiddleware, getPosts);
router.get("/:id", getPostById);

// Protected routes
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updatePost
);
router.delete("/:id", authMiddleware, deletePost);

router.put('/:id/like', authMiddleware, likePost)

module.exports = router;