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
    if (appState.teams[teamId].owner == user) {
      results.users.push({
        name: appState.users[user].userName,
        // status: appState.teams[teamId].results[user]
        //   ? appState.teams[teamId].owner == userId
        //     ? appState.teams[teamId].results[user]
        //     : "voted"
        //   : "waiting",
        status: appState.teams[teamId].results[user] || "waiting",
        owner: true
      });
      continue;
    }
    if (appState.teams[teamId].users.indexOf(user) !== -1) {
      results.users.push({
        name: appState.users[user].userName,
        status: appState.teams[teamId].results[user] || "waiting"
        // status: appState.teams[teamId].results[user]
        //   ? appState.teams[teamId].owner == userId
        //     ? appState.teams[teamId].results[user]
        //     : "voted"
        //   : "waiting"
      });
    }
  }
  return results;
};

const server = new WebSocket.Server({
  port: 3001
});

server.on("connection", ws => {
  ws.on("message", async data => {
    const jsonData = JSON.parse(data);
    const userId = await jwt.verify(jsonData.token, config.get("jwtSecret"))
      .userId;
    if (!userId) {
      ws.close();
    }
    switch (jsonData.method) {
      case "CONNECT_TO_TEAM":
        if (!ws.userId) {
          if (appState.teams.hasOwnProperty(jsonData.teamId)) {
            const user = await User.findOne({ _id: userId });
            if (user) {
              if (
                appState.teams[jsonData.teamId].users.indexOf(userId) === -1
              ) {
                appState.users[userId] = { userName: user.userName };
                ws.userId = userId;
                appState.teams[jsonData.teamId].users.push(userId);
                ws.send("done");
              } else {
                ws.send("double login");
                ws.close();
              }
            }
          } else {
            ws.send("wrong team");
            ws.close();
          }
        }
        break;
      case "START_VOTING":
        if (appState.teams.hasOwnProperty(jsonData.teamId)) {
          const { teamId } = jsonData;
          if (appState.teams[teamId].owner == userId) {
            //проверка на лидера команды
            if (appState.teams[teamId].status != "voting") {
              //проверка на текущий статус
              appState.teams[teamId].status = "voting"; //устанавливаем статус
              appState.teams[teamId].results = {}; //сбрасываем результаты
              server.clients.forEach(wsc => {
                //уведомляем пользователей
                if (
                  appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
                  appState.teams[teamId].owner == wsc.userId
                ) {
                  wsc.send(JSON.stringify(combineResults(teamId, userId)));
                }
              });
            }
          }
        } else {
          ws.send("wrong team");
        }
        break;
      case "STOP_VOTING":
        if (appState.teams.hasOwnProperty(jsonData.teamId)) {
          const { teamId } = jsonData;
          if (appState.teams[teamId].owner == userId) {
            if (appState.teams[teamId].status != "waiting") {
              appState.teams[teamId].status = "waiting";
              server.clients.forEach(wsc => {
                if (
                  appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
                  appState.teams[teamId].owner == wsc.userId
                ) {
                  wsc.send(JSON.stringify(combineResults(teamId, userId)));
                }
              });
            }
          }
        } else {
          ws.send("wrong team");
        }
        break;
      case "SET_VOTE_VALUE":
        if (appState.teams.hasOwnProperty(jsonData.teamId)) {
          const { teamId, voteValue } = jsonData;
          if (appState.teams[teamId].status == "voting") {
            if (!appState.teams[teamId].results[userId]) {
              appState.teams[teamId].results[userId] = voteValue;
              server.clients.forEach(wsc => {
                if (
                  appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
                  appState.teams[teamId].owner == wsc.userId
                ) {
                  wsc.send(JSON.stringify(combineResults(teamId, userId)));
                }
              });
            }
          }
        } else {
          ws.send("wrong team");
        }
        break;
    }
  });
});

module.exports = server;
