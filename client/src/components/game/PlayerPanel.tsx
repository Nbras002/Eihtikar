import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/languageContext";
import { useSounds } from "@/lib/useSounds";
import type { Player, OwnedProperty } from "@shared/schema";
import { Crown, Lock, Wallet, Building2, Trophy, Key } from "lucide-react";

interface PlayerPanelProps {
  players: Player[];
  currentPlayerId: string | null;
  currentUserId?: string;
  ownerId: string;
  ownedProperties: OwnedProperty[];
  turnTimeLimit?: number;
  turnStartTime?: number | null;
}

export function PlayerPanel({ 
  players, 
  currentPlayerId, 
  currentUserId,
  ownerId, 
  ownedProperties,
  turnTimeLimit = 60,
  turnStartTime
}: PlayerPanelProps) {
  const { t, formatCurrency } = useLanguage();
  const { playSound } = useSounds();
  const sortedPlayers = [...players].sort((a, b) => b.money - a.money);
  const [timeRemaining, setTimeRemaining] = useState(turnTimeLimit);
  const warningPlayedRef = useRef(false);

  const getPlayerProperties = (playerId: string) => {
    return ownedProperties.filter(op => op.ownerId === playerId);
  };

  useEffect(() => {
    if (!turnStartTime) {
      setTimeRemaining(turnTimeLimit);
      warningPlayedRef.current = false;
      return;
    }

    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
      const remaining = Math.max(0, turnTimeLimit - elapsed);
      setTimeRemaining(remaining);

      // Play timer warning when 10 seconds remain and it's the current user's turn
      if (remaining <= 10 && remaining > 0 && !warningPlayedRef.current && currentPlayerId === currentUserId) {
        playSound("timerWarning");
        warningPlayedRef.current = true;
      }

      if (remaining <= 0) {
        warningPlayedRef.current = false;
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [turnStartTime, turnTimeLimit, currentPlayerId, currentUserId, playSound]);

  useEffect(() => {
    warningPlayedRef.current = false;
  }, [currentPlayerId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          {t("general.players")}
        </h3>
        <Badge variant="outline">
          {players.filter(p => !p.isBankrupt).length} {t("general.active")}
        </Badge>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const isCurrentTurn = player.id === currentPlayerId;
          const properties = getPlayerProperties(player.id);
          
          return (
            <Card
              key={player.id}
              className={cn(
                "transition-all",
                isCurrentTurn && "ring-2 ring-primary animate-pulse-glow",
                player.isBankrupt && "opacity-50"
              )}
              data-testid={`player-panel-${player.id}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar 
                      className="w-10 h-10 border-2" 
                      style={{ borderColor: player.color }}
                    >
                      <AvatarFallback 
                        style={{ backgroundColor: player.color }} 
                        className="text-white font-bold text-sm"
                      >
                        {player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && !player.isBankrupt && (
                      <div className="absolute -top-1 -end-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">
                        {player.name}
                      </span>
                      {player.id === ownerId && (
                        <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      )}
                      {player.inJail && (
                        <Lock className="w-3 h-3 text-orange-500 flex-shrink-0" />
                      )}
                      {player.jailFreeCards > 0 && (
                        <span className="flex items-center gap-0.5 text-orange-500 flex-shrink-0" title={t("trade.jailFreeCard")}>
                          <Key className="w-3 h-3" />
                          <span className="text-xs font-medium">{player.jailFreeCards}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1 text-sm md:text-base font-semibold text-foreground">
                        <Wallet className="w-4 h-4" />
                        {formatCurrency(player.money)}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Building2 className="w-3 h-3" />
                        {properties.length}
                      </span>
                    </div>
                  </div>

                  {player.isBankrupt && (
                    <Badge variant="destructive" className="text-xs">{t("game.bankrupt")}</Badge>
                  )}
                </div>

                {isCurrentTurn && turnStartTime && (
                  <div className="mt-2">
                    <Progress 
                      value={(timeRemaining / turnTimeLimit) * 100} 
                      className={cn("h-1", timeRemaining <= 10 && "bg-red-500/20")}
                    />
                    {timeRemaining <= 10 && (
                      <span className="text-xs text-red-500 font-medium">{timeRemaining}s</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
