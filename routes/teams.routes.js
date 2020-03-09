const { Router } = require("express");
const Team = require("../models/Team");
const auth = require("../middleware/auth.middleware");
const router = Router();

// /api/teams/create
router.post("/create", auth, async (req, res) => {
  try {
    console.log(req.body);
    const { userId, teamName, teamPass } = req.body;
    const team = await Team.findById(teamName);

    if (team) {
      return res
        .status(400)
        .json({ message: "Команда с таким названием уже существует!" });
    }

    const hashedPassword = await bcrypt.hash(teamPass, 12);
    const newTeam = new Team({
      teamOwner: userId,
      teamName: teamName,
      teamPass: hashedPassword
    });

    await newTeam.save();
    res.status(200).json({ message: "Команда создана!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
