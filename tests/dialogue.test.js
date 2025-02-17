const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../server");
const Player = require("../models/Player");

let testPlayerId;

beforeEach(async () => {
  // Generate a unique test player ID for each test
  testPlayerId = `test_player_${new mongoose.Types.ObjectId().toString()}`;

  // Create a fresh player before each test
  const res = await request(server).post("/api/players/create").send({
    playerId: testPlayerId,
    name: "Test Player",
    startDialogueId: "67b1266d68009a310052a372", // Starting dialogue ID
  });

  if (res.status !== 200) {
    console.error("Failed to create test player:", res.body);
  }

  console.log(`Created test player: ${testPlayerId}`);
});

afterEach(async () => {
  // Delete the player after each test to clean up the database
  await Player.deleteOne({ playerId: testPlayerId });

  console.log(`Deleted test player: ${testPlayerId}`);
});

afterAll(async () => {
  await mongoose.connection.close(); // Closes the database connection
  await server.close(); // Stops the server (if applicable)
});

describe("Dialogue System API Tests", () => {
  it("Should create a new player", async () => {
    const newPlayerId = `new_test_${new mongoose.Types.ObjectId().toString()}`;

    const res = await request(server).post("/api/players/create").send({
      playerId: newPlayerId,
      name: "New Test Player",
      startDialogueId: "67b1266d68009a310052a372",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Player created successfully");
    expect(res.body.player).toHaveProperty("playerId", newPlayerId);
  });

  it("Should fetch the created player's progress", async () => {
    const res = await request(server).get(`/api/players/${testPlayerId}`);

    expect(res.status).toBe(200);
    expect(res.body.playerId).toBe(testPlayerId);
  });

  it("Should select a dialogue choice and update progress", async () => {
    const res = await request(server)
      .post(`/api/dialogues/choose/67b1266d68009a310052a372`)
      .send({ playerId: testPlayerId, choiceId: "67b1416c8f31a68a265f521a" });

    expect(res.status).toBe(200);
    expect(res.body.playerHistory).toContain("67b1416c8f31a68a265f521a");
  });

  it("Should return 403 for a choice that doesn't meet conditions", async () => {
    await request(server)
      .post(`/api/dialogues/choose/67b1266d68009a310052a372`)
      .send({ playerId: testPlayerId, choiceId: "67b1416c8f31a68a265f521b" });

    await request(server)
      .post(`/api/dialogues/choose/67b999999999999999999999`)
      .send({ playerId: testPlayerId, choiceId: "67b2cc871407f7f1e822f198" });

    const res = await request(server)
      .post(`/api/dialogues/choose/67b128bf40b12a8fe2e43900`)
      .send({ playerId: testPlayerId, choiceId: "67b14c2ce702382f1e40300b" });

    expect(res.status).toBe(403);
  });

  it("Should list all players (for debugging)", async () => {
    const res = await request(server).get("/api/players");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
