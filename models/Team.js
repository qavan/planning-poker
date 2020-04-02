const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  teamName: {
    type: String,
    required: true
  },
  teamPass: {
    type: String,
    required: false
  },
  owner: {
    type: String,
    required: true
  },
  loggedUsers: {
    users: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true
      }
    ]
  },
  active: {
    type: Boolean,
    required: true
  }
});

module.exports = model("Team", schema);
