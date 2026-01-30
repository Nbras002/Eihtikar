import type { 
  Room, 
  Player, 
  GameState, 
  OwnedProperty, 
  ChatMessage, 
  GameEvent, 
  RoomSettings,
  GameCard,
  TradeOffer
} from "@shared/schema";
import { 
  DEFAULT_ROOM_SETTINGS, 
  INITIAL_GAME_STATE, 
  PLAYER_COLORS 
} from "@shared/schema";
import { BOARD_TILES, CHANCE_CARDS, COMMUNITY_CARDS, getTileById, getPropertiesByColor, getPropertyColor } from "@shared/gameData";
import { randomUUID } from "crypto";

// Generate room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create new room
export function createRoom(playerName: string, roomName?: string): { room: Room; playerId: string } {
  const playerId = randomUUID();
  const roomId = randomUUID();
  const roomCode = generateRoomCode();

  const player: Player = {
    id: playerId,
    name: playerName,
    color: PLAYER_COLORS[0],
    money: DEFAULT_ROOM_SETTINGS.initialMoney,
    position: 0,
    properties: [],
    inJail: false,
    jailTurns: 0,
    jailFreeCards: 0,
    isReady: true,
    isConnected: true,
    isBankrupt: false,
  };

  const room: Room = {
    id: roomId,
    code: roomCode,
    name: roomName || `غرفة ${playerName}`,
    ownerId: playerId,
    players: [player],
    settings: { ...DEFAULT_ROOM_SETTINGS },
    gameState: { ...INITIAL_GAME_STATE },
    messages: [],
    events: [],
    activeTrade: null,
    createdAt: Date.now(),
  };

  return { room, playerId };
}

// Add player to room
export function addPlayerToRoom(room: Room, playerName: string): { player: Player; error?: string } {
  if (room.players.length >= room.settings.maxPlayers) {
    return { player: null as any, error: "الغرفة ممتلئة" };
  }

  if (room.gameState.phase !== "waiting") {
    return { player: null as any, error: "اللعبة قد بدأت بالفعل" };
  }

  const usedColors = new Set(room.players.map(p => p.color));
  const availableColor = PLAYER_COLORS.find(c => !usedColors.has(c)) || PLAYER_COLORS[0];

  const player: Player = {
    id: randomUUID(),
    name: playerName,
    color: availableColor,
    money: room.settings.initialMoney,
    position: 0,
    properties: [],
    inJail: false,
    jailTurns: 0,
    jailFreeCards: 0,
    isReady: false,
    isConnected: true,
    isBankrupt: false,
  };

  room.players.push(player);
  addSystemMessage(room, `${playerName} انضم للغرفة`);
  addEvent(room, "system", player.id, `${playerName} انضم للغرفة`);

  return { player };
}

// Remove player from room
export function removePlayerFromRoom(room: Room, playerId: string): boolean {
  const index = room.players.findIndex(p => p.id === playerId);
  if (index === -1) return false;

  const player = room.players[index];
  room.players.splice(index, 1);
  addSystemMessage(room, `${player.name} غادر الغرفة`);

  // Transfer ownership if owner left
  if (room.ownerId === playerId && room.players.length > 0) {
    room.ownerId = room.players[0].id;
    addSystemMessage(room, `${room.players[0].name} أصبح مدير الغرفة`);
  }

  // Handle mid-game leave
  if (room.gameState.phase === "playing") {
    if (room.gameState.currentPlayerId === playerId) {
      nextTurn(room);
    }
    checkWinCondition(room);
  }

  return true;
}

// Update room settings
export function updateRoomSettings(room: Room, settings: Partial<RoomSettings>): void {
  room.settings = { ...room.settings, ...settings };
  
  // Update player money if initial money changed
  if (settings.initialMoney && room.gameState.phase === "waiting") {
    room.players.forEach(p => {
      p.money = settings.initialMoney!;
    });
  }
}

// Start game
export function startGame(room: Room): { success: boolean; error?: string } {
  if (room.players.length < 2) {
    return { success: false, error: "تحتاج لاعبين على الأقل" };
  }

  // Reset all player states properly
  room.players.forEach(player => {
    player.money = room.settings.initialMoney;
    player.position = 0;
    player.properties = [];
    player.inJail = false;
    player.jailTurns = 0;
    player.jailFreeCards = 0;
    player.isBankrupt = false;
  });

  // Shuffle players order
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);
  room.players = shuffled;

  // Reset game state completely
  room.gameState = {
    phase: "playing",
    currentPlayerId: room.players[0].id,
    turnStartTime: Date.now(),
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

  // Clear active trade
  room.activeTrade = null;

  // Clear old messages and events for fresh game
  room.messages = [];
  room.events = [];

  addEvent(room, "system", undefined, "بدأت اللعبة!");
  addSystemMessage(room, `بدأت اللعبة! دور ${room.players[0].name}`);

  return { success: true };
}

