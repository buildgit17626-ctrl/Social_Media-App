const express=require("express")

const router=express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser
} = require("../controllers/userController");

const authMiddleware = require("../controllers/middlewares/authMiddleware"); //before routing, this should work 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser)

module.exports = router;
