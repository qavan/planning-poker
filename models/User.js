const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  teams: [
    {
      type: Types.ObjectId,
      ref: "Team"
    }
  ]
});

module.exports = model("User", schema);
