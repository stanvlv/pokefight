const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  nickname: { type: String, required: true },
  games_played: { type: Number, required: true },
  games_won: { type: Number, required: true },
  games_lost: { type: Number, required: true },
});

module.exports = mongoose.model("Users", usersSchema);
