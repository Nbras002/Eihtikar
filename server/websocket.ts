import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { storage } from "./storage";
import * as gameLogic from "./gameLogic";
import type { Room, RoomSettings } from "@shared/schema";

interface ClientConnection {
  ws: WebSocket;
  roomId: string;
  playerId: string;
}

const clients = new Map<WebSocket, ClientConnection>();
const roomConnections = new Map<string, Set<WebSocket>>();
const disconnectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const turnTimers = new Map<string, ReturnType<typeof setTimeout>>();

function startTurnTimer(room: Room): void {
  const roomId = room.id;
  
  // Clear existing timer
  if (turnTimers.has(roomId)) {
    clearTimeout(turnTimers.get(roomId)!);
    turnTimers.delete(roomId);
  }
  
  if (room.gameState.phase !== "playing" || !room.gameState.currentPlayerId) {
    return;
  }
  
  const timeoutMs = room.settings.turnTimeLimit * 1000;
  
  const timer = setTimeout(() => {
    const currentRoom = storage.getRoom(roomId);
    if (!currentRoom || currentRoom.gameState.phase !== "playing") {
      turnTimers.delete(roomId);
      return;
    }
    
    const result = gameLogic.handleTurnTimeout(currentRoom);
    storage.updateRoom(currentRoom);
    broadcastRoomUpdate(currentRoom);
    
    // Start timer for next turn if game continues
    if (currentRoom.gameState.phase === "playing") {
      startTurnTimer(currentRoom);
    } else {
      turnTimers.delete(roomId);
    }
  }, timeoutMs);
  
  turnTimers.set(roomId, timer);
}

function stopTurnTimer(roomId: string): void {
  if (turnTimers.has(roomId)) {
    clearTimeout(turnTimers.get(roomId)!);
    turnTimers.delete(roomId);
  }
}

export function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        sendError(ws, "خطأ في معالجة الرسالة");
      }
    });

    ws.on("close", () => {
      handleDisconnect(ws);
    });

    ws.on("error", () => {
      handleDisconnect(ws);
    });
  });
}

function handleMessage(ws: WebSocket, message: any): void {
  switch (message.type) {
    case "create-room":
      handleCreateRoom(ws, message);
      break;
    case "join-room":
      handleJoinRoom(ws, message);
      break;
    case "chat-message":
      handleChatMessage(ws, message);
      break;
    case "roll-dice":
      handleRollDice(ws);
      break;
    case "buy-property":
      handleBuyProperty(ws);
      break;
    case "end-turn":
      handleEndTurn(ws);
      break;
    case "pay-rent":
      handlePayRent(ws);
      break;
    case "update-settings":
      handleUpdateSettings(ws, message);
      break;
    case "start-game":
      handleStartGame(ws);
      break;
    case "kick-player":
      handleKickPlayer(ws, message);
      break;
    case "set-ready":
      handleSetReady(ws, message);
      break;
    case "dismiss-card":
      handleDismissCard(ws);
      break;
    case "use-jail-free":
      handleUseJailFree(ws);
      break;
    case "pay-jail-fine":
      handlePayJailFine(ws);
      break;
    case "propose-trade":
      handleProposeTrade(ws, message);
      break;
    case "respond-trade":
      handleRespondTrade(ws, message);
      break;
    case "cancel-trade":
      handleCancelTrade(ws);
      break;
    case "counter-trade":
      handleCounterTrade(ws, message);
      break;
    case "mortgage-property":
      handleMortgageProperty(ws, message);
      break;
    case "unmortgage-property":
      handleUnmortgageProperty(ws, message);
      break;
    case "declare-bankruptcy":
      handleDeclareBankruptcy(ws);
      break;
    case "build-house":
      handleBuildHouse(ws, message);
      break;
    case "sell-house":
      handleSellHouse(ws, message);
      break;
    case "ping":
      sendToClient(ws, { type: "pong" });
      break;
    case "reconnect":
      handleReconnect(ws, message);
      break;
    case "leave-room":
      handleLeaveRoom(ws);
      break;
    default:
      break;
  }
}

