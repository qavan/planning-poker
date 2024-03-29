const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.method == "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Пользователь не авторизован!" });
    }
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    const userId = jwt.decode(token).userId;
    req.user = decoded;
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Пользователь не авторизован!" });
  }
};
