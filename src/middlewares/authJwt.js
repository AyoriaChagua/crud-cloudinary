const jwt =  require("jsonwebtoken");
const { JWT_SECRET } =  require("../config/config.js");
const User = require("../models/User.js");

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(403).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userid = decoded.id;

    const user = await User.findById(req.userid, { password: 0 });
    if (!user) return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};


