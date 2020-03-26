const WebSocket = require("ws");
const appState = require("./state");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const config = require("config");
const bcrypt = require("bcryptjs");

const combineResults = (teamId, userId) => {
  const results = {
    status: appState.teams[teamId].status,
    users: []
  };
  for (user of appState.teams[teamId].users) {
    let status;
    if (results.status === "voting") {
      if (isLeader(teamId, userId)) {
        status = appState.teams[teamId].results[user]
          ? appState.teams[teamId].results[user]
          : "waiting";
      } else {
        status = appState.teams[teamId].results[user] ? "voted" : "waiting";
      }
    } else {
      status = appState.teams[teamId].results[user]
        ? appState.teams[teamId].results[user]
        : "waiting";
    }
    if (isLeader(teamId, user)) {
      results.users.push({
        userId: user,
        name: appState.users[user].userName,
        status,
        owner: true
      });
      continue;
    }
    if (appState.teams[teamId].users.indexOf(user) !== -1) {
      results.users.push({
        userId: user,
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

const isPasswordCorrect = (teamId, password, userId) => {
  if (appState.teams[teamId].teamPass) {
    if (appState.teams[teamId].loggedUsers.indexOf(userId) !== -1) {
      return true;
    }
    try {
      const result = bcrypt.compareSync(
        password,
        appState.teams[teamId].teamPass
      );
      return result;
    } catch (error) {
      return false;
    }
  } else {
    return true;
  }
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

const isVotingComplete = teamId => {
  for (user of appState.teams[teamId].users) {
    if (!appState.teams[teamId].results[user]) {
      return false;
    }
  }
  return true;
};

const setVoteComplete = teamId => {
  appState.teams[teamId].status = "waiting";
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
            const { teamId, password } = jsonData;
            if (teamExist(teamId)) {
              if (isWaiting(teamId)) {
                if (isPasswordCorrect(teamId, password, userId)) {
                  const user = await User.findOne({ _id: userId });
                  if (user) {
                    if (!userInTeam(teamId, userId)) {
                      appState.users[userId] = { userName: user.userName };
                      appState.teams[teamId].users.push(userId);
                      appState.teams[teamId].loggedUsers.push(userId);
                      ws.userId = userId;
                      ws.send(JSON.stringify(combineResults(teamId, userId)));
                      server.clients.forEach(wsc => {
                        if (
                          userInTeam(teamId, wsc.userId) ||
                          isLeader(teamId, wsc.userId)
                        ) {
                          wsc.send(
                            JSON.stringify(combineResults(teamId, userId))
                          );
                        }
                      });
                    } else {
                      ws.close(1003, "Double login!");
                    }
                  }
                } else {
                  ws.close(1003, "Wrong password!");
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
            ws.send(JSON.stringify({ message: "Wrong team!" }));
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

                if (isVotingComplete(teamId)) {
                  setVoteComplete(teamId);
                }

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
      if (userInTeam(team, ws.userId)) {
        const index = appState.teams[team].users.indexOf(ws.userId);
        appState.teams[team].users.splice(index, 1);
        if (isVotingComplete(team)) {
          setVoteComplete(team);
          server.clients.forEach(wsc => {
            if (userInTeam(team, wsc.userId) || isLeader(team, wsc.userId)) {
              wsc.send(JSON.stringify(combineResults(team, wsc.userId)));
            }
          });
        } else {
          server.clients.forEach(wsc => {
            if (userInTeam(team, wsc.userId) || isLeader(team, wsc.userId)) {
              wsc.send(JSON.stringify(combineResults(team, wsc.userId)));
            }
          });
        }
      }
    }
  });
});

module.exports = server;
