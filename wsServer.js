const WebSocket = require("ws");
const appState = require("./state");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const config = require("config");

const combineResults = (teamId, userId) => {
  const results = {
    status: appState.teams[teamId].status,
    users: []
  };
  for (user of appState.teams[teamId].users) {
    let status;
    if (isLeader(teamId, userId)) {
      status = appState.teams[teamId].results[user]
        ? appState.teams[teamId].results[user]
        : "waiting";
    } else {
      status = appState.teams[teamId].results[user] ? "voted" : "waiting";
    }
    if (isLeader(teamId, user)) {
      results.users.push({
        name: appState.users[user].userName,
        status,
        owner: true
      });
      continue;
    }
    if (appState.teams[teamId].users.indexOf(user) !== -1) {
      results.users.push({
        name: appState.users[user].userName,
        status
      });
    }
  }
  return results;
};

const teamExist = teamId => {
  if (appState.teams.hasOwnProperty(teamId)) {
    return true;
  }
  return false;
};

const userInTeam = (teamId, userId) => {
  if (appState.teams[teamId].users.indexOf(userId) !== -1) {
    return true;
  }
  return false;
};

const isLeader = (teamId, userId) => {
  if (appState.teams[teamId].owner === userId) {
    return true;
  }
  return false;
};

const isWaiting = teamId => {
  if (appState.teams[teamId].status === "waiting") {
    return true;
  }
  return false;
};

const isVoting = teamId => {
  if (appState.teams[teamId].status === "voting") {
    return true;
  }
  return false;
};

const resetTeamState = teamId => {
  appState.teams[teamId].status = "voting";
  appState.teams[teamId].results = {};
};

const server = new WebSocket.Server({
  port: 3001
});

server.on("connection", ws => {
  ws.on("message", async data => {
    const jsonData = JSON.parse(data);
    try {
      const userId = await jwt.verify(jsonData.token, config.get("jwtSecret"))
        .userId;
      if (!userId) {
        ws.close(1003, "User not logged in");
      }

      switch (jsonData.method) {
        case "CONNECT_TO_TEAM":
          if (!ws.userId) {
            if (teamExist(jsonData.teamId)) {
              if (isWaiting(jsonData.teamId)) {
                const user = await User.findOne({ _id: userId });
                if (user) {
                  if (!userInTeam(jsonData.teamId, userId)) {
                    appState.users[userId] = { userName: user.userName };
                    appState.teams[jsonData.teamId].users.push(userId);
                    ws.userId = userId;
                    ws.send("Done");
                  } else {
                    ws.close(1003, "Double login!");
                  }
                }
              } else {
                ws.close(1003, 'User can connect only on "waiting" phase');
              }
            } else {
              ws.close(1003, "Wrong team!");
            }
          }
          break;
        case "START_VOTING":
          if (teamExist(jsonData.teamId)) {
            const { teamId } = jsonData;
            if (isLeader(teamId, userId)) {
              if (isWaiting(teamId)) {
                resetTeamState(teamId);
                server.clients.forEach(wsc => {
                  if (
                    userInTeam(teamId, wsc.userId) ||
                    isLeader(teamId, wsc.userId)
                  ) {
                    wsc.send(JSON.stringify(combineResults(teamId, userId)));
                  }
                });
              }
            }
          } else {
            ws.send("Wrong team!");
          }
          break;
        case "STOP_VOTING":
          if (teamExist(jsonData.teamId)) {
            const { teamId } = jsonData;
            if (appState.teams[teamId].owner == userId) {
              if (isVoting(teamId)) {
                appState.teams[teamId].status = "waiting";
                server.clients.forEach(wsc => {
                  if (
                    userInTeam(teamId, wsc.userId) ||
                    isLeader(teamId, wsc.userId)
                  ) {
                    wsc.send(JSON.stringify(combineResults(teamId, userId)));
                  }
                });
              }
            }
          } else {
            ws.send("Wrong team!");
          }
          break;
        case "SET_VOTE_VALUE":
          if (teamExist(jsonData.teamId)) {
            const { teamId, voteValue } = jsonData;
            if (isVoting(teamId)) {
              if (!appState.teams[teamId].results[userId]) {
                appState.teams[teamId].results[userId] = voteValue;
                server.clients.forEach(wsc => {
                  if (
                    userInTeam(teamId, wsc.userId) ||
                    isLeader(teamId, wsc.userId)
                  ) {
                    wsc.send(
                      JSON.stringify(combineResults(teamId, wsc.userId))
                    );
                  }
                });
              }
            }
          } else {
            ws.send("Wrong team!");
          }
          break;
      }
    } catch (TokenExpiredError) {
      ws.close(1003, "User not logged in");
    }
  });

  ws.on("close", () => {
    for (team in appState.teams) {
      if (appState.teams[team].users.indexOf(ws.userId) !== -1) {
        const index = appState.teams[team].users.indexOf(ws.userId);
        appState.teams[team].users.splice(index, 1);
      }
    }
  });
});

module.exports = server;
