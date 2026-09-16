const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; //whats this line doing?

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required"
      });
    }

    const token = authHeader.split(" ")[1]; //whats this line doing?

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    ); //How is it verifying?

    req.user = decodedToken; //what does this do?

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;

