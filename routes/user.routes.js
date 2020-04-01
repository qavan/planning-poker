const { Router } = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth.middleware");
const appState = require("../state");
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

// /api/user/
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Произошла ошибка, попробуйте позже!" });
    }

    const result = {
      userName: user.userName,
      teams: []
    };

    for (team in appState.teams) {
      if (appState.teams[team].owner === userId) {
        result.teams.push({
          teamId: team,
          teamName: appState.teams[team].teamName
        });
      }
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
