import { z } from "zod";

// Property categories/colors
export type PropertyColor = 
  | "brown" 
  | "lightblue" 
  | "pink" 
  | "orange" 
  | "red" 
  | "yellow" 
  | "green" 
  | "blue" 
  | "station" 
  | "utility";

// Tile types
export type TileType = 
  | "property" 
  | "station" 
  | "utility" 
  | "chance" 
  | "community" 
  | "tax" 
  | "jail" 
  | "go-to-jail" 
  | "start" 
  | "free-parking";

// Property tile definition
export interface PropertyTile {
  id: number;
  type: "property";
  name: string;
  nameAr: string;
  color: PropertyColor;
  price: number;
  rent: number[];
  houseCost: number;
}

// Station tile definition
export interface StationTile {
  id: number;
  type: "station";
  name: string;
  nameAr: string;
  price: number;
  rent: number[];
}

// Utility tile definition
export interface UtilityTile {
  id: number;
  type: "utility";
  name: string;
  nameAr: string;
  price: number;
}

// Special tiles
export interface SpecialTile {
  id: number;
  type: "chance" | "community" | "tax" | "jail" | "go-to-jail" | "start" | "free-parking";
  name: string;
  nameAr: string;
  taxAmount?: number;
}

export type Tile = PropertyTile | StationTile | UtilityTile | SpecialTile;

// Card types
export interface GameCard {
  id: number;
  type: "chance" | "community";
  textAr: string;
  action: CardAction;
}

export type CardAction = 
  | { type: "collect"; amount: number }
  | { type: "pay"; amount: number }
  | { type: "move"; position: number }
  | { type: "move-back"; spaces: number }
  | { type: "jail" }
  | { type: "jail-free" }
  | { type: "collect-from-each"; amount: number }
  | { type: "pay-each"; amount: number }
  | { type: "repairs"; houseAmount: number; hotelAmount: number }
  | { type: "move-nearest-railroad" }
  | { type: "move-nearest-utility" };

// Player token colors
export const PLAYER_COLORS = [
  "#E74C3C", // Red
  "#3498DB", // Blue
  "#2ECC71", // Green
  "#F39C12", // Orange
  "#9B59B6", // Purple
  "#1ABC9C", // Teal
] as const;

export type PlayerColor = typeof PLAYER_COLORS[number];

// Player definition
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isReady: boolean;
  isConnected: boolean;
  isBankrupt: boolean;
}

// Property ownership
export interface OwnedProperty {
  tileId: number;
  ownerId: string;
  houses: number;
  isMortgaged: boolean;
}

// Room settings
export interface RoomSettings {
  initialMoney: number;
  diceCount: 1 | 2;
  turnTimeLimit: number;
  enableTax: boolean;
  enableJail: boolean;
  maxPlayers: number;
}

// Game state
export type GamePhase = "waiting" | "playing" | "finished";

export interface GameState {
  phase: GamePhase;
  currentPlayerId: string | null;
  turnStartTime: number | null;
  diceValues: number[];
  lastDiceRoll: number | null;
  doublesCount: number;
  canRollDice: boolean;
  canEndTurn: boolean;
  hasRolledThisTurn: boolean;
  consecutiveAfkTurns: Record<string, number>;
  mustPayRent: { playerId: string; amount: number; toPlayerId: string } | null;
  currentCard: GameCard | null;
  winner: string | null;
  ownedProperties: OwnedProperty[];
  pendingBankruptcy: { playerId: string; amountOwed: number; toPlayerId?: string } | null;
}

// Chat message
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem: boolean;
}

// Game event log
export interface GameEvent {
  id: string;
  type: "dice" | "move" | "buy" | "rent" | "card" | "jail" | "bankrupt" | "trade" | "system" | "money";
  playerId?: string;
  playerName?: string;
  description: string;
  timestamp: number;
  moneyChange?: { amount: number; reason: string };
}

// Trade offer
export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offeredProperties: number[];
  requestedProperties: number[];
  offeredMoney: number;
  requestedMoney: number;
  offeredJailFreeCards: number;
  requestedJailFreeCards: number;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "countered";
  isCounterOffer: boolean;
  originalOfferId?: string;
}

// Room definition
export interface Room {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  players: Player[];
  settings: RoomSettings;
  gameState: GameState;
  messages: ChatMessage[];
  events: GameEvent[];
  activeTrade: TradeOffer | null;
  createdAt: number;
}

// API schemas
export const createRoomSchema = z.object({
  playerName: z.string().min(2).max(20),
  roomName: z.string().min(2).max(30).optional(),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().length(6),
  playerName: z.string().min(2).max(20),
});

export const updateSettingsSchema = z.object({
  initialMoney: z.number().min(500).max(10000),
  diceCount: z.union([z.literal(1), z.literal(2)]),
  turnTimeLimit: z.number().min(30).max(300),
  enableTax: z.boolean(),
  enableJail: z.boolean(),
  maxPlayers: z.number().min(2).max(6),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1).max(500),
});

export const tradeOfferSchema = z.object({
  toPlayerId: z.string(),
  offeredProperties: z.array(z.number()),
  requestedProperties: z.array(z.number()),
  offeredMoney: z.number().min(0),
  requestedMoney: z.number().min(0),
  offeredJailFreeCards: z.number().min(0).default(0),
  requestedJailFreeCards: z.number().min(0).default(0),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type TradeOfferInput = z.infer<typeof tradeOfferSchema>;

// Default room settings
export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  initialMoney: 1500,
  diceCount: 2,
  turnTimeLimit: 60,
  enableTax: true,
  enableJail: true,
  maxPlayers: 4,
};

// Initial game state
export const INITIAL_GAME_STATE: GameState = {
  phase: "waiting",
  currentPlayerId: null,
  turnStartTime: null,
  diceValues: [],
  lastDiceRoll: null,
  doublesCount: 0,
  canRollDice: true,
  canEndTurn: false,
  hasRolledThisTurn: false,
  consecutiveAfkTurns: {},
  mustPayRent: null,
  currentCard: null,
  winner: null,
  ownedProperties: [],
  pendingBankruptcy: null,
};