function handleCreateRoom(ws: WebSocket, message: { playerName: string; roomName?: string }): void {
  const { room, playerId } = gameLogic.createRoom(message.playerName, message.roomName);
  storage.createRoom(room);
  
  clients.set(ws, { ws, roomId: room.id, playerId });
  
  if (!roomConnections.has(room.id)) {
    roomConnections.set(room.id, new Set());
  }
  roomConnections.get(room.id)!.add(ws);

  sendToClient(ws, {
    type: "room-joined",
    room,
    playerId,
  });
}

function handleJoinRoom(ws: WebSocket, message: { roomCode: string; playerName: string }): void {
  const room = storage.getRoomByCode(message.roomCode.toUpperCase());
  
  if (!room) {
    sendError(ws, "الغرفة غير موجودة");
    return;
  }

  const { player, error } = gameLogic.addPlayerToRoom(room, message.playerName);
  
  if (error) {
    sendError(ws, error);
    return;
  }

  storage.updateRoom(room);
  
  clients.set(ws, { ws, roomId: room.id, playerId: player.id });
  
  if (!roomConnections.has(room.id)) {
    roomConnections.set(room.id, new Set());
  }
  roomConnections.get(room.id)!.add(ws);

  sendToClient(ws, {
    type: "room-joined",
    room,
    playerId: player.id,
  });

  broadcastRoomUpdate(room);
}

function handleLeaveRoom(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  // Clear any pending disconnect timeout for this player
  const timeoutKey = `${room.id}-${client.playerId}`;
  if (disconnectTimeouts.has(timeoutKey)) {
    clearTimeout(disconnectTimeouts.get(timeoutKey)!);
    disconnectTimeouts.delete(timeoutKey);
  }

  // Remove player immediately
  gameLogic.removePlayerFromRoom(room, client.playerId);
  storage.updateRoom(room);
  broadcastRoomUpdate(room);

  // Delete empty rooms
  if (room.players.length === 0) {
    storage.deleteRoom(room.id);
  }

  // Clean up connections
  clients.delete(ws);
  roomConnections.get(room.id)?.delete(ws);
  if (roomConnections.get(room.id)?.size === 0) {
    roomConnections.delete(room.id);
  }
}

function handleReconnect(ws: WebSocket, message: { roomCode: string; playerId: string }): void {
  const room = storage.getRoomByCode(message.roomCode.toUpperCase());
  
  if (!room) {
    sendError(ws, "الغرفة غير موجودة");
    return;
  }

  const player = room.players.find(p => p.id === message.playerId);
  
  if (!player) {
    sendError(ws, "اللاعب غير موجود");
    return;
  }

  // Clear any pending disconnect timeout
  const timeoutKey = `${room.id}-${message.playerId}`;
  if (disconnectTimeouts.has(timeoutKey)) {
    clearTimeout(disconnectTimeouts.get(timeoutKey)!);
    disconnectTimeouts.delete(timeoutKey);
  }

  player.isConnected = true;
  storage.updateRoom(room);
  
  clients.set(ws, { ws, roomId: room.id, playerId: player.id });
  
  if (!roomConnections.has(room.id)) {
    roomConnections.set(room.id, new Set());
  }
  roomConnections.get(room.id)!.add(ws);

  sendToClient(ws, {
    type: "room-joined",
    room,
    playerId: player.id,
  });

  broadcastRoomUpdate(room);
}

function handleChatMessage(ws: WebSocket, message: { text: string }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const chatMessage = gameLogic.addChatMessage(room, client.playerId, message.text);
  if (chatMessage) {
    storage.updateRoom(room);
    broadcastRoomUpdate(room);
  }
}

