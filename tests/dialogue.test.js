const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../server");
const Player = require("../models/Player");
const Dialogue = require("../models/Dialogue");

let testPlayerId;
let testDialogueId;
let testChoiceId;

beforeEach(async () => {
  // Generate unique test IDs
  testPlayerId = `test_player_${new mongoose.Types.ObjectId().toString()}`;
  testDialogueId = new mongoose.Types.ObjectId().toString();
  testChoiceId = new mongoose.Types.ObjectId().toString();

  // Create a new dialogue node for testing
  const dialogueRes = await request(server)
    .post("/api/dialogues")
    .send({
      _id: testDialogueId,
      npcName: "Test NPC",
      text: "This is a test dialogue.",
      choices: [
        { text: "Test Choice", nextDialogueId: null, _id: testChoiceId },
      ],
      isEnding: false,
    });

  if (dialogueRes.status !== 201) {
    console.error("Failed to create test dialogue:", dialogueRes.body);
  }

  // Create a fresh test player
  const playerRes = await request(server).post("/api/players/create").send({
    playerId: testPlayerId,
    name: "Test Player",
    startDialogueId: testDialogueId,
  });

  if (playerRes.status !== 200) {
    console.error("Failed to create test player:", playerRes.body);
  }

  console.log(`Created test player: ${testPlayerId}`);
});

afterEach(async () => {
  // Clean up test data after each test
  await Player.deleteOne({ playerId: testPlayerId });
  await Dialogue.deleteOne({ _id: testDialogueId });

  console.log(`Deleted test player: ${testPlayerId}`);
  console.log(`Deleted test dialogue: ${testDialogueId}`);
});

afterAll(async () => {
  await mongoose.connection.close();
  await server.close();
});

describe("Player API Tests", () => {
  it("Should create a new player", async () => {
    const newPlayerId = `new_test_${new mongoose.Types.ObjectId().toString()}`;

    const res = await request(server).post("/api/players/create").send({
      playerId: newPlayerId,
      name: "New Test Player",
      startDialogueId: testDialogueId,
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

  it("Should list all players", async () => {
    const res = await request(server).get("/api/players");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("Dialogue API Tests", () => {
  it("Should fetch all dialogues", async () => {
    const res = await request(server).get("/api/dialogues");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("Should fetch a specific dialogue by ID", async () => {
    const res = await request(server).get(`/api/dialogues/${testDialogueId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(testDialogueId);
  });

  it("Should create a new dialogue node", async () => {
    const newDialogueId = new mongoose.Types.ObjectId().toString();

    const res = await request(server).post("/api/dialogues").send({
      _id: newDialogueId,
      npcName: "New NPC",
      text: "Another test dialogue.",
      choices: [],
      isEnding: false,
    });

    expect(res.status).toBe(201);
    expect(res.body._id).toBe(newDialogueId);
  });

  it("Should update an existing dialogue node", async () => {
    const res = await request(server)
      .put(`/api/dialogues/${testDialogueId}`)
      .send({ text: "Updated dialogue text." });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Updated dialogue text.");
  });

  it("Should retrieve the next dialogue node based on a choice", async () => {
    const res = await request(server).get(
      `/api/dialogues/next/${testChoiceId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("End of conversation"); // Since nextDialogueId is null
  });

  it("Should select a dialogue choice and update player progress", async () => {
    const res = await request(server)
      .post(`/api/dialogues/choose/${testDialogueId}`)
      .send({ playerId: testPlayerId, choiceId: testChoiceId });

    expect(res.status).toBe(200);
    expect(res.body.playerHistory).toContain(testChoiceId);
  });

  it("Should return 403 for a choice that doesn't meet conditions", async () => {
    // Create a dialogue choice that requires a previous selection
    const restrictedChoiceId = new mongoose.Types.ObjectId().toString();

    const dialogueWithConditionRes = await request(server)
      .post("/api/dialogues")
      .send({
        npcName: "Test NPC",
        text: "You can only choose this if you've made the correct choice earlier.",
        choices: [
          {
            _id: restrictedChoiceId,
            text: "Restricted Choice",
            nextDialogueId: null,
            condition: { requiredPreviousChoiceId: testChoiceId },
          },
        ],
        isEnding: false,
      });

    const restrictedDialogueId = dialogueWithConditionRes.body._id;

    // Attempt to choose a restricted option without required history
    const res = await request(server)
      .post(`/api/dialogues/choose/${restrictedDialogueId}`)
      .send({ playerId: testPlayerId, choiceId: restrictedChoiceId });

    expect(res.status).toBe(403);
  });
});
