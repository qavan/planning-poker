const { Router } = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth.middleware");
const router = Router();

// /api/user/name
router.post("/name", auth, async (req, res) => {
  try {
    const { userName } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Произошла ошибка, попробуйте позже!" });
    }

    user.userName = userName;

    await user.save();
    res.status(200).json({ message: "Пользователь обновлен!" });
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
