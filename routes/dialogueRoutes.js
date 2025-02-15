const express = require("express");
const router = express.Router();
const Dialogue = require("../models/Dialogue");

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

module.exports = router;
