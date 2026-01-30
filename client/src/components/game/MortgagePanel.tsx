import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/lib/languageContext";
import { getTileById, getPropertyColorHex } from "@shared/gameData";
import type { Player, OwnedProperty } from "@shared/schema";
import { Building2, AlertTriangle, Banknote, Lock, Unlock } from "lucide-react";

interface MortgagePanelProps {
  player: Player;
  ownedProperties: OwnedProperty[];
  pendingBankruptcy: { playerId: string; amountOwed: number; toPlayerId?: string } | null;
  onMortgage: (tileId: number) => void;
  onUnmortgage: (tileId: number) => void;
  onDeclareBankruptcy: () => void;
}

export function MortgagePanel({
  player,
  ownedProperties,
  pendingBankruptcy,
  onMortgage,
  onUnmortgage,
  onDeclareBankruptcy,
}: MortgagePanelProps) {
  const { t, language, formatCurrency } = useLanguage();
  const [showMortgageDialog, setShowMortgageDialog] = useState(false);
  const [confirmBankruptcy, setConfirmBankruptcy] = useState(false);

  const myProperties = ownedProperties.filter(op => op.ownerId === player.id);
  const mortgageableProps = myProperties.filter(op => !op.isMortgaged && op.houses === 0);
  const mortgagedProps = myProperties.filter(op => op.isMortgaged);

  const isPendingBankruptcy = pendingBankruptcy?.playerId === player.id;

  const getMortgageValue = (tileId: number) => {
    const tile = getTileById(tileId);
    if (!tile || !("price" in tile)) return 0;
    return Math.floor(tile.price / 2);
  };

  const getUnmortgageCost = (tileId: number) => {
    return Math.floor(getMortgageValue(tileId) * 1.1);
  };

  const getPropertyName = (tileId: number) => {
    const tile = getTileById(tileId);
    if (!tile) return "";
    return language === "ar" && tile.nameAr ? tile.nameAr : tile.name;
  };

  const totalMortgageableValue = mortgageableProps.reduce((sum, op) => sum + getMortgageValue(op.tileId), 0);
  const canAvoidBankruptcy = isPendingBankruptcy && (player.money + totalMortgageableValue >= pendingBankruptcy.amountOwed);

  if (myProperties.length === 0 && !isPendingBankruptcy) {
    return null;
  }

  return (
    <>
      {isPendingBankruptcy && (
        <Alert variant="destructive" className="mb-4" data-testid="alert-bankruptcy-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("mortgage.bankruptcyWarning")}</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{t("mortgage.mustMortgage")}</p>
            <p className="font-bold">{t("mortgage.amountOwed")}: {formatCurrency(pendingBankruptcy.amountOwed)}</p>
            <p className="text-sm mt-1">{t("general.yourMoney")}: {formatCurrency(player.money)}</p>
            {canAvoidBankruptcy ? (
              <p className="text-sm mt-1 text-yellow-600 dark:text-yellow-400">
                {t("mortgage.mortgageToSurvive")}
              </p>
            ) : (
              <Button 
                variant="destructive" 
                size="sm" 
                className="mt-2"
                onClick={() => setConfirmBankruptcy(true)}
                data-testid="button-declare-bankruptcy"
              >
                {t("mortgage.declareBankruptcy")}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={() => setShowMortgageDialog(true)} 
        variant="outline" 
        className="w-full gap-2"
        disabled={myProperties.length === 0}
        data-testid="button-manage-properties"
      >
        <Building2 className="w-4 h-4" />
        {t("mortgage.title")}
      </Button>

      <Dialog open={showMortgageDialog} onOpenChange={setShowMortgageDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t("mortgage.title")}
            </DialogTitle>
            <DialogDescription>
              {t("general.yourMoney")}: {formatCurrency(player.money)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden" style={{ maxHeight: '60vh' }}>
            <ScrollArea className="h-full">
              <div className="space-y-4 p-1 pe-4">
              {mortgageableProps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Unlock className="w-4 h-4" />
                    {t("mortgage.mortgage")}
                  </h4>
                  <div className="space-y-2">
                    {mortgageableProps.map(op => {
                      const tile = getTileById(op.tileId);
                      const mortgageValue = getMortgageValue(op.tileId);
                      const tileColor = tile && "color" in tile ? tile.color : undefined;
                      
                      return (
                        <Card key={op.tileId} className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {tileColor && (
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: getPropertyColorHex(tileColor) }}
                                />
                              )}
                              <span className="text-sm font-medium truncate">{getPropertyName(op.tileId)}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm text-muted-foreground">+{formatCurrency(mortgageValue)}</span>
                              <Button 
                                size="sm" 
                                onClick={() => onMortgage(op.tileId)}
                                data-testid={`button-mortgage-${op.tileId}`}
                              >
                                {t("mortgage.mortgage")}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {mortgagedProps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t("mortgage.mortgaged")}
                  </h4>
                  <div className="space-y-2">
                    {mortgagedProps.map(op => {
                      const tile = getTileById(op.tileId);
                      const unmortgageCost = getUnmortgageCost(op.tileId);
                      const canUnmortgage = player.money >= unmortgageCost;
                      const tileColor = tile && "color" in tile ? tile.color : undefined;
                      
                      return (
                        <Card key={op.tileId} className="p-3 opacity-75">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {tileColor && (
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: getPropertyColorHex(tileColor) }}
                                />
                              )}
                              <span className="text-sm font-medium truncate">{getPropertyName(op.tileId)}</span>
                              <Badge variant="secondary" className="text-xs">{t("mortgage.mortgaged")}</Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm text-muted-foreground">-{formatCurrency(unmortgageCost)}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={!canUnmortgage}
                                onClick={() => onUnmortgage(op.tileId)}
                                data-testid={`button-unmortgage-${op.tileId}`}
                              >
                                {t("mortgage.unmortgage")}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {myProperties.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("mortgage.noProperties")}
                </p>
              )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBankruptcy} onOpenChange={setConfirmBankruptcy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t("mortgage.declareBankruptcy")}
            </DialogTitle>
            <DialogDescription>
              {t("mortgage.mustMortgage")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBankruptcy(false)}>
              {t("general.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDeclareBankruptcy();
                setConfirmBankruptcy(false);
              }}
              data-testid="button-confirm-bankruptcy"
            >
              {t("mortgage.declareBankruptcy")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
