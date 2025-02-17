# RPG Dialogue System

A backend system for managing dynamic RPG-style dialogues with conditional choices.

## Features

- Supports NPC dialogues with multiple choices.
- Implements conditional choices that require previous selections.
- Tracks player choices to enable branching dialogue paths.
- Persists conversation state for ongoing interactions.
- RESTful API endpoints for managing dialogues and player data.
- Automated tests using Jest and Supertest.

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose ODM)
- Testing: Jest, Supertest
- Other Tools: Postman (API testing)

## Project Structure

```
rpg-dialogue-system
│── models/               # Mongoose schemas (Player, Dialogue)
│── routes/               # Express API routes
│── tests/                # Automated Jest tests
│── server.js             # Main entry point
│── README.md             # Project documentation
│── package.json          # Dependencies and scripts
```

## Setup & Installation

1. Clone the repository:
   ```
   git clone https://github.com/justinchung712/rpg-dialogue-system.git
   cd rpg-dialogue-system
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file and configure your MongoDB URI:
   ```
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Run tests:
   ```
   npm test
   ```

## API Endpoints

### Players

- `POST /api/players/create` → Creates a new player.
- `GET /api/players/:playerId` → Fetches player progress.
- `GET /api/players` → Lists all players.

### Dialogue

- `GET /api/dialogues` → Fetches all dialogues.
- `GET /api/dialogues/:dialogueId` → Fetches a specific dialogue by ID.
- `POST /api/dialogues` → Creates a new dialogue node.
- `PUT /api/dialogues/:dialogueId` → Updates an existing dialogue node (text, choices, etc.).
- `GET /api/dialogues/next/:choiceId` → Retrieves the next dialogue node based on a given choice.
- `POST /api/dialogues/choose/:dialogueId` → Selects a choice in a dialogue, updates player history, and advances the conversation.

## Example API Requests (Using cURL)

### Create a Player

```
curl -X POST http://localhost:5050/api/players/create \
     -H "Content-Type: application/json" \
     -d '{"playerId": "player123", "name": "Hero", "startDialogueId": "abc123xyz"}'
```

- `POST`: Creates a new player.
- `playerId`: A unique identifier for the player.
- `name`: The player's display name.
- `startDialogueId`: The dialogue node where the conversation begins.

### Select a Dialogue Choice

```
curl -X POST http://localhost:5050/api/dialogues/choose/abc123xyz \
     -H "Content-Type: application/json" \
     -d '{"playerId": "player123", "choiceId": "choice789"}'
```

- `POST`: Selects a dialogue choice.
- `playerId`: The player making the choice.
- `choiceId`: The selected choice that determines the next dialogue node.

## License

This project is licensed under the MIT License.
