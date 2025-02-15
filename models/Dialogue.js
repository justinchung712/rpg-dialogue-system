const mongoose = require("mongoose");

const DialogueSchema = new mongoose.Schema({
  npcName: { type: String, required: true }, // Name of the NPC speaking
  text: { type: String, required: true }, // Dialogue line
  choices: [
    // Possible player responses
    {
      text: String, // The player's choice text
      nextDialogueId: mongoose.Schema.Types.ObjectId, // Next dialogue (if applicable)
      condition: {
        // Optional condition to show this choice
        requiredPreviousChoiceId: mongoose.Schema.Types.ObjectId, // Choice player must have made
      },
    },
  ],
  isEnding: { type: Boolean, default: false }, // Marks if this is the end of a conversation
});

module.exports = mongoose.model("Dialogue", DialogueSchema);
