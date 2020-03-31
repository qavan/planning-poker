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
        teamName: appState.teams[teamId].teamName,
        teamStatus: appState.teams[teamId].status,
        accessType: appState.teams[teamId].teamPass ? "password" : "open"
      });
      continue;
    }
    if (appState.teams[teamId].loggedUsers.indexOf(userId) !== -1) {
      result.teamUser.push({
        teamId,
        teamName: appState.teams[teamId].teamName,
        teamStatus: appState.teams[teamId].status,
        accessType: appState.teams[teamId].teamPass ? "password" : "open"
      });
      continue;
    }
    result.otherTeams.push({
      teamId,
      teamName: appState.teams[teamId].teamName,
      teamStatus: appState.teams[teamId].status,
      accessType: appState.teams[teamId].teamPass ? "password" : "open"
    });
  }

  return result;
};

// /api/teams/create
router.post("/create", auth, async (req, res) => {
  try {
    const { teamName, teamPass } = req.body;
    const userId = req.userId;

    let teamId = shortid.generate();
    while (appState.teams.teamId) {
      teamId = shortid.generate();
    }

    let password = teamPass ? await bcrypt.hash(teamPass, 12) : "";

    appState.teams[teamId] = {
      owner: userId,
      teamName,
      teamPass: password,
      users: [],
      loggedUsers: [],
      status: "waiting",
      results: {},
      theme: null
    };

    appState.teams[teamId].loggedUsers.push(userId);
    res.status(200).json({ message: "Команда создана!" });
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
});

// /api/teams/
router.get("/", auth, async (req, res) => {
  try {
    // const { userId } = req.body;
    const userId = req.userId;

    const result = getUserTeams(userId);

    res.status(200).json({ teams: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

// /api/teams/check
router.post("/check", auth, async (req, res) => {
  try {
    const { teamId, teamPass } = req.body;
    const userId = req.userId;

    if (appState.teams[teamId].loggedUsers.indexOf(userId) === -1) {
      if (!appState.teams[teamId].teamPass) {
        res.status(200).json({ message: "Команда без пароля" });
      }

      if (await bcrypt.compare(teamPass, appState.teams[teamId].teamPass)) {
        appState.teams[teamId].loggedUsers.push(userId);
        res.status(200).json({ message: "Успешный вход" });
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

// /api/teams/delete
router.post("/delete", auth, async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.userId;

    if (appState.teams[teamId].owner === userId) {
      if (!appState.teams[teamId].users.length) {
        delete appState.teams[teamId];
        res.status(200).json({ message: "Команда удалена" });
      } else {
        res
          .status(403)
          .json({
            message: "Невозможно удалить команду, пока в ней есть пользователи!"
          });
      }
    } else {
      res.status(403).json({ message: "Недостаточно прав!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
