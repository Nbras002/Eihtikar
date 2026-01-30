import { ScrollArea } from "@/components/ui/scroll-area";
import type { GameEvent } from "@shared/schema";
import { useLanguage } from "@/lib/languageContext";
import { Dices, MapPin, ShoppingCart, Wallet, HelpCircle, Lock, AlertTriangle, ArrowLeftRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameLogProps {
  events: GameEvent[];
}

export function GameLog({ events }: GameLogProps) {
  const { t, language, translateEvent } = useLanguage();
  
  const getEventIcon = (type: GameEvent["type"]) => {
    switch (type) {
      case "dice":
        return <Dices className="w-3 h-3" />;
      case "move":
        return <MapPin className="w-3 h-3" />;
      case "buy":
        return <ShoppingCart className="w-3 h-3" />;
      case "rent":
        return <Wallet className="w-3 h-3" />;
      case "card":
        return <HelpCircle className="w-3 h-3" />;
      case "jail":
        return <Lock className="w-3 h-3" />;
      case "bankrupt":
        return <AlertTriangle className="w-3 h-3" />;
      case "trade":
        return <ArrowLeftRight className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: GameEvent["type"]) => {
    switch (type) {
      case "buy":
        return "text-green-500";
      case "rent":
        return "text-orange-500";
      case "jail":
        return "text-red-500";
      case "bankrupt":
        return "text-red-600";
      case "card":
        return "text-purple-500";
      case "trade":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const formatTime = (timestamp: number) => {
    const locale = language === "ar" ? "ar-EG" : "en-US";
    return new Date(timestamp).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        {t("general.noEvents")}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] pe-2">
      <div className="space-y-2">
        {[...events].reverse().map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 text-sm"
            data-testid={`event-${event.id}`}
          >
            <div className={cn("mt-0.5", getEventColor(event.type))}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground leading-relaxed">
                {translateEvent(event.description)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
