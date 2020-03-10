const { Router } = require("express");
const auth = require("../middleware/auth.middleware");
const router = Router();
const appState = require("../state");
const shortid = require("shortid");
const bcrypt = require("bcryptjs");

const getUserTeams = userId => {
  const result = {
    teamOwner: [],
    teamUser: [],
    otherTeams: []
  };

  for (teamId in appState.teams) {
    if (appState.teams[teamId].owner === userId) {
      result.teamOwner.push({
        teamId,
        teamName: appState.teams[teamId].teamName
      });
      continue;
    }
    if (appState.teams[teamId].users.indexOf(userId) !== -1) {
      result.teamUser.push({
        teamId,
        teamName: appState.teams[teamId].teamName
      });
      continue;
    }
    result.otherTeams.push({
      teamId,
      teamName: appState.teams[teamId].teamName
    });
  }

  return result;
};

// /api/teams/create
router.post("/create", auth, async (req, res) => {
  try {
    const { userId, teamName, teamPass } = req.body;

    let teamId = shortid.generate();
    while (appState.teams.teamId) {
      teamId = shortid.generate();
    }

    let password = teamPass ? await bcrypt.hash(teamPass, 12) : "";

    appState.teams[teamId] = {
      owner: userId,
      teamName,
      teamPass: password,
      users: [userId]
    };

    res.status(200).json({ message: "Команда создана!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

// /api/teams/
router.get("/", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const result = getUserTeams(userId);

    res.status(200).json({ teams: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

// /api/teams/connect
router.post("/connect", auth, async (req, res) => {
  try {
    const { userId, teamId, teamPass } = req.body;

    if (appState.teams[teamId].users.indexOf(userId) === -1) {
      if (!appState.teams[teamId].teamPass) {
        appState.teams[teamId].users.push(userId);
        res.status(200).json({ teams: getUserTeams(userId) });
      }

      if (await bcrypt.compare(teamPass, appState.teams[teamId].teamPass)) {
        appState.teams[teamId].users.push(userId);
        res.status(200).json({ teams: getUserTeams(userId) });
      } else {
        res.status(403).json({ message: "Неверный пароль!" });
      }
    } else {
      res.status(200).json({ message: "Пользователь уже в команде!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
