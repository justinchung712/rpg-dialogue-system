const express = require("express");
const router = express.Router();
const Dialogue = require("../models/Dialogue");
const Player = require("../models/Player");

// Get all dialogues
router.get("/", async (req, res) => {
  try {
    const dialogues = await Dialogue.find();
    res.json(dialogues);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get dialogue by ID
router.get("/:id", async (req, res) => {
  try {
    const dialogue = await Dialogue.findById(req.params.id);
    if (!dialogue)
      return res.status(404).json({ message: "Dialogue not found" });
    res.json(dialogue);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Add new dialogue node
router.post("/", async (req, res) => {
  try {
    const newDialogue = new Dialogue(req.body);
    await newDialogue.save();
    res.status(201).json(newDialogue);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get next dialogue based on player choice
router.get("/next/:choiceId", async (req, res) => {
  try {
    const dialogue = await Dialogue.findOne({
      "choices._id": req.params.choiceId,
    });
    if (!dialogue) return res.status(404).json({ message: "Choice not found" });

    const choice = dialogue.choices.id(req.params.choiceId);
    if (!choice.nextDialogueId)
      return res.json({ message: "End of conversation" });

    const nextDialogue = await Dialogue.findById(choice.nextDialogueId);
    res.json(nextDialogue);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/choose/:dialogueId", async (req, res) => {
  try {
    const { playerId, choiceId } = req.body;

    // Find player
    let player = await Player.findOne({ playerId });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Find current dialogue
    const currentDialogue = await Dialogue.findById(player.currentDialogueId);
    if (!currentDialogue)
      return res.status(404).json({ message: "Dialogue not found" });

    // Find selected choice
    const selectedChoice = currentDialogue.choices.id(choiceId);
    if (!selectedChoice)
      return res.status(400).json({ message: "Invalid choice" });

    // Check conditions
    if (
      selectedChoice.condition &&
      selectedChoice.condition.requiredPreviousChoiceId
    ) {
      if (
        !player.history.includes(
          selectedChoice.condition.requiredPreviousChoiceId
        )
      ) {
        return res
          .status(403)
          .json({ message: "You do not meet the conditions for this choice." });
      }
    }

    // Update player history
    player.history.push(choiceId);

    // Update current dialogue ID
    player.currentDialogueId =
      selectedChoice.nextDialogueId || player.currentDialogueId;

    await player.save(); // Save progress

    // Retrieve the next dialogue node
    if (!selectedChoice.nextDialogueId) {
      return res.json({
        message: "End of conversation",
        playerHistory: player.history,
      });
    }

    const nextDialogue = await Dialogue.findById(selectedChoice.nextDialogueId);
    res.json({ nextDialogue, playerHistory: player.history });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Update dialogue node (modify choices, text, etc.)
router.put("/:id", async (req, res) => {
  try {
    const updatedDialogue = await Dialogue.findByIdAndUpdate(
      req.params.id, // Find dialogue by ID
      req.body, // Update with request body
      { new: true } // Return updated document
    );

    if (!updatedDialogue) {
      return res.status(404).json({ message: "Dialogue not found" });
    }

    res.json(updatedDialogue);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
