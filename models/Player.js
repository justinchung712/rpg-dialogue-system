const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true }, // Unique player identifier
  name: { type: String, required: true }, // Player must enter a name
  history: { type: [String], default: [] }, // Stores player choice history
  currentDialogueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dialogue",
    required: true,
  }, // Tracks where the player is
});

module.exports = mongoose.model("Player", playerSchema);