function handleRollDice(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.rollDice(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleBuyProperty(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.buyProperty(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleEndTurn(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.endTurn(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
  
  // Restart turn timer for next player
  if (room.gameState.phase === "playing") {
    startTurnTimer(room);
  } else {
    stopTurnTimer(room.id);
  }
}

function handlePayRent(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.payRent(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleUpdateSettings(ws: WebSocket, message: { settings: Partial<RoomSettings> }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  if (room.ownerId !== client.playerId) {
    sendError(ws, "فقط مدير الغرفة يمكنه تغيير الإعدادات");
    return;
  }

  gameLogic.updateRoomSettings(room, message.settings);
  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleStartGame(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  if (room.ownerId !== client.playerId) {
    sendError(ws, "فقط مدير الغرفة يمكنه بدء اللعبة");
    return;
  }

  const result = gameLogic.startGame(room);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
  
  // Start turn timer
  startTurnTimer(room);
}

function handleKickPlayer(ws: WebSocket, message: { playerId: string }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  if (room.ownerId !== client.playerId) {
    sendError(ws, "فقط مدير الغرفة يمكنه طرد اللاعبين");
    return;
  }

  const success = gameLogic.removePlayerFromRoom(room, message.playerId);
  if (success) {
    storage.updateRoom(room);
    
    // Disconnect kicked player
    for (const [clientWs, clientData] of clients) {
      if (clientData.playerId === message.playerId) {
        sendToClient(clientWs, { type: "kicked" });
        clientWs.close();
        break;
      }
    }
    
    broadcastRoomUpdate(room);
  }
}

function handleSetReady(ws: WebSocket, message: { ready: boolean }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  gameLogic.setPlayerReady(room, client.playerId, message.ready);
  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleDismissCard(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  gameLogic.dismissCard(room);
  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleUseJailFree(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.useJailFreeCard(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handlePayJailFine(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.payJailFine(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleProposeTrade(ws: WebSocket, message: { toPlayerId: string; offeredProperties: number[]; requestedProperties: number[]; offeredMoney: number; requestedMoney: number; offeredJailFreeCards?: number; requestedJailFreeCards?: number }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.proposeTrade(
    room,
    client.playerId,
    message.toPlayerId,
    message.offeredProperties || [],
    message.requestedProperties || [],
    message.offeredMoney || 0,
    message.requestedMoney || 0,
    message.offeredJailFreeCards || 0,
    message.requestedJailFreeCards || 0
  );

  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleRespondTrade(ws: WebSocket, message: { accept: boolean }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.respondTrade(room, client.playerId, message.accept);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleCancelTrade(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.cancelTrade(room, client.playerId);
  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleCounterTrade(ws: WebSocket, message: { offeredProperties: number[]; requestedProperties: number[]; offeredMoney: number; requestedMoney: number; offeredJailFreeCards?: number; requestedJailFreeCards?: number }): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (!room) return;

  const result = gameLogic.counterTrade(
    room,
    client.playerId,
    message.offeredProperties || [],
    message.requestedProperties || [],
    message.offeredMoney || 0,
    message.requestedMoney || 0,
    message.offeredJailFreeCards || 0,
    message.requestedJailFreeCards || 0
  );

  if (result.error) {
    sendError(ws, result.error);
    return;
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleDisconnect(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = storage.getRoom(client.roomId);
  if (room) {
    const player = room.players.find(p => p.id === client.playerId);
    if (player) {
      player.isConnected = false;
      storage.updateRoom(room);
      broadcastRoomUpdate(room);
      
      // Set a timeout to remove player if they don't reconnect (30 seconds for waiting, never during playing)
      if (room.gameState.phase === "waiting") {
        const timeoutKey = `${room.id}-${client.playerId}`;
        
        // Clear any existing timeout for this player
        if (disconnectTimeouts.has(timeoutKey)) {
          clearTimeout(disconnectTimeouts.get(timeoutKey)!);
        }
        
        // Set new timeout to remove player after 30 seconds
        const timeout = setTimeout(() => {
          const currentRoom = storage.getRoom(room.id);
          if (currentRoom && currentRoom.gameState.phase === "waiting") {
            const disconnectedPlayer = currentRoom.players.find(p => p.id === client.playerId);
            if (disconnectedPlayer && !disconnectedPlayer.isConnected) {
              gameLogic.removePlayerFromRoom(currentRoom, client.playerId);
              storage.updateRoom(currentRoom);
              broadcastRoomUpdate(currentRoom);
              
              // Delete empty rooms
              if (currentRoom.players.length === 0) {
                storage.deleteRoom(currentRoom.id);
              }
            }
          }
          disconnectTimeouts.delete(timeoutKey);
        }, 30000);
        
        disconnectTimeouts.set(timeoutKey, timeout);
      }
    }
  }

  // Clean up connections
  clients.delete(ws);
  const roomId = client.roomId;
  roomConnections.get(roomId)?.delete(ws);
  if (roomConnections.get(roomId)?.size === 0) {
    roomConnections.delete(roomId);
  }
}

function broadcastRoomUpdate(room: Room): void {
  const connections = roomConnections.get(room.id);
  if (!connections) return;

  const message = {
    type: "room-updated",
    room,
  };

  for (const ws of connections) {
    if (ws.readyState === WebSocket.OPEN) {
      sendToClient(ws, message);
    }
  }
}

function sendToClient(ws: WebSocket, message: any): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: WebSocket, message: string): void {
  sendToClient(ws, {
    type: "error",
    message,
  });
}

function handleMortgageProperty(ws: WebSocket, message: any): void {
  const client = clients.get(ws);
  if (!client) return sendError(ws, "غير متصل بغرفة");

  const room = storage.getRoom(client.roomId);
  if (!room) return sendError(ws, "الغرفة غير موجودة");

  const { tileId } = message;
  if (typeof tileId !== "number") {
    return sendError(ws, "معرف العقار غير صالح");
  }

  const result = gameLogic.mortgageProperty(room, client.playerId, tileId);
  if (!result.success) {
    return sendError(ws, result.error || "فشل في رهن العقار");
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleUnmortgageProperty(ws: WebSocket, message: any): void {
  const client = clients.get(ws);
  if (!client) return sendError(ws, "غير متصل بغرفة");

  const room = storage.getRoom(client.roomId);
  if (!room) return sendError(ws, "الغرفة غير موجودة");

  const { tileId } = message;
  if (typeof tileId !== "number") {
    return sendError(ws, "معرف العقار غير صالح");
  }

  const result = gameLogic.unmortgageProperty(room, client.playerId, tileId);
  if (!result.success) {
    return sendError(ws, result.error || "فشل في فك رهن العقار");
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleDeclareBankruptcy(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return sendError(ws, "غير متصل بغرفة");

  const room = storage.getRoom(client.roomId);
  if (!room) return sendError(ws, "الغرفة غير موجودة");

  const result = gameLogic.declareBankruptcy(room, client.playerId);
  if (!result.success) {
    return sendError(ws, result.error || "فشل في إعلان الإفلاس");
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);

  // Start timer for next turn if game continues
  if (room.gameState.phase === "playing") {
    startTurnTimer(room);
  } else {
    stopTurnTimer(room.id);
  }
}

function handleBuildHouse(ws: WebSocket, message: any): void {
  const client = clients.get(ws);
  if (!client) return sendError(ws, "غير متصل بغرفة");

  const room = storage.getRoom(client.roomId);
  if (!room) return sendError(ws, "الغرفة غير موجودة");

  const tileId = message.tileId;
  if (typeof tileId !== "number") {
    return sendError(ws, "معرف العقار غير صالح");
  }

  const result = gameLogic.buildHouse(room, client.playerId, tileId);
  if (!result.success) {
    return sendError(ws, result.error || "فشل في البناء");
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}

function handleSellHouse(ws: WebSocket, message: any): void {
  const client = clients.get(ws);
  if (!client) return sendError(ws, "غير متصل بغرفة");

  const room = storage.getRoom(client.roomId);
  if (!room) return sendError(ws, "الغرفة غير موجودة");

  const tileId = message.tileId;
  if (typeof tileId !== "number") {
    return sendError(ws, "معرف العقار غير صالح");
  }

  const result = gameLogic.sellHouse(room, client.playerId, tileId);
  if (!result.success) {
    return sendError(ws, result.error || "فشل في بيع المنزل");
  }

  storage.updateRoom(room);
  broadcastRoomUpdate(room);
}
