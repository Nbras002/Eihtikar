import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/languageContext";
import { getTileById, getPropertiesByColor, getPropertyColor, getPropertyColorHex } from "@shared/gameData";
import type { Player, OwnedProperty } from "@shared/schema";
import { Home, Hotel, Plus, Minus, Building2 } from "lucide-react";

interface BuildPanelProps {
  player: Player;
  ownedProperties: OwnedProperty[];
  onBuildHouse: (tileId: number) => void;
  onSellHouse: (tileId: number) => void;
}

interface ColorGroup {
  color: string;
  properties: {
    tileId: number;
    name: string;
    houses: number;
    houseCost: number;
    isMortgaged: boolean;
  }[];
  isComplete: boolean;
  canBuild: boolean;
}

export function BuildPanel({
  player,
  ownedProperties,
  onBuildHouse,
  onSellHouse,
}: BuildPanelProps) {
  const { t, language, formatCurrency } = useLanguage();
  const [showBuildDialog, setShowBuildDialog] = useState(false);

  const myProperties = ownedProperties.filter(op => op.ownerId === player.id);
  
  const colorGroups: ColorGroup[] = [];
  const processedColors = new Set<string>();
  
  myProperties.forEach(op => {
    const color = getPropertyColor(op.tileId);
    if (!color || processedColors.has(color)) return;
    processedColors.add(color);
    
    const allTilesInColor = getPropertiesByColor(color);
    const ownedInColor = myProperties.filter(p => {
      const pColor = getPropertyColor(p.tileId);
      return pColor === color;
    });
    
    const isComplete = ownedInColor.length === allTilesInColor.length;
    const hasUnmortgaged = ownedInColor.every(p => !p.isMortgaged);
    
    const properties = ownedInColor.map(p => {
      const tile = getTileById(p.tileId);
      return {
        tileId: p.tileId,
        name: language === "ar" && tile?.nameAr ? tile.nameAr : tile?.name || "",
        houses: p.houses,
        houseCost: (tile as any)?.houseCost || 50,
        isMortgaged: p.isMortgaged,
      };
    });
    
    colorGroups.push({
      color,
      properties,
      isComplete: isComplete && hasUnmortgaged,
      canBuild: isComplete && hasUnmortgaged,
    });
  });
  
  const completeSets = colorGroups.filter(g => g.isComplete);
  
  const canBuildOnProperty = (group: ColorGroup, property: typeof group.properties[0]) => {
    if (!group.canBuild || property.isMortgaged || property.houses >= 5) return false;
    const minHouses = Math.min(...group.properties.map(p => p.houses));
    return property.houses === minHouses && player.money >= property.houseCost;
  };
  
  const canSellFromProperty = (group: ColorGroup, property: typeof group.properties[0]) => {
    if (property.houses <= 0) return false;
    const maxHouses = Math.max(...group.properties.map(p => p.houses));
    return property.houses === maxHouses;
  };

  if (myProperties.length === 0) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setShowBuildDialog(true)} 
        variant="outline" 
        className="w-full gap-2"
        data-testid="button-build-houses"
      >
        <Home className="w-4 h-4" />
        {t("build.title")}
      </Button>

      <Dialog open={showBuildDialog} onOpenChange={setShowBuildDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t("build.title")}
            </DialogTitle>
            <DialogDescription>
              {t("general.yourMoney")}: {formatCurrency(player.money)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="space-y-4 p-1">
              {completeSets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("build.noCompleteSets")}
                </p>
              ) : (
                completeSets.map(group => (
                  <div key={group.color} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getPropertyColorHex(group.color) }}
                      />
                      <span className="text-sm font-medium">{t(`color.${group.color}`)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {group.properties.map(prop => {
                        const canBuild = canBuildOnProperty(group, prop);
                        const canSell = canSellFromProperty(group, prop);
                        
                        return (
                          <Card key={prop.tileId} className={prop.isMortgaged ? "opacity-50" : ""}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">{prop.name}</span>
                                    {prop.isMortgaged && (
                                      <Badge variant="secondary" className="text-xs">{t("mortgage.mortgaged")}</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {prop.houses === 5 ? (
                                      <Badge className="bg-red-500 text-white">
                                        <Hotel className="w-3 h-3 me-1" />
                                        {t("build.hotel")}
                                      </Badge>
                                    ) : prop.houses > 0 ? (
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: prop.houses }).map((_, i) => (
                                          <div key={i} className="w-3 h-3 bg-green-500 rounded-sm" />
                                        ))}
                                        <span className="text-xs text-muted-foreground ms-1">
                                          {prop.houses} {t("build.houses")}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">{t("general.noHouses")}</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button 
                                    size="icon"
                                    variant="outline"
                                    disabled={!canSell}
                                    onClick={() => onSellHouse(prop.tileId)}
                                    title={`${t("build.sellHouse")} (+${formatCurrency(Math.floor(prop.houseCost / 2))})`}
                                    data-testid={`button-sell-house-${prop.tileId}`}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="icon"
                                    disabled={!canBuild}
                                    onClick={() => onBuildHouse(prop.tileId)}
                                    title={`${t("build.buildHouse")} (-${formatCurrency(prop.houseCost)})`}
                                    data-testid={`button-build-house-${prop.tileId}`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>{t("build.houseCost")}: {formatCurrency(prop.houseCost)}</span>
                                <span>{t("build.sellValue")}: {formatCurrency(Math.floor(prop.houseCost / 2))}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              
              {colorGroups.filter(g => !g.isComplete).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">{t("build.mustOwnAll")}</p>
                  {colorGroups.filter(g => !g.isComplete).map(group => (
                    <div key={group.color} className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full opacity-50"
                        style={{ backgroundColor: getPropertyColorHex(group.color) }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {t(`color.${group.color}`)} ({group.properties.length}/{getPropertiesByColor(group.color).length})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
