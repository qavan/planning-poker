const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const app = express();
const wsServer = require("./wsServer");
const appState = require("./state");
const Team = require("./models/Team");

app.use(express.json({ extended: true }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/teams", require("./routes/teams.routes"));

const PORT = config.get("port") || 5000;

async function start() {
  try {
    await mongoose.connect(config.get("mongoUri"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    app.listen(PORT, async () => {
      const result = await Team.find({ active: true });
      result.map(item => {
        appState.teams[item._id] = {
          owner: item.owner,
          teamName: item.teamName,
          teamPass: item.teamPass,
          users: [],
          loggedUsers: item.loggedUsers.users,
          status: "waiting",
          results: {},
          theme: null
        };
      });
      console.log(`App has been started on port ${PORT}!`);
    });
  } catch (error) {
    console.log(`Server error: ${error.message}`);
    process.exit(1);
  }
}

start();
