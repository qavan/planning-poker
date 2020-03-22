const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const app = express();
const wsServer = require("./wsServer");

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

//TOOD: disconnect not authenticated users
//TOOD: connect only on "waiting" phase
//TOOD: catch errors
//TODO: put combine results to another function

start();