// Roll dice
export function rollDice(room: Room, playerId: string): { success: boolean; error?: string } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  if (room.gameState.currentPlayerId !== playerId) {
    return { success: false, error: "ليس دورك" };
  }
  
  if (!room.gameState.canRollDice) {
    return { success: false, error: "لا يمكنك رمي النرد الآن" };
  }

  const diceCount = room.settings.diceCount;
  const diceValues: number[] = [];
  for (let i = 0; i < diceCount; i++) {
    diceValues.push(Math.floor(Math.random() * 6) + 1);
  }

  const total = diceValues.reduce((a, b) => a + b, 0);
  room.gameState.diceValues = diceValues;
  room.gameState.lastDiceRoll = total;
  room.gameState.canRollDice = false;
  room.gameState.hasRolledThisTurn = true;
  
  // Reset AFK counter when player rolls
  room.gameState.consecutiveAfkTurns[playerId] = 0;

  const diceStr = diceValues.join(" + ");
  addEvent(room, "dice", player.id, `${player.name} رمى النرد: ${diceStr} = ${total}`);

  // Check for doubles
  const isDoubles = diceCount === 2 && diceValues[0] === diceValues[1];
  if (isDoubles) {
    room.gameState.doublesCount++;
    if (room.gameState.doublesCount >= 3) {
      // Go to jail for 3 doubles
      sendToJail(room, player);
      addEvent(room, "jail", player.id, `${player.name} ذهب للسجن (3 دبلات متتالية)`);
      room.gameState.canEndTurn = true;
      return { success: true };
    }
  } else {
    room.gameState.doublesCount = 0;
  }

  // Handle jail
  if (player.inJail) {
    if (isDoubles) {
      player.inJail = false;
      player.jailTurns = 0;
      addEvent(room, "jail", player.id, `${player.name} خرج من السجن (دبلة)`);
    } else {
      player.jailTurns++;
      if (player.jailTurns >= 3) {
        player.money -= 50;
        player.inJail = false;
        player.jailTurns = 0;
        addEvent(room, "jail", player.id, `${player.name} دفع 50 للخروج من السجن`);
      } else {
        room.gameState.canEndTurn = true;
        addEvent(room, "dice", player.id, `${player.name} رمى ${diceValues.join(", ")} (في السجن)`);
        return { success: true };
      }
    }
  }

  // Move player
  const newPosition = (player.position + total) % 40;
  const passedGo = player.position + total >= 40;
  
  player.position = newPosition;

  if (passedGo && newPosition !== 0) {
    player.money += 200;
    addEvent(room, "move", player.id, `${player.name} مر بالبداية وحصل على 200`);
  }

  addEvent(room, "dice", player.id, `${player.name} رمى ${diceValues.join(", ")} = ${total}`);

  // Handle landing on tile
  handleTileLanding(room, player);

  // Allow roll again if doubles (and not sent to jail)
  if (isDoubles && !player.inJail) {
    room.gameState.canRollDice = true;
    addSystemMessage(room, `${player.name} حصل على دبلة! يمكنه الرمي مرة أخرى`);
  } else {
    room.gameState.canEndTurn = true;
  }

  return { success: true };
}

// Handle tile landing
function handleTileLanding(room: Room, player: Player): void {
  const tile = getTileById(player.position);
  if (!tile) return;

  switch (tile.type) {
    case "property":
    case "station":
    case "utility":
      handlePropertyLanding(room, player, tile);
      break;
    case "chance":
      drawCard(room, player, "chance");
      break;
    case "community":
      drawCard(room, player, "community");
      break;
    case "tax":
      const taxAmount = (tile as any).taxAmount || 200;
      if (room.settings.enableTax) {
        player.money -= taxAmount;
        addEvent(room, "rent", player.id, `${player.name} دفع ضريبة ${taxAmount}`);
        checkBankruptcy(room, player, taxAmount);
      }
      break;
    case "go-to-jail":
      if (room.settings.enableJail) {
        sendToJail(room, player);
        addEvent(room, "jail", player.id, `${player.name} ذهب للسجن`);
      }
      break;
    case "free-parking":
      addEvent(room, "move", player.id, `${player.name} وصل للموقف المجاني`);
      break;
  }
}

// Handle property landing
function handlePropertyLanding(room: Room, player: Player, tile: any): void {
  const ownership = room.gameState.ownedProperties.find(op => op.tileId === tile.id);
  
  if (ownership) {
    if (ownership.ownerId !== player.id && !ownership.isMortgaged) {
      const owner = room.players.find(p => p.id === ownership.ownerId);
      if (owner && !owner.isBankrupt) {
        const rent = calculateRent(room, tile, ownership);
        room.gameState.mustPayRent = {
          playerId: player.id,
          amount: rent,
          toPlayerId: ownership.ownerId,
        };
        room.gameState.canEndTurn = false;
        addEvent(room, "rent", player.id, `${player.name} يجب أن يدفع ${rent} إيجار لـ ${owner.name}`);
      }
    }
  }
}

// Calculate rent
function calculateRent(room: Room, tile: any, ownership: OwnedProperty): number {
  if (tile.type === "property") {
    const rentIndex = ownership.houses;
    return tile.rent[rentIndex] || tile.rent[0];
  } else if (tile.type === "station") {
    const stationCount = room.gameState.ownedProperties
      .filter(op => op.ownerId === ownership.ownerId && getTileById(op.tileId)?.type === "station")
      .length;
    return tile.rent[stationCount - 1] || 25;
  } else if (tile.type === "utility") {
    const utilityCount = room.gameState.ownedProperties
      .filter(op => op.ownerId === ownership.ownerId && getTileById(op.tileId)?.type === "utility")
      .length;
    const multiplier = utilityCount === 2 ? 10 : 4;
    return (room.gameState.lastDiceRoll || 0) * multiplier;
  }
  return 0;
}

// Pay rent
export function payRent(room: Room, playerId: string): { success: boolean; error?: string } {
  const rent = room.gameState.mustPayRent;
  if (!rent || rent.playerId !== playerId) {
    return { success: false, error: "لا يوجد إيجار للدفع" };
  }

  const player = room.players.find(p => p.id === playerId);
  const owner = room.players.find(p => p.id === rent.toPlayerId);
  
  if (!player || !owner) {
    return { success: false, error: "لاعب غير موجود" };
  }

  player.money -= rent.amount;
  owner.money += rent.amount;
  
  addEvent(room, "rent", player.id, `${player.name} دفع ${rent.amount} إيجار لـ ${owner.name}`);
  
  room.gameState.mustPayRent = null;
  room.gameState.canEndTurn = true;
  
  checkBankruptcy(room, player, rent.amount, rent.toPlayerId);

  return { success: true };
}

// Draw card
function drawCard(room: Room, player: Player, type: "chance" | "community"): void {
  const cards = type === "chance" ? CHANCE_CARDS : COMMUNITY_CARDS;
  const card = cards[Math.floor(Math.random() * cards.length)];
  
  room.gameState.currentCard = card;
  room.gameState.canEndTurn = false;
  
  executeCardAction(room, player, card);
}

