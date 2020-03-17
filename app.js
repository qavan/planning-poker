const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const WebSocket = require("ws");
const appState = require("./state");

const app = express();

app.use(express.json({ extended: true }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/teams", require("./routes/teams.routes"));

const PORT = config.get("port") || 3000;

async function start() {
  try {
    await mongoose.connect(config.get("mongoUri"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    app.listen(PORT, () => {
      console.log(`App has been started on port ${PORT}!`);
    });
  } catch (error) {
    console.log(`Server error: ${error.message}`);
    process.exit(1);
  }
}

const server = new WebSocket.Server({
  port: 3001
});

server.on("connection", ws => {
  ws.on("message", data => {
    const jsonData = JSON.parse(data);
    console.log(jsonData);
    switch (jsonData.method) {
      case "SET_USER_ID":
        ws.userId = jsonData.id;
        ws.send("done");
        break;
      case "START_VOTING":
        if (appState.teams[jsonData.teamId].owner == jsonData.userId) {
          //проверка на лидера команды
          if (appState.teams[jsonData.teamId].status != "voting") {
            //проверка на текущий статус
            appState.teams[jsonData.teamId].status = "voting"; //устанавливаем статус
            appState.teams[jsonData.teamId].results = {}; //сбрасываем результаты
            server.clients.forEach(wsc => {
              //уведомляем пользователей
              if (
                appState.teams[jsonData.teamId].users.indexOf(wsc.userId) !==
                  -1 ||
                appState.teams[jsonData.teamId].owner == wsc.userId
              ) {
                wsc.send(
                  JSON.stringify({
                    status: "voting",
                    state: appState.teams[jsonData.teamId]
                    //TODO: send current state
                  })
                );
              }
            });
          }
        }
        break;
      case "STOP_VOTING":
        if (appState.teams[jsonData.teamId].owner == jsonData.userId) {
          const { teamId, userId } = jsonData;
          if (appState.teams[teamId].status != "end") {
            appState.teams[teamId].status = "end";
            server.clients.forEach(wsc => {
              if (
                appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
                appState.teams[teamId].owner == wsc.userId
              ) {
                wsc.send(
                  JSON.stringify({
                    status: "end",
                    state: appState.teams[teamId]
                    //TODO: save to db
                  })
                );
              }
            });
          }
        }
        break;
      case "SET_VOTE_VALUE":
        if (appState.teams[jsonData.teamId].status != "end") {
          const { teamId, userId, voteValue } = jsonData;
          if (!appState.teams[teamId].results[userId]) {
            appState.teams[teamId].results[userId] = voteValue;
            server.clients.forEach(wsc => {
              if (
                appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
                appState.teams[teamId].owner == wsc.userId
              ) {
                wsc.send(
                  JSON.stringify({
                    status: "voting",
                    state: appState.teams[teamId]
                    //TODO: send current state
                  })
                );
              }
            });
          }
        }
        break;
    }
    server.clients.forEach(wsc => {
      console.log(wsc.userId);
    });
  });
});

start();
