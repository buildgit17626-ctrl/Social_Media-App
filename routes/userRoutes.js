const express=require("express")

const router=express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  followUser,
  unfollowUser
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware"); //before routing, this should work 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser)
router.post('/logout', logoutUser)
router.post('/:id/follow',followUser)
router.delete('/:id/unfollow', unfollowUser)


module.exports = router;
