import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { Room, Player, ChatMessage, GameEvent, RoomSettings, TradeOffer, GameCard } from "@shared/schema";

interface GameContextType {
  room: Room | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  isRoomOwner: boolean;
  isJoining: boolean;
  connectionError: string | null;
  connect: (roomCode: string, playerName: string, isCreate?: boolean, roomName?: string) => void;
  disconnect: () => void;
  sendMessage: (text: string) => void;
  rollDice: () => void;
  buyProperty: () => void;
  endTurn: () => void;
  payRent: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  startGame: () => void;
  kickPlayer: (playerId: string) => void;
  setReady: (ready: boolean) => void;
  proposeTrade: (offer: Omit<TradeOffer, "id" | "status" | "isCounterOffer">) => void;
  respondTrade: (accept: boolean) => void;
  cancelTrade: () => void;
  counterTrade: (offer: { offeredProperties: number[]; requestedProperties: number[]; offeredMoney: number; requestedMoney: number; offeredJailFreeCards?: number; requestedJailFreeCards?: number }) => void;
  dismissCard: () => void;
  useJailFreeCard: () => void;
  payJailFine: () => void;
  mortgageProperty: (tileId: number) => void;
  unmortgageProperty: (tileId: number) => void;
  declareBankruptcy: () => void;
  buildHouse: (tileId: number) => void;
  sellHouse: (tileId: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionInfoRef = useRef<{ roomCode: string; playerName: string; isCreate: boolean; roomName?: string } | null>(null);
  const isIntentionalDisconnectRef = useRef(false);

  const isRoomOwner = room?.ownerId === currentPlayer?.id;

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (isIntentionalDisconnectRef.current || !connectionInfoRef.current) return;
    
    const maxAttempts = 5;
    if (reconnectAttemptRef.current >= maxAttempts) {
      console.log("Max reconnection attempts reached");
      setRoom(null);
      setCurrentPlayer(null);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
    reconnectAttemptRef.current += 1;
    
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current}/${maxAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (connectionInfoRef.current) {
        const { roomCode, playerName, isCreate, roomName } = connectionInfoRef.current;
        connectInternal(roomCode, playerName, isCreate, roomName, true);
      }
    }, delay);
  }, []);

  const connectInternal = useCallback((roomCode: string, playerName: string, isCreate = false, roomName?: string, isReconnect = false) => {
    clearTimers();
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
      
      if (isReconnect && playerIdRef.current) {
        ws.send(JSON.stringify({ type: "reconnect", roomCode, playerId: playerIdRef.current }));
      } else if (isCreate) {
        ws.send(JSON.stringify({ type: "create-room", playerName, roomName }));
      } else {
        ws.send(JSON.stringify({ type: "join-room", roomCode, playerName }));
      }

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "room-joined":
          setRoom(data.room);
          playerIdRef.current = data.playerId;
          connectionInfoRef.current = { roomCode: data.room.code, playerName, isCreate: false, roomName };
          const player = data.room.players.find((p: Player) => p.id === data.playerId);
          setCurrentPlayer(player || null);
          setIsJoining(false);
          setConnectionError(null);
          break;
          
        case "room-updated":
          setRoom(data.room);
          if (playerIdRef.current) {
            const updatedPlayer = data.room.players.find((p: Player) => p.id === playerIdRef.current);
            setCurrentPlayer(updatedPlayer || null);
          }
          break;
          
        case "pong":
          break;
          
        case "kicked":
          setRoom(null);
          setCurrentPlayer(null);
          setIsJoining(false);
          playerIdRef.current = null;
          connectionInfoRef.current = null;
          isIntentionalDisconnectRef.current = true;
          break;
          
        case "error":
          console.error("WebSocket error:", data.message);
          setConnectionError(data.message);
          setIsJoining(false);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearTimers();
      
      if (!isIntentionalDisconnectRef.current && connectionInfoRef.current) {
        attemptReconnect();
      } else {
        setRoom(null);
        setCurrentPlayer(null);
        setIsJoining(false);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [clearTimers, attemptReconnect]);

  const connect = useCallback((roomCode: string, playerName: string, isCreate = false, roomName?: string) => {
    isIntentionalDisconnectRef.current = false;
    connectionInfoRef.current = { roomCode, playerName, isCreate, roomName };
    reconnectAttemptRef.current = 0;
    setIsJoining(true);
    setConnectionError(null);
    connectInternal(roomCode, playerName, isCreate, roomName);
  }, [connectInternal]);

  const disconnect = useCallback(() => {
    isIntentionalDisconnectRef.current = true;
    clearTimers();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "leave-room" }));
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoom(null);
    setCurrentPlayer(null);
    setIsConnected(false);
    setIsJoining(false);
    setConnectionError(null);
    playerIdRef.current = null;
    connectionInfoRef.current = null;
  }, [clearTimers]);

  const sendWsMessage = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    sendWsMessage({ type: "chat-message", text });
  }, [sendWsMessage]);

  const rollDice = useCallback(() => {
    sendWsMessage({ type: "roll-dice" });
  }, [sendWsMessage]);

  const buyProperty = useCallback(() => {
    sendWsMessage({ type: "buy-property" });
  }, [sendWsMessage]);

  const endTurn = useCallback(() => {
    sendWsMessage({ type: "end-turn" });
  }, [sendWsMessage]);

  const payRent = useCallback(() => {
    sendWsMessage({ type: "pay-rent" });
  }, [sendWsMessage]);

  const updateSettings = useCallback((settings: Partial<RoomSettings>) => {
    sendWsMessage({ type: "update-settings", settings });
  }, [sendWsMessage]);

  const startGame = useCallback(() => {
    sendWsMessage({ type: "start-game" });
  }, [sendWsMessage]);

  const kickPlayer = useCallback((playerId: string) => {
    sendWsMessage({ type: "kick-player", playerId });
  }, [sendWsMessage]);

  const setReady = useCallback((ready: boolean) => {
    sendWsMessage({ type: "set-ready", ready });
  }, [sendWsMessage]);

  const proposeTrade = useCallback((offer: Omit<TradeOffer, "id" | "status" | "isCounterOffer">) => {
    sendWsMessage({ type: "propose-trade", ...offer });
  }, [sendWsMessage]);

  const respondTrade = useCallback((accept: boolean) => {
    sendWsMessage({ type: "respond-trade", accept });
  }, [sendWsMessage]);

  const cancelTrade = useCallback(() => {
    sendWsMessage({ type: "cancel-trade" });
  }, [sendWsMessage]);

  const counterTrade = useCallback((offer: { offeredProperties: number[]; requestedProperties: number[]; offeredMoney: number; requestedMoney: number; offeredJailFreeCards?: number; requestedJailFreeCards?: number }) => {
    sendWsMessage({ type: "counter-trade", ...offer });
  }, [sendWsMessage]);

  const dismissCard = useCallback(() => {
    sendWsMessage({ type: "dismiss-card" });
  }, [sendWsMessage]);

  const useJailFreeCard = useCallback(() => {
    sendWsMessage({ type: "use-jail-free" });
  }, [sendWsMessage]);

  const payJailFine = useCallback(() => {
    sendWsMessage({ type: "pay-jail-fine" });
  }, [sendWsMessage]);

  const mortgageProperty = useCallback((tileId: number) => {
    sendWsMessage({ type: "mortgage-property", tileId });
  }, [sendWsMessage]);

  const unmortgageProperty = useCallback((tileId: number) => {
    sendWsMessage({ type: "unmortgage-property", tileId });
  }, [sendWsMessage]);

  const declareBankruptcy = useCallback(() => {
    sendWsMessage({ type: "declare-bankruptcy" });
  }, [sendWsMessage]);

  const buildHouse = useCallback((tileId: number) => {
    sendWsMessage({ type: "build-house", tileId });
  }, [sendWsMessage]);

  const sellHouse = useCallback((tileId: number) => {
    sendWsMessage({ type: "sell-house", tileId });
  }, [sendWsMessage]);

  useEffect(() => {
    return () => {
      isIntentionalDisconnectRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [clearTimers]);

  return (
    <GameContext.Provider
      value={{
        room,
        currentPlayer,
        isConnected,
        isRoomOwner,
        isJoining,
        connectionError,
        connect,
        disconnect,
        sendMessage,
        rollDice,
        buyProperty,
        endTurn,
        payRent,
        updateSettings,
        startGame,
        kickPlayer,
        setReady,
        proposeTrade,
        respondTrade,
        cancelTrade,
        counterTrade,
        dismissCard,
        useJailFreeCard,
        payJailFine,
        mortgageProperty,
        unmortgageProperty,
        declareBankruptcy,
        buildHouse,
        sellHouse,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
