# Eihtikar (احتكار) - Multilingual Multiplayer Board Game

## Overview
Eihtikar is a fully functional online multiplayer board game inspired by Monopoly, featuring:
- **Multilingual support**: English (default) and Arabic with automatic LTR/RTL switching
- Real-time multiplayer gameplay with WebSocket communication
- 40 tiles including properties, stations, utilities, and special tiles
- Room-based matchmaking with unique room codes
- In-game chat and event logging
- Dark mode support
- Language preference persistence via localStorage
- **Sound effects**: Dice rolls, turn notifications, timer warnings, win/lose sounds
- **Trading system**: Player-to-player trading with counter-offer support
- **AFK detection**: Auto-remove players after 3 consecutive turn timeouts
- **Server-side turn timers**: Automatic turn-ending when time limit expires
- **House/Hotel building system**: Build houses on complete color sets with even building rules, hotels at 5 houses
- **Property mortgage system**: Mortgage properties for 50% value, visual indicators on board

## Project Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/          # Game-specific components
│   │   │   │   ├── GameBoard.tsx
│   │   │   │   ├── GameTile.tsx
│   │   │   │   ├── Dice.tsx
│   │   │   │   ├── PlayerPanel.tsx
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── GameControls.tsx
│   │   │   │   ├── GameLog.tsx
│   │   │   │   ├── PropertyCard.tsx
│   │   │   │   ├── GameCard.tsx
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   ├── MortgagePanel.tsx
│   │   │   │   ├── BuildPanel.tsx
│   │   │   │   └── TradePanel.tsx
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/
│   │   │   ├── home.tsx       # Landing page with create/join room
│   │   │   ├── lobby.tsx      # Waiting room with settings
│   │   │   ├── game.tsx       # Main game interface
│   │   │   └── not-found.tsx
│   │   │   ├── language-toggle.tsx # Language switcher component
│   │   ├── lib/
│   │   │   ├── gameContext.tsx    # WebSocket client & game state
│   │   │   ├── languageContext.tsx # Multilingual translations & context
│   │   │   ├── useSounds.ts       # Web Audio API sound effects
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/                    # Backend Express + WebSocket server
│   ├── gameLogic.ts           # Complete game mechanics
│   ├── websocket.ts           # WebSocket server handling
│   ├── storage.ts             # In-memory room storage
│   ├── routes.ts              # HTTP routes
│   ├── index.ts
│   ├── static.ts
│   └── vite.ts
├── shared/                    # Shared code between client/server
│   ├── schema.ts              # TypeScript types and schemas
│   └── gameData.ts            # 40 board tiles and cards data
├── design_guidelines.md       # UI/UX design specifications
└── tailwind.config.ts         # Tailwind with Arabic fonts

```

## Key Features

### Game Mechanics
- **Dice Rolling**: Single (1-6) or double dice (2-12), configurable by room owner
- **Property System**: Buy properties, collect rent, property ownership tracking
- **Jail System**: Go to jail, pay fine, use get-out-of-jail-free cards, or roll doubles
- **Chance & Community Cards**: Random events with various effects
- **Tax Tiles**: Configurable tax collection
- **Bankruptcy**: Players who run out of money are eliminated
- **Win Condition**: Last player standing wins
- **House Building**: Buy houses on complete color sets with even building rules enforced
- **Hotel Construction**: Build hotel when 5 houses reached, shown as red indicator
- **Mortgage System**: Mortgage properties for 50% value with visual red "M" badge on board

### Multiplayer Features
- **Room Creation**: Generate unique 6-character room codes
- **Room Management**: Owner can kick players, start game, modify settings
- **Real-time Updates**: WebSocket-based instant synchronization
- **Player Ready System**: All players must be ready before game starts
- **In-game Chat**: Real-time messaging with timestamps

### Room Settings (Configurable by Owner)
- Initial money amount (500-10,000)
- Dice count (1 or 2 dice)
- Turn time limit (30-300 seconds)
- Maximum players (2-6)
- Tax tiles enabled/disabled
- Jail enabled/disabled

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, WebSocket (ws)
- **Routing**: Wouter (frontend), Express (backend)
- **State Management**: React Context + TanStack Query
- **Styling**: Tailwind CSS with custom Arabic fonts (Cairo, Tajawal)

## Running the Project
The application runs via the "Start application" workflow which executes `npm run dev`. The frontend and backend are served on port 5000.

## WebSocket Protocol

### Client Messages
- `create-room`: Create new room with player name
- `join-room`: Join existing room with room code
- `chat-message`: Send chat message
- `roll-dice`: Roll the dice on your turn
- `buy-property`: Purchase current property
- `end-turn`: End your turn
- `pay-rent`: Pay rent to property owner
- `update-settings`: Update room settings (owner only)
- `start-game`: Start the game (owner only)
- `kick-player`: Kick a player (owner only)
- `set-ready`: Toggle ready status
- `dismiss-card`: Dismiss chance/community card
- `use-jail-free`: Use get out of jail free card
- `pay-jail-fine`: Pay $50 to exit jail
- `propose-trade`: Propose a trade to another player
- `respond-trade`: Accept or reject a trade offer
- `cancel-trade`: Cancel an active trade offer
- `counter-trade`: Send a counter-offer with different terms

### Server Messages
- `room-joined`: Successfully joined/created room
- `room-updated`: Room state updated
- `error`: Error message
- `kicked`: Player was kicked from room

## Board Layout
The board has 40 tiles arranged in a square:
- **Properties**: 22 tiles in 8 color groups (brown, light blue, pink, orange, red, yellow, green, blue)
- **Stations**: 4 railway stations
- **Utilities**: 2 (Electric & Water companies)
- **Chance**: 3 tiles
- **Community Chest**: 3 tiles
- **Tax**: 2 tiles (Income Tax 200, Luxury Tax 100)
- **Special**: Start, Jail, Free Parking, Go to Jail

## User Preferences
- Default theme: Dark mode
- Default language: English (LTR layout)
- Secondary language: Arabic (RTL layout)
- Language preference persisted in localStorage
- Dynamic RTL/LTR layout based on selected language

## Multilingual System
The app uses a React Context-based translation system (`languageContext.tsx`):
- All UI strings are stored in translation dictionaries (English and Arabic)
- The `t()` function retrieves translated strings by key
- Language toggle component on all pages for switching
- Board tile names available in both English (`name`) and Arabic (`nameAr`)
- Card text translations for all Chance and Community Chest cards
