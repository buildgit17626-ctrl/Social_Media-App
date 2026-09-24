const express=require("express")

const router=express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  followUser,
  unfollowUser,
  getUserProfile
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware"); //before routing, this should work 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser)

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

router.get(
  "/:id/profile",
  authMiddleware,
  getUserProfile
);

router.post(
  "/:id/follow",
  authMiddleware,
  followUser
);

router.delete(
  "/:id/unfollow",
  authMiddleware,
  unfollowUser
);

module.exports = router;
