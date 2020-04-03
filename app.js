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
app.use("/api/results", require("./routes/results.routes"));

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = 80;

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
          theme: "Не указана"
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
