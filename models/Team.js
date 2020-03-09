const { Schema, model } = require("mongoose");

const schema = new Schema({
  teamOwner: {
    type: String,
    required: true
  },
  teamName: {
    type: String,
    required: true,
    unique: true
  },
  teamPass: {
    type: String
  }
});

module.exports = model("Team", schema);
