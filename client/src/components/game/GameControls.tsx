import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DicePair } from "./Dice";
import { useLanguage } from "@/lib/languageContext";
import type { GameState, Player } from "@shared/schema";
import { getTileById } from "@shared/gameData";
import { Dices, ShoppingCart, Check, Lock, CreditCard } from "lucide-react";
import { useState } from "react";

interface GameControlsProps {
  gameState: GameState;
  currentPlayer: Player | null;
  isMyTurn: boolean;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onEndTurn: () => void;
  onPayRent: () => void;
  onUseJailFreeCard: () => void;
  onPayJailFine: () => void;
  diceCount: number;
}

export function GameControls({
  gameState,
  currentPlayer,
  isMyTurn,
  onRollDice,
  onBuyProperty,
  onEndTurn,
  onPayRent,
  onUseJailFreeCard,
  onPayJailFine,
  diceCount,
}: GameControlsProps) {
  const [isRolling, setIsRolling] = useState(false);
  const { t, formatCurrency } = useLanguage();

  const currentTile = currentPlayer ? getTileById(currentPlayer.position) : null;
  const canBuy = isMyTurn && currentTile && 
    (currentTile.type === "property" || currentTile.type === "station" || currentTile.type === "utility") &&
    !gameState.ownedProperties.some(op => op.tileId === currentTile.id) &&
    currentPlayer && currentPlayer.money >= (currentTile as any).price &&
    !gameState.canRollDice;

  const handleRollDice = () => {
    setIsRolling(true);
    onRollDice();
    setTimeout(() => setIsRolling(false), 600);
  };

  const displayDice = gameState.diceValues.length > 0 
    ? gameState.diceValues 
    : diceCount === 1 ? [1] : [1, 1];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <DicePair values={displayDice} isRolling={isRolling} size="md" />
            {gameState.lastDiceRoll && (
              <Badge variant="outline" className="text-lg px-3 py-1">
                {gameState.lastDiceRoll}
              </Badge>
            )}
          </div>

          {currentPlayer?.inJail && isMyTurn && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="destructive" className="gap-1">
                <Lock className="w-3 h-3" />
                {t("game.inJail")} ({currentPlayer.jailTurns}/3)
              </Badge>
              {currentPlayer.jailFreeCards > 0 && (
                <Button size="sm" variant="outline" onClick={onUseJailFreeCard} data-testid="button-jail-free">
                  {t("game.useJailCard")} ({currentPlayer.jailFreeCards})
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onPayJailFine} data-testid="button-jail-fine">
                <CreditCard className="w-4 h-4 me-1" />
                {t("game.payJailFine")}
              </Button>
            </div>
          )}

          {gameState.mustPayRent && isMyTurn && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {t("general.rentDue")}: {formatCurrency(gameState.mustPayRent.amount)}
              </Badge>
              <Button size="sm" onClick={onPayRent} data-testid="button-pay-rent">
                <CreditCard className="w-4 h-4 me-1" />
                {t("game.payRent")}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={handleRollDice}
              disabled={!isMyTurn || !gameState.canRollDice || isRolling || !!gameState.mustPayRent}
              className="gap-2"
              size="lg"
              data-testid="button-roll-dice"
            >
              <Dices className="w-5 h-5" />
              {t("game.rollDice")}
            </Button>

            {canBuy && (
              <Button
                onClick={onBuyProperty}
                variant="secondary"
                className="gap-2"
                size="lg"
                data-testid="button-buy-property"
              >
                <ShoppingCart className="w-5 h-5" />
                {t("game.buyProperty")} ({formatCurrency((currentTile as any).price)})
              </Button>
            )}

            <Button
              onClick={onEndTurn}
              disabled={!isMyTurn || !gameState.canEndTurn || !!gameState.mustPayRent}
              variant="outline"
              className="gap-2"
              size="lg"
              data-testid="button-end-turn"
            >
              <Check className="w-5 h-5" />
              {t("game.endTurn")}
            </Button>
          </div>

          {!isMyTurn && gameState.currentPlayerId && (
            <p className="text-sm text-muted-foreground text-center">
              {t("general.waitingForPlayer")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
