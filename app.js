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
    const jsonData = JSON.parse(data, true);
    console.log(jsonData);
    switch (jsonData.method) {
      case "SET_USER_ID":
        ws.userId = jsonData.id;
        ws.send("done");
        break;
      case "START_VOTING":
        const { teamId, userId } = jsonData;
        if (
          appState.teams[teamId].owner == userId &&
          appState.teams[teamId].status != "voting"
        ) {
          appState.teams[teamId].status = "voting";
          server.clients.forEach(wsc => {
            if (
              appState.teams[teamId].users.indexOf(wsc.userId) !== -1 ||
              appState.teams[teamId].owner == wsc.userId
            ) {
              wsc.send(
                JSON.stringify({
                  status: "voting"
                  //TODO: send current state
                })
              );
            }
          });
        }
        break;
      case "STOP_VOTING":
        break;
      case "SET_VOTE_VALUE":
        break;
    }
    server.clients.forEach(wsc => {
      console.log(wsc.userId);
    });
  });
});

start();
