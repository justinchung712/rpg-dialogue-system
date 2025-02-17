const express = require("express");
const router = express.Router();
const Player = require("../models/Player"); // Import Player model

// Get all players (for testing purposes)
router.get("/", async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Create a new player
router.post("/create", async (req, res) => {
  try {
    const { playerId, name, startDialogueId } = req.body;

    if (!playerId || !name || !startDialogueId) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingPlayer = await Player.findOne({ playerId });
    if (existingPlayer) {
      console.error("Player already exists:", playerId);
      return res.status(400).json({ message: "Player already exists." });
    }

    const newPlayer = new Player({
      playerId,
      name,
      history: [],
      currentDialogueId: startDialogueId,
    });
    await newPlayer.save();

    console.log("Player created:", newPlayer);
    res.json({ message: "Player created successfully", player: newPlayer });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get player progress by playerId
router.get("/:playerId", async (req, res) => {
  try {
    const player = await Player.findOne({ playerId: req.params.playerId });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(player);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
