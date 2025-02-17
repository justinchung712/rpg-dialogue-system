require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json()); // Allows JSON body parsing

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("RPG Dialogue System API is running...");
});

const dialogueRoutes = require("./routes/dialogueRoutes");
app.use("/api/dialogues", dialogueRoutes);

const playerRoutes = require("./routes/playerRoutes");
app.use("/api/players", playerRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
