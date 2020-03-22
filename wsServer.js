const WebSocket = require("ws");
const appState = require("./state");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const server = new WebSocket.Server({
  port: 3001
});

server.on("connection", ws => {
  ws.on("message", async data => {
    const jsonData = JSON.parse(data);
    const userId = jwt.decode(jsonData.token).userId;
    switch (jsonData.method) {
      case "CONNECT_TO_TEAM":
        if (!ws.userId) {
          if (appState.teams.hasOwnProperty(jsonData.teamId)) {
            const user = await User.findOne({ _id: userId });
            if (user) {
              appState.users[userId] = { userName: user.userName };
              ws.userId = userId;
              appState.teams[jsonData.teamId].users.push(userId);
              ws.send("done");
            }
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
              const results = {
                status: "voting",
                users: []
              };
              for (user of appState.teams[teamId].users) {
                if (appState.teams[teamId].owner == user) {
                  results.users.push({
                    name: appState.users[userId].userName,
                    status: "waiting",
                    owner: true
                  });
                  continue;
                }
                if (appState.teams[teamId].users.indexOf(user) !== -1) {
                  results.users.push({
                    name: appState.users[userId].userName,
                    status: "waiting"
                  });
                }
              }
              server.clients.forEach(wsc => {
                //уведомляем пользователей
                if (
                  appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
                  appState.teams[teamId].owner == wsc.userId
                ) {
                  wsc.send(JSON.stringify(results));
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
                  const results = {
                    status: "waiting",
                    users: []
                  };
                  for (user of appState.teams[teamId].users) {
                    if (appState.teams[teamId].owner == user) {
                      results.users.push({
                        name: appState.users[userId].userName,
                        status:
                          appState.teams[teamId].results[user] || "waiting",
                        owner: true
                      });
                      continue;
                    }
                    if (appState.teams[teamId].users.indexOf(user) !== -1) {
                      results.users.push({
                        name: appState.users[userId].userName,
                        status:
                          appState.teams[teamId].results[user] || "waiting"
                      });
                    }
                  }
                  wsc.send(JSON.stringify(results));
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
                  const results = {
                    status: "voting",
                    users: []
                  };
                  for (user of appState.teams[teamId].users) {
                    if (appState.teams[teamId].owner == user) {
                      results.users.push({
                        name: appState.users[userId].userName,
                        status:
                          appState.teams[teamId].results[user] || "waiting",
                        owner: true
                      });
                      continue;
                    }
                    if (appState.teams[teamId].users.indexOf(user) !== -1) {
                      results.users.push({
                        name: appState.users[userId].userName,
                        status:
                          appState.teams[teamId].results[user] || "waiting"
                      });
                    }
                  }
                  wsc.send(JSON.stringify(results));
                }
              });
            }
          }
        } else {
          ws.send("wrong team");
        }
        break;
    }
    // server.clients.forEach(wsc => {
    //   console.log(wsc.userId);
    // });
  });
});

module.exports = server;
