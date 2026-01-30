import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/languageContext";
import type { Player, OwnedProperty } from "@shared/schema";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  players: Player[];
  ownedProperties: OwnedProperty[];
}

export function Leaderboard({ players, ownedProperties }: LeaderboardProps) {
  const { t, formatCurrency } = useLanguage();
  
  const getPlayerNetWorth = (player: Player) => {
    const propertiesValue = ownedProperties
      .filter(op => op.ownerId === player.id)
      .reduce((sum, op) => sum + op.houses * 100, 0);
    return player.money + propertiesValue;
  };

  const rankedPlayers = [...players]
    .filter(p => !p.isBankrupt)
    .sort((a, b) => getPlayerNetWorth(b) - getPlayerNetWorth(a));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm text-muted-foreground">{rank + 1}</span>;
    }
  };

  return (
    <div className="space-y-2">
      {rankedPlayers.map((player, index) => (
        <div
          key={player.id}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            index === 0 && "bg-yellow-500/10",
            index === 1 && "bg-gray-500/10",
            index === 2 && "bg-amber-500/10"
          )}
        >
          <div className="w-6 flex justify-center">
            {getRankIcon(index)}
          </div>
          
          <Avatar className="w-8 h-8 border" style={{ borderColor: player.color }}>
            <AvatarFallback 
              style={{ backgroundColor: player.color }}
              className="text-white text-xs font-bold"
            >
              {player.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {player.name}
            </p>
          </div>
          
          <Badge variant="outline" className="font-mono">
            {formatCurrency(getPlayerNetWorth(player))}
          </Badge>
        </div>
      ))}

      {players.filter(p => p.isBankrupt).map((player) => (
        <div
          key={player.id}
          className="flex items-center gap-3 p-2 rounded-lg opacity-50"
        >
          <div className="w-6" />
          <Avatar className="w-8 h-8 border border-gray-400">
            <AvatarFallback className="bg-gray-400 text-white text-xs">
              {player.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {player.name}
            </p>
          </div>
          <Badge variant="destructive" className="text-xs">{t("game.bankrupt")}</Badge>
        </div>
      ))}
    </div>
  );
}
