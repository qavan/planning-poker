const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  teamName: {
    type: String,
    required: true
  },
  teamId: {
    type: Types.ObjectId,
    ref: "Team",
    required: true
  },
  theme: {
    type: String,
    required: false
  },
  average: {
    type: Number,
    required: true
  },
  results: {
    users: [
      {
        userName: {
          type: String,
          required: true
        },
        userId: {
          type: Types.ObjectId,
          ref: "User",
          required: true
        },
        value: {
          type: Number,
          required: false
        }
      }
    ]
  },
  date: { type: Date, default: Date.now }
});

module.exports = model("Result", schema);
