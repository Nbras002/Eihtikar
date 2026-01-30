import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/lib/languageContext";
import { getTileById } from "@shared/gameData";
import type { Player, OwnedProperty, TradeOffer } from "@shared/schema";
import { ArrowRightLeft, Check, X, Key } from "lucide-react";

interface TradePanelProps {
  players: Player[];
  currentPlayerId: string;
  ownedProperties: OwnedProperty[];
  activeTrade: TradeOffer | null;
  onProposeTrade: (offer: Omit<TradeOffer, "id" | "status" | "isCounterOffer">) => void;
  onRespondTrade: (accept: boolean) => void;
  onCancelTrade: () => void;
  onCounterTrade: (offer: { offeredProperties: number[]; requestedProperties: number[]; offeredMoney: number; requestedMoney: number; offeredJailFreeCards: number; requestedJailFreeCards: number }) => void;
}

export function TradePanel({
  players,
  currentPlayerId,
  ownedProperties,
  activeTrade,
  onProposeTrade,
  onRespondTrade,
  onCancelTrade,
  onCounterTrade,
}: TradePanelProps) {
  const { t, language, formatCurrency } = useLanguage();
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [offeredProperties, setOfferedProperties] = useState<number[]>([]);
  const [requestedProperties, setRequestedProperties] = useState<number[]>([]);
  const [offeredMoney, setOfferedMoney] = useState(0);
  const [requestedMoney, setRequestedMoney] = useState(0);
  const [counterOfferedProperties, setCounterOfferedProperties] = useState<number[]>([]);
  const [counterRequestedProperties, setCounterRequestedProperties] = useState<number[]>([]);
  const [counterOfferedMoney, setCounterOfferedMoney] = useState(0);
  const [counterRequestedMoney, setCounterRequestedMoney] = useState(0);
  const [offeredJailFreeCards, setOfferedJailFreeCards] = useState(0);
  const [requestedJailFreeCards, setRequestedJailFreeCards] = useState(0);
  const [counterOfferedJailCards, setCounterOfferedJailCards] = useState(0);
  const [counterRequestedJailCards, setCounterRequestedJailCards] = useState(0);

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const otherPlayers = players.filter(p => p.id !== currentPlayerId && !p.isBankrupt);
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  const myProperties = ownedProperties.filter(op => op.ownerId === currentPlayerId);
  const theirProperties = selectedPlayerId 
    ? ownedProperties.filter(op => op.ownerId === selectedPlayerId)
    : [];

  const isTradeForMe = activeTrade?.toPlayerId === currentPlayerId;
  const isMyTrade = activeTrade?.fromPlayerId === currentPlayerId;

  const counterTradeOpponent = activeTrade ? players.find(p => p.id === activeTrade.fromPlayerId) : null;
  const myPropsForCounter = ownedProperties.filter(op => op.ownerId === currentPlayerId);
  const theirPropsForCounter = activeTrade ? ownedProperties.filter(op => op.ownerId === activeTrade.fromPlayerId) : [];

  const handleCounterTrade = () => {
    onCounterTrade({
      offeredProperties: counterOfferedProperties,
      requestedProperties: counterRequestedProperties,
      offeredMoney: counterOfferedMoney,
      requestedMoney: counterRequestedMoney,
      offeredJailFreeCards: counterOfferedJailCards,
      requestedJailFreeCards: counterRequestedJailCards,
    });
    setShowCounterDialog(false);
    resetCounterForm();
  };

  const resetCounterForm = () => {
    setCounterOfferedProperties([]);
    setCounterRequestedProperties([]);
    setCounterOfferedMoney(0);
    setCounterRequestedMoney(0);
    setCounterOfferedJailCards(0);
    setCounterRequestedJailCards(0);
  };

  const toggleCounterProperty = (propId: number, isOffered: boolean) => {
    if (isOffered) {
      setCounterOfferedProperties(prev => 
        prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId]
      );
    } else {
      setCounterRequestedProperties(prev => 
        prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId]
      );
    }
  };

  const handleProposeTrade = () => {
    if (!selectedPlayerId) return;
    
    onProposeTrade({
      fromPlayerId: currentPlayerId,
      toPlayerId: selectedPlayerId,
      offeredProperties,
      requestedProperties,
      offeredMoney,
      requestedMoney,
      offeredJailFreeCards,
      requestedJailFreeCards,
    });
    
    resetForm();
    setShowTradeDialog(false);
  };

  const resetForm = () => {
    setSelectedPlayerId("");
    setOfferedProperties([]);
    setRequestedProperties([]);
    setOfferedMoney(0);
    setRequestedMoney(0);
    setOfferedJailFreeCards(0);
    setRequestedJailFreeCards(0);
  };

  const toggleProperty = (propId: number, isOffered: boolean) => {
    if (isOffered) {
      setOfferedProperties(prev => 
        prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId]
      );
    } else {
      setRequestedProperties(prev => 
        prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId]
      );
    }
  };

  const getPropertyName = (tileId: number) => {
    const tile = getTileById(tileId);
    return tile ? (language === "ar" ? tile.nameAr : tile.name) : `#${tileId}`;
  };

  if (activeTrade) {
    const fromPlayer = players.find(p => p.id === activeTrade.fromPlayerId);
    const toPlayer = players.find(p => p.id === activeTrade.toPlayerId);

    return (
      <>
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowRightLeft className="w-4 h-4" />
            {t("trade.activeTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="font-medium" style={{ color: fromPlayer?.color }}>
              {fromPlayer?.name}
            </span>
            {" → "}
            <span className="font-medium" style={{ color: toPlayer?.color }}>
              {toPlayer?.name}
            </span>
          </div>

          {activeTrade.offeredProperties.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("trade.offering")}:</p>
              <div className="flex flex-wrap gap-1">
                {activeTrade.offeredProperties.map(propId => (
                  <Badge key={propId} variant="outline" className="text-xs">
                    {getPropertyName(propId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {activeTrade.offeredMoney > 0 && (
            <p className="text-sm">
              {t("trade.offering")}: <span className="font-bold">{formatCurrency(activeTrade.offeredMoney)}</span>
            </p>
          )}

          {activeTrade.requestedProperties.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("trade.requesting")}:</p>
              <div className="flex flex-wrap gap-1">
                {activeTrade.requestedProperties.map(propId => (
                  <Badge key={propId} variant="outline" className="text-xs">
                    {getPropertyName(propId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {activeTrade.requestedMoney > 0 && (
            <p className="text-sm">
              {t("trade.requesting")}: <span className="font-bold">{formatCurrency(activeTrade.requestedMoney)}</span>
            </p>
          )}

          {(activeTrade.offeredJailFreeCards > 0 || activeTrade.requestedJailFreeCards > 0) && (
            <div className="text-sm space-y-1">
              {activeTrade.offeredJailFreeCards > 0 && (
                <p>{t("trade.offering")}: <span className="font-bold">{activeTrade.offeredJailFreeCards} {t("trade.jailFreeCards")}</span></p>
              )}
              {activeTrade.requestedJailFreeCards > 0 && (
                <p>{t("trade.requesting")}: <span className="font-bold">{activeTrade.requestedJailFreeCards} {t("trade.jailFreeCards")}</span></p>
              )}
            </div>
          )}

          {isTradeForMe && (
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onRespondTrade(true)} className="flex-1 gap-1" data-testid="button-accept-trade">
                  <Check className="w-3 h-3" />
                  {t("trade.accept")}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onRespondTrade(false)} className="flex-1 gap-1" data-testid="button-reject-trade">
                  <X className="w-3 h-3" />
                  {t("trade.reject")}
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowCounterDialog(true)} 
                className="w-full gap-1"
                data-testid="button-counter-offer"
              >
                <ArrowRightLeft className="w-3 h-3" />
                {t("trade.counterOffer")}
              </Button>
            </div>
          )}

          {isMyTrade && (
            <Button size="sm" variant="outline" onClick={onCancelTrade} className="w-full">
              {t("trade.cancel")}
            </Button>
          )}

          {activeTrade.isCounterOffer && (
            <Badge variant="secondary" className="mt-2">
              {t("trade.counterOfferLabel")}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCounterDialog} onOpenChange={setShowCounterDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("trade.counterOffer")}</DialogTitle>
            <DialogDescription>
              {t("trade.counterDescription")} {counterTradeOpponent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("trade.youOffer")}</Label>
                <ScrollArea className="h-40 border rounded-md p-2">
                  {myPropsForCounter.length === 0 && (currentPlayer?.jailFreeCards || 0) === 0 ? (
                    <p className="text-xs text-muted-foreground">{t("trade.noProperties")}</p>
                  ) : (
                    <>
                      {myPropsForCounter.map(op => (
                        <div key={op.tileId} className="flex items-center gap-2 py-1">
                          <Checkbox
                            checked={counterOfferedProperties.includes(op.tileId)}
                            onCheckedChange={() => toggleCounterProperty(op.tileId, true)}
                          />
                          <span className="text-xs">{getPropertyName(op.tileId)}</span>
                        </div>
                      ))}
                      {Array.from({ length: currentPlayer?.jailFreeCards || 0 }).map((_, i) => (
                        <div key={`jail-${i}`} className="flex items-center gap-2 py-1">
                          <Checkbox
                            checked={counterOfferedJailCards > i}
                            onCheckedChange={() => setCounterOfferedJailCards(counterOfferedJailCards > i ? i : i + 1)}
                            data-testid={`checkbox-counter-offer-jail-${i}`}
                          />
                          <Key className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600">{t("trade.jailFreeCard")}</span>
                        </div>
                      ))}
                    </>
                  )}
                </ScrollArea>
                <div className="space-y-2">
                  <Label className="text-xs">{t("trade.moneyOffer")}</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[counterOfferedMoney]}
                      onValueChange={([val]) => setCounterOfferedMoney(val)}
                      max={currentPlayer?.money || 0}
                      step={10}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={currentPlayer?.money || 0}
                      value={counterOfferedMoney}
                      onChange={e => setCounterOfferedMoney(Math.min(parseInt(e.target.value) || 0, currentPlayer?.money || 0))}
                      className="w-20 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("trade.youRequest")}</Label>
                <ScrollArea className="h-40 border rounded-md p-2">
                  {theirPropsForCounter.length === 0 && (counterTradeOpponent?.jailFreeCards || 0) === 0 ? (
                    <p className="text-xs text-muted-foreground">{t("trade.noProperties")}</p>
                  ) : (
                    <>
                      {theirPropsForCounter.map(op => (
                        <div key={op.tileId} className="flex items-center gap-2 py-1">
                          <Checkbox
                            checked={counterRequestedProperties.includes(op.tileId)}
                            onCheckedChange={() => toggleCounterProperty(op.tileId, false)}
                          />
                          <span className="text-xs">{getPropertyName(op.tileId)}</span>
                        </div>
                      ))}
                      {Array.from({ length: counterTradeOpponent?.jailFreeCards || 0 }).map((_, i) => (
                        <div key={`jail-${i}`} className="flex items-center gap-2 py-1">
                          <Checkbox
                            checked={counterRequestedJailCards > i}
                            onCheckedChange={() => setCounterRequestedJailCards(counterRequestedJailCards > i ? i : i + 1)}
                            data-testid={`checkbox-counter-request-jail-${i}`}
                          />
                          <Key className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600">{t("trade.jailFreeCard")}</span>
                        </div>
                      ))}
                    </>
                  )}
                </ScrollArea>
                <div className="space-y-2">
                  <Label className="text-xs">{t("trade.moneyRequest")}</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[counterRequestedMoney]}
                      onValueChange={([val]) => setCounterRequestedMoney(val)}
                      max={counterTradeOpponent?.money || 0}
                      step={10}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={counterTradeOpponent?.money || 0}
                      value={counterRequestedMoney}
                      onChange={e => setCounterRequestedMoney(Math.min(parseInt(e.target.value) || 0, counterTradeOpponent?.money || 0))}
                      className="w-20 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounterDialog(false)}>
              {t("general.cancel")}
            </Button>
            <Button 
              onClick={handleCounterTrade}
              disabled={counterOfferedProperties.length === 0 && counterOfferedMoney === 0 && counterRequestedProperties.length === 0 && counterRequestedMoney === 0 && counterOfferedJailCards === 0 && counterRequestedJailCards === 0}
              data-testid="button-send-counter"
            >
              {t("trade.sendCounter")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setShowTradeDialog(true)} 
        variant="outline" 
        className="w-full gap-2"
        disabled={otherPlayers.length === 0}
        data-testid="button-trade"
      >
        <ArrowRightLeft className="w-4 h-4" />
        {t("trade.proposeButton")}
      </Button>

      <Dialog open={showTradeDialog} onOpenChange={setShowTradeDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("trade.title")}</DialogTitle>
            <DialogDescription>{t("trade.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto space-y-4">
            <div className="space-y-2">
              <Label>{t("trade.selectPlayer")}</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("trade.selectPlayerPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {otherPlayers.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                        {player.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlayerId && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("trade.youOffer")}</Label>
                    <ScrollArea className="h-40 border rounded-md p-2">
                      {myProperties.length === 0 && (currentPlayer?.jailFreeCards || 0) === 0 ? (
                        <p className="text-xs text-muted-foreground">{t("trade.noProperties")}</p>
                      ) : (
                        <>
                          {myProperties.map(op => (
                            <div key={op.tileId} className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={offeredProperties.includes(op.tileId)}
                                onCheckedChange={() => toggleProperty(op.tileId, true)}
                              />
                              <span className="text-xs">{getPropertyName(op.tileId)}</span>
                            </div>
                          ))}
                          {Array.from({ length: currentPlayer?.jailFreeCards || 0 }).map((_, i) => (
                            <div key={`jail-${i}`} className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={offeredJailFreeCards > i}
                                onCheckedChange={() => setOfferedJailFreeCards(offeredJailFreeCards > i ? i : i + 1)}
                                data-testid={`checkbox-offer-jail-${i}`}
                              />
                              <Key className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600">{t("trade.jailFreeCard")}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </ScrollArea>
                    <div className="space-y-2">
                      <Label className="text-xs">{t("trade.moneyOffer")}</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[offeredMoney]}
                          onValueChange={([val]) => setOfferedMoney(val)}
                          max={currentPlayer?.money || 0}
                          step={10}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={currentPlayer?.money || 0}
                          value={offeredMoney}
                          onChange={e => setOfferedMoney(Math.min(parseInt(e.target.value) || 0, currentPlayer?.money || 0))}
                          className="w-20 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("trade.youRequest")}</Label>
                    <ScrollArea className="h-40 border rounded-md p-2">
                      {theirProperties.length === 0 && (selectedPlayer?.jailFreeCards || 0) === 0 ? (
                        <p className="text-xs text-muted-foreground">{t("trade.noProperties")}</p>
                      ) : (
                        <>
                          {theirProperties.map(op => (
                            <div key={op.tileId} className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={requestedProperties.includes(op.tileId)}
                                onCheckedChange={() => toggleProperty(op.tileId, false)}
                              />
                              <span className="text-xs">{getPropertyName(op.tileId)}</span>
                            </div>
                          ))}
                          {Array.from({ length: selectedPlayer?.jailFreeCards || 0 }).map((_, i) => (
                            <div key={`jail-${i}`} className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={requestedJailFreeCards > i}
                                onCheckedChange={() => setRequestedJailFreeCards(requestedJailFreeCards > i ? i : i + 1)}
                                data-testid={`checkbox-request-jail-${i}`}
                              />
                              <Key className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600">{t("trade.jailFreeCard")}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </ScrollArea>
                    <div className="space-y-2">
                      <Label className="text-xs">{t("trade.moneyRequest")}</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[requestedMoney]}
                          onValueChange={([val]) => setRequestedMoney(val)}
                          max={selectedPlayer?.money || 0}
                          step={10}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={selectedPlayer?.money || 0}
                          value={requestedMoney}
                          onChange={e => setRequestedMoney(Math.min(parseInt(e.target.value) || 0, selectedPlayer?.money || 0))}
                          className="w-20 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTradeDialog(false)}>
              {t("general.cancel")}
            </Button>
            <Button 
              onClick={handleProposeTrade}
              disabled={!selectedPlayerId || (offeredProperties.length === 0 && offeredMoney === 0 && requestedProperties.length === 0 && requestedMoney === 0 && offeredJailFreeCards === 0 && requestedJailFreeCards === 0)}
            >
              {t("trade.propose")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