// Execute card action
function executeCardAction(room: Room, player: Player, card: GameCard): void {
  const action = card.action;
  
  switch (action.type) {
    case "collect":
      player.money += action.amount;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      break;
    case "pay":
      player.money -= action.amount;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      checkBankruptcy(room, player, action.amount);
      break;
    case "move":
      const passedGo = action.position < player.position;
      player.position = action.position;
      if (passedGo && action.position !== 10) {
        player.money += 200;
      }
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      handleTileLanding(room, player);
      break;
    case "move-back":
      player.position = (player.position - action.spaces + 40) % 40;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      handleTileLanding(room, player);
      break;
    case "jail":
      if (room.settings.enableJail) {
        sendToJail(room, player);
      }
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      break;
    case "jail-free":
      player.jailFreeCards++;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      break;
    case "collect-from-each":
      const collectAmount = action.amount * (room.players.filter(p => !p.isBankrupt && p.id !== player.id).length);
      room.players.forEach(p => {
        if (!p.isBankrupt && p.id !== player.id) {
          p.money -= action.amount;
          player.money += action.amount;
        }
      });
      addEvent(room, "card", player.id, `${player.name} جمع ${collectAmount} من اللاعبين`);
      break;
    case "pay-each":
      const payEachTotal = action.amount * room.players.filter(p => !p.isBankrupt && p.id !== player.id).length;
      room.players.forEach(p => {
        if (!p.isBankrupt && p.id !== player.id) {
          player.money -= action.amount;
          p.money += action.amount;
        }
      });
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      checkBankruptcy(room, player, payEachTotal);
      break;
    case "repairs":
      // Calculate repairs cost based on houses and hotels
      let repairsCost = 0;
      room.gameState.ownedProperties.forEach(op => {
        if (op.ownerId === player.id) {
          if (op.houses === 5) {
            // Hotel
            repairsCost += action.hotelAmount;
          } else if (op.houses > 0) {
            repairsCost += op.houses * action.houseAmount;
          }
        }
      });
      player.money -= repairsCost;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr} (₩${repairsCost})`);
      checkBankruptcy(room, player, repairsCost);
      break;
    case "move-nearest-railroad":
      // Railroad positions: 5, 15, 25, 35
      const railroads = [5, 15, 25, 35];
      let nearestRailroad = railroads[0];
      for (const rr of railroads) {
        if (rr > player.position) {
          nearestRailroad = rr;
          break;
        }
      }
      // Check if passed Go
      if (nearestRailroad <= player.position) {
        player.money += 200;
      }
      player.position = nearestRailroad;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      // Check if owned - if so, pay double rent; if unowned, normal landing allows purchase
      const rrOwnership = room.gameState.ownedProperties.find(op => op.tileId === nearestRailroad);
      if (rrOwnership && rrOwnership.ownerId !== player.id) {
        const rrOwner = room.players.find(p => p.id === rrOwnership.ownerId);
        if (rrOwner && !rrOwner.isBankrupt) {
          const ownedStations = room.gameState.ownedProperties.filter(
            op => op.ownerId === rrOwner.id && [5, 15, 25, 35].includes(op.tileId)
          ).length;
          const baseRent = [25, 50, 100, 200][ownedStations - 1] || 25;
          const doubleRent = baseRent * 2;
          room.gameState.mustPayRent = { playerId: player.id, toPlayerId: rrOwner.id, amount: doubleRent };
          room.gameState.canEndTurn = false;
          addEvent(room, "rent", player.id, `${player.name} يجب أن يدفع ${doubleRent} (ضعف الإيجار) لـ ${rrOwner.name}`);
        }
      } else if (!rrOwnership) {
        // Unowned - player can buy it (handled by normal game flow - canEndTurn stays true)
      }
      break;
    case "move-nearest-utility":
      // Utility positions: 12 (Electric), 28 (Water)
      const utilities = [12, 28];
      let nearestUtility = utilities[0];
      for (const ut of utilities) {
        if (ut > player.position) {
          nearestUtility = ut;
          break;
        }
      }
      // Check if passed Go
      if (nearestUtility <= player.position) {
        player.money += 200;
      }
      player.position = nearestUtility;
      addEvent(room, "card", player.id, `${player.name}: ${card.textAr}`);
      // Check if owned - if so, roll dice and pay 10x
      const utOwnership = room.gameState.ownedProperties.find(op => op.tileId === nearestUtility);
      if (utOwnership && utOwnership.ownerId !== player.id) {
        const utOwner = room.players.find(p => p.id === utOwnership.ownerId);
        if (utOwner && !utOwner.isBankrupt) {
          // Roll dice for utility payment (10x the roll)
          const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
          room.gameState.lastDiceRoll = diceRoll; // Update for consistency
          const utilityRent = diceRoll * 10;
          room.gameState.mustPayRent = { playerId: player.id, toPlayerId: utOwner.id, amount: utilityRent };
          room.gameState.canEndTurn = false;
          addEvent(room, "rent", player.id, `${player.name} يجب أن يدفع ${utilityRent} (${diceRoll} × 10) لـ ${utOwner.name}`);
        }
      } else if (!utOwnership) {
        // Unowned - player can buy it (handled by normal game flow - canEndTurn stays true)
      }
      break;
  }
}

// Dismiss card
export function dismissCard(room: Room): void {
  room.gameState.currentCard = null;
  room.gameState.canEndTurn = true;
}

// Buy property
export function buyProperty(room: Room, playerId: string): { success: boolean; error?: string } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  if (room.gameState.currentPlayerId !== playerId) {
    return { success: false, error: "ليس دورك" };
  }

  const tile = getTileById(player.position);
  if (!tile || (tile.type !== "property" && tile.type !== "station" && tile.type !== "utility")) {
    return { success: false, error: "لا يمكن شراء هذه الخانة" };
  }

  const alreadyOwned = room.gameState.ownedProperties.some(op => op.tileId === tile.id);
  if (alreadyOwned) {
    return { success: false, error: "هذا العقار مملوك بالفعل" };
  }

  const price = (tile as any).price;
  if (player.money < price) {
    return { success: false, error: "لا يوجد مال كافي" };
  }

  player.money -= price;
  player.properties.push(tile.id);
  
  room.gameState.ownedProperties.push({
    tileId: tile.id,
    ownerId: player.id,
    houses: 0,
    isMortgaged: false,
  });

  addEvent(room, "buy", player.id, `${player.name} اشترى ${tile.nameAr} بـ ${price}`);

  return { success: true };
}

// End turn
export function endTurn(room: Room, playerId: string): { success: boolean; error?: string } {
  if (room.gameState.currentPlayerId !== playerId) {
    return { success: false, error: "ليس دورك" };
  }
  
  if (!room.gameState.canEndTurn) {
    return { success: false, error: "لا يمكنك إنهاء دورك الآن" };
  }

  if (room.gameState.mustPayRent) {
    return { success: false, error: "يجب دفع الإيجار أولاً" };
  }

  nextTurn(room);
  return { success: true };
}

// Next turn
function nextTurn(room: Room): void {
  const activePlayers = room.players.filter(p => !p.isBankrupt);
  if (activePlayers.length <= 1) {
    checkWinCondition(room);
    return;
  }

  const currentIndex = activePlayers.findIndex(p => p.id === room.gameState.currentPlayerId);
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  const nextPlayer = activePlayers[nextIndex];

  room.gameState.currentPlayerId = nextPlayer.id;
  room.gameState.turnStartTime = Date.now();
  room.gameState.canRollDice = true;
  room.gameState.canEndTurn = false;
  room.gameState.hasRolledThisTurn = false;
  room.gameState.doublesCount = 0;
  room.gameState.diceValues = [];
  room.gameState.lastDiceRoll = null;
  room.gameState.currentCard = null;
  room.gameState.mustPayRent = null;

  addSystemMessage(room, `دور ${nextPlayer.name}`);
}

// Handle turn timeout (called by server timer)
export function handleTurnTimeout(room: Room): { playerRemoved: boolean; removedPlayerId?: string } {
  if (room.gameState.phase !== "playing" || !room.gameState.currentPlayerId) {
    return { playerRemoved: false };
  }

  const currentPlayerId = room.gameState.currentPlayerId;
  const player = room.players.find(p => p.id === currentPlayerId);
  if (!player) return { playerRemoved: false };

  // If player hasn't rolled dice, increment AFK counter
  if (!room.gameState.hasRolledThisTurn) {
    const afkCount = (room.gameState.consecutiveAfkTurns[currentPlayerId] || 0) + 1;
    room.gameState.consecutiveAfkTurns[currentPlayerId] = afkCount;

    if (afkCount >= 3) {
      // Remove player after 3 consecutive AFK turns
      addEvent(room, "system", currentPlayerId, `${player.name} أُزيل من اللعبة (غياب متكرر)`);
      addSystemMessage(room, `${player.name} أُزيل بسبب عدم اللعب 3 أدوار متتالية`);
      
      player.isBankrupt = true;
      room.gameState.ownedProperties = room.gameState.ownedProperties.filter(
        op => op.ownerId !== currentPlayerId
      );
      
      nextTurn(room);
      checkWinCondition(room);
      return { playerRemoved: true, removedPlayerId: currentPlayerId };
    } else {
      addEvent(room, "system", currentPlayerId, `${player.name} فاته الدور (${afkCount}/3)`);
      addSystemMessage(room, `${player.name} فاته الدور (تحذير ${afkCount}/3)`);
    }
  }

  // Auto-end turn
  nextTurn(room);
  return { playerRemoved: false };
}

// Send to jail
function sendToJail(room: Room, player: Player): void {
  player.position = 10;
  player.inJail = true;
  player.jailTurns = 0;
  room.gameState.canRollDice = false;
  room.gameState.canEndTurn = true;
}

// Use jail free card
export function useJailFreeCard(room: Room, playerId: string): { success: boolean; error?: string } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  if (!player.inJail) {
    return { success: false, error: "أنت لست في السجن" };
  }
  
  if (player.jailFreeCards <= 0) {
    return { success: false, error: "لا تملك بطاقة خروج" };
  }

  player.jailFreeCards--;
  player.inJail = false;
  player.jailTurns = 0;
  room.gameState.canRollDice = true;

  addEvent(room, "jail", player.id, `${player.name} استخدم بطاقة الخروج من السجن`);

  return { success: true };
}

// Pay jail fine
export function payJailFine(room: Room, playerId: string): { success: boolean; error?: string } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  if (!player.inJail) {
    return { success: false, error: "أنت لست في السجن" };
  }
  
  if (player.money < 50) {
    return { success: false, error: "لا يوجد مال كافي" };
  }

  player.money -= 50;
  player.inJail = false;
  player.jailTurns = 0;
  room.gameState.canRollDice = true;

  addEvent(room, "jail", player.id, `${player.name} دفع 50 للخروج من السجن`);

  return { success: true };
}

// Check bankruptcy - now checks if player can mortgage to stay alive
function checkBankruptcy(room: Room, player: Player, amountOwed?: number, toPlayerId?: string): void {
  if (player.money < 0) {
    const deficit = Math.abs(player.money);
    const mortgageableValue = getTotalMortgageableValueInternal(room, player.id);
    
    if (mortgageableValue > 0) {
      // Player can potentially mortgage to stay alive - set pending bankruptcy
      room.gameState.pendingBankruptcy = {
        playerId: player.id,
        amountOwed: amountOwed || deficit,
        toPlayerId,
      };
      room.gameState.canEndTurn = false;
      player.money = 0; // Reset to 0 for now
      addEvent(room, "system", player.id, `${player.name} يحتاج لرهن عقارات أو سيفلس!`);
      addSystemMessage(room, `${player.name} في خطر الإفلاس! يمكنه رهن عقاراته لتفادي ذلك.`);
    } else {
      // No properties to mortgage - immediate bankruptcy
      player.isBankrupt = true;
      player.money = 0;
      
      if (toPlayerId) {
        const creditor = room.players.find(p => p.id === toPlayerId);
        if (creditor) {
          // Transfer all properties to creditor
          room.gameState.ownedProperties.forEach(op => {
            if (op.ownerId === player.id) {
              op.ownerId = toPlayerId;
            }
          });
          addEvent(room, "bankrupt", player.id, `${player.name} أفلس! عقاراته ذهبت لـ ${creditor.name}`);
        }
      } else {
        // Return properties to bank
        room.gameState.ownedProperties = room.gameState.ownedProperties.filter(
          op => op.ownerId !== player.id
        );
        addEvent(room, "bankrupt", player.id, `${player.name} أفلس!`);
      }
      
      addSystemMessage(room, `${player.name} أفلس وخرج من اللعبة`);
      checkWinCondition(room);
    }
  }
}

// Check win condition
function checkWinCondition(room: Room): void {
  const activePlayers = room.players.filter(p => !p.isBankrupt);
  
  if (activePlayers.length === 1) {
    room.gameState.phase = "finished";
    room.gameState.winner = activePlayers[0].id;
    addEvent(room, "system", undefined, `${activePlayers[0].name} فاز باللعبة!`);
    addSystemMessage(room, `تهانينا! ${activePlayers[0].name} فاز باللعبة!`);
  } else if (activePlayers.length === 0) {
    room.gameState.phase = "finished";
  }
}

// Add system message
function addSystemMessage(room: Room, text: string): void {
  const message: ChatMessage = {
    id: randomUUID(),
    senderId: "system",
    senderName: "النظام",
    text,
    timestamp: Date.now(),
    isSystem: true,
  };
  room.messages.push(message);
}

// Add chat message
export function addChatMessage(room: Room, playerId: string, text: string): ChatMessage | null {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return null;

  const message: ChatMessage = {
    id: randomUUID(),
    senderId: player.id,
    senderName: player.name,
    text,
    timestamp: Date.now(),
    isSystem: false,
  };
  
  room.messages.push(message);
  
  // Keep only last 100 messages
  if (room.messages.length > 100) {
    room.messages = room.messages.slice(-100);
  }

  return message;
}

// Add event
function addEvent(
  room: Room, 
  type: GameEvent["type"], 
  playerId: string | undefined, 
  description: string,
  moneyChange?: { amount: number; reason: string }
): void {
  const player = playerId ? room.players.find(p => p.id === playerId) : undefined;
  
  const event: GameEvent = {
    id: randomUUID(),
    type,
    playerId,
    playerName: player?.name,
    description,
    timestamp: Date.now(),
    moneyChange,
  };
  
  room.events.push(event);
  
  // Keep only last 50 events
  if (room.events.length > 50) {
    room.events = room.events.slice(-50);
  }
}

// Add money event helper
function addMoneyEvent(room: Room, player: Player, amount: number, reason: string): void {
  const sign = amount >= 0 ? "+" : "";
  addEvent(room, "money", player.id, `${player.name}: ${sign}${amount} (${reason})`, { amount, reason });
}

// Set player ready
export function setPlayerReady(room: Room, playerId: string, ready: boolean): void {
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.isReady = ready;
  }
}

// Propose trade
export function proposeTrade(
  room: Room, 
  fromPlayerId: string, 
  toPlayerId: string,
  offeredProperties: number[],
  requestedProperties: number[],
  offeredMoney: number,
  requestedMoney: number,
  offeredJailFreeCards: number = 0,
  requestedJailFreeCards: number = 0
): { success: boolean; error?: string } {
  const fromPlayer = room.players.find(p => p.id === fromPlayerId);
  const toPlayer = room.players.find(p => p.id === toPlayerId);
  
  if (!fromPlayer || !toPlayer) {
    return { success: false, error: "لاعب غير موجود" };
  }
  
  if (fromPlayer.isBankrupt || toPlayer.isBankrupt) {
    return { success: false, error: "لا يمكن التبادل مع لاعب مفلس" };
  }
  
  if (room.activeTrade) {
    return { success: false, error: "يوجد صفقة نشطة بالفعل" };
  }
  
  // Validate offered properties belong to from player
  for (const propId of offeredProperties) {
    const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
    if (!ownership || ownership.ownerId !== fromPlayerId) {
      return { success: false, error: "لا تملك هذا العقار" };
    }
  }
  
  // Validate requested properties belong to to player
  for (const propId of requestedProperties) {
    const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
    if (!ownership || ownership.ownerId !== toPlayerId) {
      return { success: false, error: "اللاعب الآخر لا يملك هذا العقار" };
    }
  }
  
  // Validate money
  if (offeredMoney > fromPlayer.money) {
    return { success: false, error: "لا تملك هذا المبلغ" };
  }
  
  // Validate jail free cards
  if (offeredJailFreeCards > fromPlayer.jailFreeCards) {
    return { success: false, error: "لا تملك ما يكفي من بطاقات الخروج من السجن" };
  }
  if (requestedJailFreeCards > toPlayer.jailFreeCards) {
    return { success: false, error: "اللاعب الآخر لا يملك ما يكفي من بطاقات الخروج من السجن" };
  }
  
  const trade: TradeOffer = {
    id: randomUUID(),
    fromPlayerId,
    toPlayerId,
    offeredProperties,
    requestedProperties,
    offeredMoney,
    requestedMoney,
    offeredJailFreeCards,
    requestedJailFreeCards,
    status: "pending",
    isCounterOffer: false,
  };
  
  room.activeTrade = trade;
  addEvent(room, "trade", fromPlayerId, `${fromPlayer.name} عرض صفقة على ${toPlayer.name}`);
  
  return { success: true };
}

// Respond to trade
export function respondTrade(room: Room, playerId: string, accept: boolean): { success: boolean; error?: string } {
  const trade = room.activeTrade;
  
  if (!trade) {
    return { success: false, error: "لا توجد صفقة نشطة" };
  }
  
  if (trade.toPlayerId !== playerId) {
    return { success: false, error: "هذه الصفقة ليست لك" };
  }
  
  const fromPlayer = room.players.find(p => p.id === trade.fromPlayerId);
  const toPlayer = room.players.find(p => p.id === trade.toPlayerId);
  
  if (!fromPlayer || !toPlayer) {
    room.activeTrade = null;
    return { success: false, error: "لاعب غير موجود" };
  }
  
  if (accept) {
    // Re-validate property ownership before completing trade
    for (const propId of trade.offeredProperties) {
      const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
      if (!ownership || ownership.ownerId !== fromPlayer.id) {
        room.activeTrade = null;
        return { success: false, error: "ملكية العقار تغيرت، الصفقة ملغاة" };
      }
    }
    
    for (const propId of trade.requestedProperties) {
      const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
      if (!ownership || ownership.ownerId !== toPlayer.id) {
        room.activeTrade = null;
        return { success: false, error: "ملكية العقار تغيرت، الصفقة ملغاة" };
      }
    }
    
    // Validate money again
    if (trade.offeredMoney > fromPlayer.money) {
      room.activeTrade = null;
      return { success: false, error: "المُقدِم لا يملك المال الكافي" };
    }
    if (trade.requestedMoney > toPlayer.money) {
      room.activeTrade = null;
      return { success: false, error: "لا تملك المال الكافي" };
    }
    
    // Validate jail free cards again
    const offeredJailCards = trade.offeredJailFreeCards || 0;
    const requestedJailCards = trade.requestedJailFreeCards || 0;
    if (offeredJailCards > fromPlayer.jailFreeCards) {
      room.activeTrade = null;
      return { success: false, error: "المُقدِم لا يملك ما يكفي من بطاقات الخروج من السجن" };
    }
    if (requestedJailCards > toPlayer.jailFreeCards) {
      room.activeTrade = null;
      return { success: false, error: "لا تملك ما يكفي من بطاقات الخروج من السجن" };
    }
    
    // Exchange money
    fromPlayer.money -= trade.offeredMoney;
    fromPlayer.money += trade.requestedMoney;
    toPlayer.money += trade.offeredMoney;
    toPlayer.money -= trade.requestedMoney;
    
    // Exchange jail free cards
    fromPlayer.jailFreeCards -= offeredJailCards;
    fromPlayer.jailFreeCards += requestedJailCards;
    toPlayer.jailFreeCards += offeredJailCards;
    toPlayer.jailFreeCards -= requestedJailCards;
    
    // Exchange properties
    for (const propId of trade.offeredProperties) {
      const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
      if (ownership) {
        ownership.ownerId = toPlayer.id;
        const fromIdx = fromPlayer.properties.indexOf(propId);
        if (fromIdx > -1) fromPlayer.properties.splice(fromIdx, 1);
        toPlayer.properties.push(propId);
      }
    }
    
    for (const propId of trade.requestedProperties) {
      const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
      if (ownership) {
        ownership.ownerId = fromPlayer.id;
        const toIdx = toPlayer.properties.indexOf(propId);
        if (toIdx > -1) toPlayer.properties.splice(toIdx, 1);
        fromPlayer.properties.push(propId);
      }
    }
    
    trade.status = "accepted";
    addEvent(room, "trade", toPlayer.id, `${toPlayer.name} قبل الصفقة مع ${fromPlayer.name}`);
    
    // Check if either player can resolve pending bankruptcy after trade
    checkPendingBankruptcy(room, fromPlayer);
    checkPendingBankruptcy(room, toPlayer);
  } else {
    trade.status = "rejected";
    addEvent(room, "trade", toPlayer.id, `${toPlayer.name} رفض الصفقة`);
  }
  
  room.activeTrade = null;
  return { success: true };
}

// Counter-offer trade
export function counterTrade(
  room: Room,
  playerId: string,
  offeredProperties: number[],
  requestedProperties: number[],
  offeredMoney: number,
  requestedMoney: number,
  offeredJailFreeCards: number = 0,
  requestedJailFreeCards: number = 0
): { success: boolean; error?: string } {
  const trade = room.activeTrade;
  
  if (!trade) {
    return { success: false, error: "لا توجد صفقة نشطة" };
  }
  
  if (trade.toPlayerId !== playerId) {
    return { success: false, error: "هذه الصفقة ليست لك" };
  }
  
  const fromPlayer = room.players.find(p => p.id === trade.fromPlayerId);
  const toPlayer = room.players.find(p => p.id === trade.toPlayerId);
  
  if (!fromPlayer || !toPlayer) {
    room.activeTrade = null;
    return { success: false, error: "لاعب غير موجود" };
  }
  
  // Validate offered properties belong to the counter-offering player (toPlayer)
  for (const propId of offeredProperties) {
    const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
    if (!ownership || ownership.ownerId !== playerId) {
      return { success: false, error: "لا تملك هذا العقار" };
    }
  }
  
  // Validate requested properties belong to the original offerer (fromPlayer)
  for (const propId of requestedProperties) {
    const ownership = room.gameState.ownedProperties.find(op => op.tileId === propId);
    if (!ownership || ownership.ownerId !== trade.fromPlayerId) {
      return { success: false, error: "اللاعب الآخر لا يملك هذا العقار" };
    }
  }
  
  // Validate money
  if (offeredMoney > toPlayer.money) {
    return { success: false, error: "لا تملك هذا المبلغ" };
  }
  
  // Validate jail free cards
  if (offeredJailFreeCards > toPlayer.jailFreeCards) {
    return { success: false, error: "لا تملك ما يكفي من بطاقات الخروج من السجن" };
  }
  if (requestedJailFreeCards > fromPlayer.jailFreeCards) {
    return { success: false, error: "اللاعب الآخر لا يملك ما يكفي من بطاقات الخروج من السجن" };
  }
  
  // Create counter-offer (swap the players)
  const counterOffer: TradeOffer = {
    id: randomUUID(),
    fromPlayerId: playerId,
    toPlayerId: trade.fromPlayerId,
    offeredProperties,
    requestedProperties,
    offeredMoney,
    requestedMoney,
    offeredJailFreeCards,
    requestedJailFreeCards,
    status: "pending",
    isCounterOffer: true,
    originalOfferId: trade.id,
  };
  
  room.activeTrade = counterOffer;
  addEvent(room, "trade", playerId, `${toPlayer.name} قدم عرض مضاد لـ ${fromPlayer.name}`);
  
  return { success: true };
}

// Cancel trade
export function cancelTrade(room: Room, playerId: string): { success: boolean; error?: string } {
  const trade = room.activeTrade;
  
  if (!trade) {
    return { success: false, error: "لا توجد صفقة نشطة" };
  }
  
  if (trade.fromPlayerId !== playerId) {
    return { success: false, error: "يمكن لمُقدِم الصفقة فقط إلغاؤها" };
  }
  
  const fromPlayer = room.players.find(p => p.id === playerId);
  trade.status = "cancelled";
  room.activeTrade = null;
  
  addEvent(room, "trade", playerId, `${fromPlayer?.name || "لاعب"} ألغى الصفقة`);
  
  return { success: true };
}

// Mortgage property
export function mortgageProperty(room: Room, playerId: string, tileId: number): { success: boolean; error?: string; mortgageValue?: number } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  const ownership = room.gameState.ownedProperties.find(op => op.tileId === tileId && op.ownerId === playerId);
  if (!ownership) {
    return { success: false, error: "لا تملك هذا العقار" };
  }
  
  if (ownership.isMortgaged) {
    return { success: false, error: "العقار مرهون بالفعل" };
  }
  
  if (ownership.houses > 0) {
    return { success: false, error: "يجب بيع المنازل أولاً قبل رهن العقار" };
  }
  
  const tile = getTileById(tileId);
  if (!tile || !("price" in tile)) {
    return { success: false, error: "عقار غير صالح" };
  }
  
  const mortgageValue = Math.floor(tile.price / 2);
  player.money += mortgageValue;
  ownership.isMortgaged = true;
  
  addEvent(room, "money", playerId, `${player.name} رهن ${tile.name} وحصل على ${mortgageValue}`);
  
  // Check if this resolves pending bankruptcy
  if (room.gameState.pendingBankruptcy?.playerId === playerId) {
    checkPendingBankruptcy(room, player);
  }
  
  return { success: true, mortgageValue };
}

// Unmortgage property
export function unmortgageProperty(room: Room, playerId: string, tileId: number): { success: boolean; error?: string; unmortgageCost?: number } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  const ownership = room.gameState.ownedProperties.find(op => op.tileId === tileId && op.ownerId === playerId);
  if (!ownership) {
    return { success: false, error: "لا تملك هذا العقار" };
  }
  
  if (!ownership.isMortgaged) {
    return { success: false, error: "العقار ليس مرهوناً" };
  }
  
  const tile = getTileById(tileId);
  if (!tile || !("price" in tile)) {
    return { success: false, error: "عقار غير صالح" };
  }
  
  const mortgageValue = Math.floor(tile.price / 2);
  const unmortgageCost = Math.floor(mortgageValue * 1.1); // 10% interest
  
  if (player.money < unmortgageCost) {
    return { success: false, error: `لا يوجد مال كافي. تحتاج ${unmortgageCost}` };
  }
  
  player.money -= unmortgageCost;
  ownership.isMortgaged = false;
  
  addEvent(room, "money", playerId, `${player.name} فك رهن ${tile.name} ودفع ${unmortgageCost}`);
  
  return { success: true, unmortgageCost };
}

// Get mortgage value for a property
export function getMortgageValue(tileId: number): number {
  const tile = getTileById(tileId);
  if (!tile || !("price" in tile)) return 0;
  return Math.floor(tile.price / 2);
}

// Get total mortgageable value for a player
function getTotalMortgageableValueInternal(room: Room, playerId: string): number {
  const playerProps = room.gameState.ownedProperties.filter(
    op => op.ownerId === playerId && !op.isMortgaged && op.houses === 0
  );
  return playerProps.reduce((total, op) => total + getMortgageValue(op.tileId), 0);
}

export { getTotalMortgageableValueInternal as getTotalMortgageableValue };

// Check if player can avoid bankruptcy by mortgaging
function checkPendingBankruptcy(room: Room, player: Player): void {
  const pending = room.gameState.pendingBankruptcy;
  if (!pending || pending.playerId !== player.id) return;
  
  if (player.money >= pending.amountOwed) {
    // Player has enough money now, complete the payment
    if (pending.toPlayerId) {
      const creditor = room.players.find(p => p.id === pending.toPlayerId);
      if (creditor) {
        player.money -= pending.amountOwed;
        creditor.money += pending.amountOwed;
        addEvent(room, "rent", player.id, `${player.name} دفع ${pending.amountOwed} لـ ${creditor.name}`);
      }
    } else {
      // Payment to bank (tax etc)
      player.money -= pending.amountOwed;
      addEvent(room, "money", player.id, `${player.name} دفع ${pending.amountOwed}`);
    }
    
    room.gameState.pendingBankruptcy = null;
    room.gameState.mustPayRent = null;
    room.gameState.canEndTurn = true;
  }
}

// Declare bankruptcy - called when player can't pay and has no more properties to mortgage
export function declareBankruptcy(room: Room, playerId: string): { success: boolean; error?: string } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  const pending = room.gameState.pendingBankruptcy;
  if (!pending || pending.playerId !== playerId) {
    return { success: false, error: "لا يوجد إفلاس معلق" };
  }
  
  // Check if player still has mortgageable properties
  const mortgageableValue = getTotalMortgageableValueInternal(room, playerId);
  if (player.money + mortgageableValue >= pending.amountOwed) {
    return { success: false, error: "لا يزال لديك عقارات يمكنك رهنها" };
  }
  
  // Process bankruptcy
  player.isBankrupt = true;
  
  // Transfer any remaining money and properties to creditor if applicable
  if (pending.toPlayerId) {
    const creditor = room.players.find(p => p.id === pending.toPlayerId);
    if (creditor) {
      creditor.money += player.money;
      // Transfer all properties to creditor
      room.gameState.ownedProperties.forEach(op => {
        if (op.ownerId === playerId) {
          op.ownerId = pending.toPlayerId!;
        }
      });
      addEvent(room, "bankrupt", player.id, `${player.name} أفلس! عقاراته ذهبت لـ ${creditor.name}`);
    }
  } else {
    // Properties return to bank
    room.gameState.ownedProperties = room.gameState.ownedProperties.filter(
      op => op.ownerId !== playerId
    );
    addEvent(room, "bankrupt", player.id, `${player.name} أفلس!`);
  }
  
  player.money = 0;
  room.gameState.pendingBankruptcy = null;
  room.gameState.mustPayRent = null;
  room.gameState.canEndTurn = true;
  
  addSystemMessage(room, `${player.name} أفلس وخرج من اللعبة`);
  
  checkWinCondition(room);
  
  return { success: true };
}

// Build house on property
export function buildHouse(room: Room, playerId: string, tileId: number): { success: boolean; error?: string; cost?: number } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  const tile = getTileById(tileId);
  if (!tile || tile.type !== "property") {
    return { success: false, error: "هذا ليس عقار قابل للبناء" };
  }
  
  const ownership = room.gameState.ownedProperties.find(op => op.tileId === tileId);
  if (!ownership || ownership.ownerId !== playerId) {
    return { success: false, error: "أنت لا تملك هذا العقار" };
  }
  
  if (ownership.isMortgaged) {
    return { success: false, error: "لا يمكن البناء على عقار مرهون" };
  }
  
  if (ownership.houses >= 5) {
    return { success: false, error: "هذا العقار وصل للحد الأقصى من البناء" };
  }
  
  // Check if player owns all properties in this color group
  const color = getPropertyColor(tileId);
  if (!color) return { success: false, error: "لون العقار غير معروف" };
  
  const colorGroupTileIds = getPropertiesByColor(color);
  const ownedInGroup = colorGroupTileIds.filter(id => {
    const op = room.gameState.ownedProperties.find(o => o.tileId === id);
    return op && op.ownerId === playerId && !op.isMortgaged;
  });
  
  if (ownedInGroup.length !== colorGroupTileIds.length) {
    return { success: false, error: "يجب امتلاك جميع عقارات المجموعة اللونية للبناء" };
  }
  
  // Even building rule: can't build on this property if any other property in the group has fewer houses
  const currentHouses = ownership.houses;
  const minHousesInGroup = Math.min(...colorGroupTileIds.map(id => {
    const op = room.gameState.ownedProperties.find(o => o.tileId === id);
    return op ? op.houses : 0;
  }));
  
  if (currentHouses > minHousesInGroup) {
    return { success: false, error: "يجب البناء بالتساوي على جميع عقارات المجموعة" };
  }
  
  const houseCost = (tile as any).houseCost || 50;
  if (player.money < houseCost) {
    return { success: false, error: "لا يوجد مال كافي للبناء" };
  }
  
  player.money -= houseCost;
  ownership.houses++;
  
  const buildingType = ownership.houses === 5 ? "فندق" : `منزل (${ownership.houses})`;
  addEvent(room, "money", playerId, `${player.name} بنى ${buildingType} على ${tile.name} (₩${houseCost})`);
  
  return { success: true, cost: houseCost };
}

// Sell house from property
export function sellHouse(room: Room, playerId: string, tileId: number): { success: boolean; error?: string; refund?: number } {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: "لاعب غير موجود" };
  
  const tile = getTileById(tileId);
  if (!tile || tile.type !== "property") {
    return { success: false, error: "هذا ليس عقار" };
  }
  
  const ownership = room.gameState.ownedProperties.find(op => op.tileId === tileId);
  if (!ownership || ownership.ownerId !== playerId) {
    return { success: false, error: "أنت لا تملك هذا العقار" };
  }
  
  if (ownership.houses <= 0) {
    return { success: false, error: "لا يوجد منازل للبيع" };
  }
  
  // Even building rule: can't sell from this property if any other property in the group has more houses
  const color = getPropertyColor(tileId);
  if (color) {
    const colorGroupTileIds = getPropertiesByColor(color);
    const currentHouses = ownership.houses;
    const maxHousesInGroup = Math.max(...colorGroupTileIds.map(id => {
      const op = room.gameState.ownedProperties.find(o => o.tileId === id);
      return op ? op.houses : 0;
    }));
    
    if (currentHouses < maxHousesInGroup) {
      return { success: false, error: "يجب بيع المنازل بالتساوي من جميع عقارات المجموعة" };
    }
  }
  
  const houseCost = (tile as any).houseCost || 50;
  const refund = Math.floor(houseCost / 2);
  
  player.money += refund;
  ownership.houses--;
  
  const buildingType = ownership.houses === 4 ? "الفندق" : `منزل`;
  addEvent(room, "money", playerId, `${player.name} باع ${buildingType} من ${tile.name} (₩${refund})`);
  
  // Check if pending bankruptcy can be resolved
  checkPendingBankruptcy(room, player);
  
  return { success: true, refund };
}

// Get buildable properties for a player
export function getBuildableProperties(room: Room, playerId: string): number[] {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return [];
  
  const buildable: number[] = [];
  
  // Get all color groups the player might have complete ownership of
  const colorGroups = new Set<string>();
  room.gameState.ownedProperties.forEach(op => {
    if (op.ownerId === playerId && !op.isMortgaged) {
      const color = getPropertyColor(op.tileId);
      if (color) colorGroups.add(color);
    }
  });
  
  colorGroups.forEach(color => {
    const colorTileIds = getPropertiesByColor(color);
    const ownedUnmortgaged = colorTileIds.filter(id => {
      const op = room.gameState.ownedProperties.find(o => o.tileId === id);
      return op && op.ownerId === playerId && !op.isMortgaged;
    });
    
    // Player owns all properties in this color group (complete set)
    if (ownedUnmortgaged.length === colorTileIds.length) {
      // Find which properties can have houses built (even building)
      const houseCounts = colorTileIds.map(id => {
        const op = room.gameState.ownedProperties.find(o => o.tileId === id);
        return { id, houses: op?.houses || 0 };
      });
      
      const minHouses = Math.min(...houseCounts.map(h => h.houses));
      
      houseCounts.forEach(h => {
        // Can build if at minimum house count and not at max (5)
        if (h.houses === minHouses && h.houses < 5) {
          const tile = getTileById(h.id);
          const houseCost = (tile as any)?.houseCost || 50;
          if (player.money >= houseCost) {
            buildable.push(h.id);
          }
        }
      });
    }
  });
  
  return buildable;
}
