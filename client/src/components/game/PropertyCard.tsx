import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/lib/languageContext";
import type { OwnedProperty, Player } from "@shared/schema";
import { getTileById, getPropertyColorHex } from "@shared/gameData";
import { Home, Hotel, Wallet } from "lucide-react";

interface PropertyCardProps {
  tileId: number | null;
  ownership?: OwnedProperty;
  owner?: Player;
  onClose: () => void;
  canBuy?: boolean;
  onBuy?: () => void;
}

export function PropertyCard({ tileId, ownership, owner, onClose, canBuy, onBuy }: PropertyCardProps) {
  const { t, language, formatCurrency } = useLanguage();
  
  if (!tileId) return null;
  
  const tile = getTileById(tileId);
  if (!tile || (tile.type !== "property" && tile.type !== "station" && tile.type !== "utility")) {
    return null;
  }

  const tileName = language === "ar" ? tile.nameAr : tile.name;
  const isProperty = tile.type === "property";
  const isStation = tile.type === "station";

  const colorHex = isProperty ? getPropertyColorHex((tile as any).color) : 
    isStation ? "#4A4A4A" : "#6B7280";

  const getRentLabel = (index: number) => {
    if (isProperty) {
      if (index === 0) return t("property.baseRent");
      if (index === 5) return (
        <span className="flex items-center gap-1">
          <Hotel className="w-4 h-4" />
          {t("general.hotel")}
        </span>
      );
      return (
        <span className="flex items-center gap-1">
          {index} <Home className="w-4 h-4" />
        </span>
      );
    }
    if (index === 0) return t("general.oneStation");
    return `${index + 1} ${t("general.stations")}`;
  };

  return (
    <Dialog open={!!tileId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <div 
          className="h-16 -mx-6 -mt-6 rounded-t-lg flex items-end justify-center pb-2"
          style={{ backgroundColor: colorHex }}
        >
          <DialogTitle className="text-white text-xl font-bold text-center">
            {tileName}
          </DialogTitle>
        </div>

        <div className="pt-4 space-y-4">
          {owner && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">
                {t("general.owner")}
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: owner.color }}
                />
                <span className="font-medium text-foreground">{owner.name}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">{t("property.price")}</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency((tile as any).price)}</p>
            </div>
            {isProperty && (
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">{t("property.houseCost")}</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency((tile as any).houseCost)}</p>
              </div>
            )}
          </div>

          {(isProperty || isStation) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t("property.rent")}</h4>
                <div className="space-y-1 text-sm">
                  {(tile as any).rent.map((rent: number, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        {getRentLabel(index)}
                      </span>
                      <span className="font-medium text-foreground">{formatCurrency(rent)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {ownership && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("general.housesBuilt")}
                  </span>
                  <div className="flex items-center gap-1">
                    {ownership.houses === 5 ? (
                      <Badge className="bg-red-500 gap-1">
                        <Hotel className="w-3 h-3" />
                        {t("general.hotel")}
                      </Badge>
                    ) : ownership.houses > 0 ? (
                      Array.from({ length: ownership.houses }).map((_, i) => (
                        <Home key={i} className="w-4 h-4 text-green-500" />
                      ))
                    ) : (
                      <span className="text-muted-foreground">{t("general.noHouses")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("property.mortgaged")}
                  </span>
                  <Badge variant={ownership.isMortgaged ? "destructive" : "secondary"}>
                    {ownership.isMortgaged ? t("general.yes") : t("general.no")}
                  </Badge>
                </div>
                {isProperty && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("mortgage.value")}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(Math.floor((tile as any).price / 2))}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {canBuy && onBuy && (
            <Button onClick={onBuy} className="w-full gap-2" size="lg">
              <Wallet className="w-5 h-5" />
              {t("game.buyProperty")} ({formatCurrency((tile as any).price)})
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
