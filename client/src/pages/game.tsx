import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/lib/gameContext";
import { useLanguage } from "@/lib/languageContext";
import { useSounds } from "@/lib/useSounds";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { GameBoard } from "@/components/game/GameBoard";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { ChatPanel } from "@/components/game/ChatPanel";
import { GameControls } from "@/components/game/GameControls";
import { GameLog } from "@/components/game/GameLog";
import { PropertyCard } from "@/components/game/PropertyCard";
import { GameCardNotification } from "@/components/game/GameCard";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TradePanel } from "@/components/game/TradePanel";
import { MortgagePanel } from "@/components/game/MortgagePanel";
import { BuildPanel } from "@/components/game/BuildPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Dices, LogOut, Users, MessageCircle, History, Trophy, Loader2, Crown } from "lucide-react";
import { getTileById } from "@shared/gameData";

export default function Game() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { 
    room, 
    currentPlayer, 
    isConnected, 
    disconnect, 
    sendMessage, 
    rollDice, 
    buyProperty, 
    endTurn, 
    payRent,
    dismissCard,
    useJailFreeCard,
    payJailFine,
    proposeTrade,
    respondTrade,
    cancelTrade,
    counterTrade,
    mortgageProperty,
    unmortgageProperty,
    declareBankruptcy,
    buildHouse,
    sellHouse
  } = useGame();

  const { playSound } = useSounds();

  const handleBuyProperty = useCallback(() => {
    playSound("debit");
    buyProperty();
  }, [buyProperty, playSound]);

  const handlePayRent = useCallback(() => {
    playSound("debit");
    payRent();
  }, [payRent, playSound]);

  const handleMortgage = useCallback((tileId: number) => {
    playSound("credit");
    mortgageProperty(tileId);
  }, [mortgageProperty, playSound]);

  const handleUnmortgage = useCallback((tileId: number) => {
    playSound("debit");
    unmortgageProperty(tileId);
  }, [unmortgageProperty, playSound]);

  const handleBuildHouse = useCallback((tileId: number) => {
    playSound("debit");
    buildHouse(tileId);
  }, [buildHouse, playSound]);

  const handleSellHouse = useCallback((tileId: number) => {
    playSound("credit");
    sellHouse(tileId);
  }, [sellHouse, playSound]);

  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [activeTab, setActiveTab] = useState("players");
  const [lastSeenMessageCount, setLastSeenMessageCount] = useState(0);
  const prevDiceValuesRef = useRef<number[]>([]);
  const prevCurrentPlayerIdRef = useRef<string | null>(null);
  const prevPhaseRef = useRef<string>("waiting");
  const prevMessageCountRef = useRef(0);

  const unreadMessages = room ? room.messages.length - lastSeenMessageCount : 0;
  const hasUnreadMessages = activeTab !== "chat" && unreadMessages > 0;

  useEffect(() => {
    if (activeTab === "chat" && room) {
      setLastSeenMessageCount(room.messages.length);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "chat" && room) {
      setLastSeenMessageCount(room.messages.length);
    }
  }, [room?.messages.length]);

  useEffect(() => {
    if (!room) {
      navigate("/");
    }
    if (room?.gameState.phase === "waiting") {
      navigate("/lobby");
    }
    if (room?.gameState.winner) {
      setShowWinner(true);
    }
  }, [room, navigate]);

  useEffect(() => {
    if (!room || !currentPlayer) return;

    const diceValues = room.gameState.diceValues;
    if (diceValues.length > 0 && diceValues !== prevDiceValuesRef.current && 
        JSON.stringify(diceValues) !== JSON.stringify(prevDiceValuesRef.current)) {
      playSound("diceRoll");
    }
    prevDiceValuesRef.current = diceValues;

    const currentPlayerId = room.gameState.currentPlayerId;
    if (currentPlayerId && currentPlayerId !== prevCurrentPlayerIdRef.current) {
      if (currentPlayerId === currentPlayer.id) {
        playSound("turnStart");
      }
    }
    prevCurrentPlayerIdRef.current = currentPlayerId;

    if (room.gameState.phase === "finished" && prevPhaseRef.current === "playing") {
      if (room.gameState.winner === currentPlayer.id) {
        playSound("win");
      } else {
        playSound("lose");
      }
    }
    prevPhaseRef.current = room.gameState.phase;

    const messageCount = room.messages.length;
    if (messageCount > prevMessageCountRef.current && activeTab !== "chat") {
      const lastMessage = room.messages[room.messages.length - 1];
      if (lastMessage && lastMessage.senderId !== currentPlayer.id && !lastMessage.isSystem) {
        playSound("chat");
      }
    }
    prevMessageCountRef.current = messageCount;
  }, [room, currentPlayer, playSound, activeTab]);

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isMyTurn = room.gameState.currentPlayerId === currentPlayer.id;
  const currentTurnPlayer = room.players.find(p => p.id === room.gameState.currentPlayerId);
  const winner = room.players.find(p => p.id === room.gameState.winner);

  const handleTileClick = (tileId: number) => {
    const tile = getTileById(tileId);
    if (tile && (tile.type === "property" || tile.type === "station" || tile.type === "utility")) {
      setSelectedTileId(tileId);
    }
  };

  const handleLeave = () => {
    disconnect();
    navigate("/");
  };

  const selectedOwnership = selectedTileId 
    ? room.gameState.ownedProperties.find(op => op.tileId === selectedTileId) 
    : undefined;
  const selectedOwner = selectedOwnership 
    ? room.players.find(p => p.id === selectedOwnership.ownerId) 
    : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Dices className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{room.name || t("app.title")}</h1>
            {currentTurnPlayer && (
              <p className="text-xs text-muted-foreground">
                <span style={{ color: currentTurnPlayer.color }}>{currentTurnPlayer.name}</span>
                {t("game.turnOf")}
                {isMyTurn && ` (${t("game.yourTurn")})`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLeave} data-testid="button-leave-game">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <GameBoard
              players={room.players}
              ownedProperties={room.gameState.ownedProperties}
              onTileClick={handleTileClick}
            />
          </div>
          
          <div className="lg:hidden">
            <GameControls
              gameState={room.gameState}
              currentPlayer={currentPlayer}
              isMyTurn={isMyTurn}
              onRollDice={rollDice}
              onBuyProperty={handleBuyProperty}
              onEndTurn={endTurn}
              onPayRent={handlePayRent}
              onUseJailFreeCard={useJailFreeCard}
              onPayJailFine={payJailFine}
              diceCount={room.settings.diceCount}
            />
          </div>
        </div>

        <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-hidden">
          <div className="hidden lg:block">
            <GameControls
              gameState={room.gameState}
              currentPlayer={currentPlayer}
              isMyTurn={isMyTurn}
              onRollDice={rollDice}
              onBuyProperty={handleBuyProperty}
              onEndTurn={endTurn}
              onPayRent={handlePayRent}
              onUseJailFreeCard={useJailFreeCard}
              onPayJailFine={payJailFine}
              diceCount={room.settings.diceCount}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="players" className="gap-1 text-xs">
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">{t("general.players")}</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1 text-xs relative">
                <MessageCircle className="w-3 h-3" />
                <span className="hidden sm:inline">{t("game.chat")}</span>
                {hasUnreadMessages && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="log" className="gap-1 text-xs">
                <History className="w-3 h-3" />
                <span className="hidden sm:inline">{t("game.events")}</span>
              </TabsTrigger>
              <TabsTrigger value="rank" className="gap-1 text-xs">
                <Trophy className="w-3 h-3" />
                <span className="hidden sm:inline">{t("game.leaderboard")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="flex-1 overflow-auto mt-4 space-y-4">
              <PlayerPanel
                players={room.players}
                currentPlayerId={room.gameState.currentPlayerId}
                currentUserId={currentPlayer.id}
                ownerId={room.ownerId}
                ownedProperties={room.gameState.ownedProperties}
                turnTimeLimit={room.settings.turnTimeLimit}
                turnStartTime={room.gameState.turnStartTime}
              />
              {room.gameState.currentCard && (
                <GameCardNotification
                  card={room.gameState.currentCard}
                  playerName={currentTurnPlayer?.name}
                  playerColor={currentTurnPlayer?.color}
                  onDismiss={dismissCard}
                />
              )}
              <TradePanel
                players={room.players}
                currentPlayerId={currentPlayer.id}
                ownedProperties={room.gameState.ownedProperties}
                activeTrade={room.activeTrade}
                onProposeTrade={proposeTrade}
                onRespondTrade={respondTrade}
                onCancelTrade={cancelTrade}
                onCounterTrade={counterTrade}
              />
              <MortgagePanel
                player={currentPlayer}
                ownedProperties={room.gameState.ownedProperties}
                pendingBankruptcy={room.gameState.pendingBankruptcy}
                onMortgage={handleMortgage}
                onUnmortgage={handleUnmortgage}
                onDeclareBankruptcy={declareBankruptcy}
              />
              <BuildPanel
                player={currentPlayer}
                ownedProperties={room.gameState.ownedProperties}
                onBuildHouse={handleBuildHouse}
                onSellHouse={handleSellHouse}
              />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 overflow-hidden mt-4">
              <ChatPanel
                messages={room.messages}
                players={room.players}
                onSendMessage={sendMessage}
                currentPlayerId={currentPlayer.id}
              />
            </TabsContent>

            <TabsContent value="log" className="flex-1 overflow-auto mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="w-4 h-4" />
                    {t("game.events")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GameLog events={room.events} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rank" className="flex-1 overflow-auto mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="w-4 h-4" />
                    {t("game.leaderboard")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Leaderboard 
                    players={room.players} 
                    ownedProperties={room.gameState.ownedProperties}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PropertyCard
        tileId={selectedTileId}
        ownership={selectedOwnership}
        owner={selectedOwner}
        onClose={() => setSelectedTileId(null)}
      />

      
      <Dialog open={showWinner && !!winner} onOpenChange={setShowWinner}>
        <DialogContent className="text-center">
          <div className="py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Crown className="w-10 h-10 text-yellow-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2">{t("game.gameOver")}</DialogTitle>
              <DialogDescription className="text-lg">
                {t("game.congratulations")}{" "}
                <span className="font-bold" style={{ color: winner?.color }}>
                  {winner?.name}
                </span>{" "}
                {t("game.won")}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleLeave} className="mt-6" size="lg">
              {t("game.backToLobby")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
