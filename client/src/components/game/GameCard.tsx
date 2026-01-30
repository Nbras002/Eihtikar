import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage, cardTranslations } from "@/lib/languageContext";
import type { GameCard as GameCardType } from "@shared/schema";
import { HelpCircle, Gift, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCardProps {
  card: GameCardType | null;
  playerName?: string;
  playerColor?: string;
  onDismiss: () => void;
}

export function GameCardNotification({ card, playerName, playerColor, onDismiss }: GameCardProps) {
  const { t, language } = useLanguage();
  
  if (!card) return null;

  const isChance = card.type === "chance";
  
  const getCardText = () => {
    if (language === "ar") {
      return card.textAr;
    }
    const translations = cardTranslations[language]?.[card.id];
    if (translations) {
      return isChance ? translations.chance : translations.community;
    }
    return card.textAr;
  };

  return (
    <Card 
      className={cn(
        "border-2 animate-in slide-in-from-top-2 duration-300",
        isChance ? "border-blue-500" : "border-purple-500"
      )}
      data-testid="card-notification"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div 
            className={cn(
              "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isChance ? "bg-blue-500" : "bg-purple-500"
            )}
          >
            {isChance ? (
              <HelpCircle className="w-5 h-5 text-white" />
            ) : (
              <Gift className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-sm font-semibold",
                isChance ? "text-blue-500" : "text-purple-500"
              )}>
                {isChance ? t("card.chance") : t("card.community")}
              </span>
              {playerName && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: playerColor }}
                  >
                    {playerName}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {getCardText()}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDismiss}
            data-testid="button-dismiss-card"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GameCardModal({ card, onDismiss }: GameCardProps) {
  return <GameCardNotification card={card} onDismiss={onDismiss} />;
}
