import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useGame } from "@/lib/gameContext";
import { useLanguage } from "@/lib/languageContext";
import { 
  Copy, 
  Check, 
  Crown, 
  Users, 
  Play, 
  Settings, 
  LogOut, 
  Dices, 
  Clock,
  UserX,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Lobby() {
  const [, navigate] = useLocation();
  const { room, currentPlayer, isRoomOwner, disconnect, startGame, setReady, kickPlayer, updateSettings } = useGame();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate("/");
    }
    if (room?.gameState.phase === "playing") {
      navigate("/game");
    }
  }, [room, navigate]);

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    disconnect();
    navigate("/");
  };

  const canStartGame = isRoomOwner && room.players.length >= 2 && room.players.every(p => p.isReady || p.id === room.ownerId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Dices className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{room.name || t("lobby.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("lobby.title")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLeave} data-testid="button-leave">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-start">
                  <p className="text-sm text-muted-foreground mb-1">{t("lobby.roomCode")}</p>
                  <p className="text-4xl font-bold font-mono tracking-widest text-foreground" data-testid="text-room-code">
                    {room.code}
                  </p>
                </div>
                <Button onClick={handleCopyCode} variant="outline" className="gap-2" data-testid="button-copy-code">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t("general.copied") : t("lobby.copyCode")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("lobby.players")} ({room.players.length}/{room.settings.maxPlayers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {room.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        data-testid={`player-card-${player.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2" style={{ borderColor: player.color }}>
                            <AvatarFallback style={{ backgroundColor: player.color }} className="text-white font-bold">
                              {player.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{player.name}</span>
                              {player.id === room.ownerId && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              {player.id === currentPlayer.id && (
                                <Badge variant="outline" className="text-xs">{t("lobby.you")}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {player.isConnected ? t("general.connected") : t("general.disconnected")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {player.id !== room.ownerId && (
                            <Badge variant={player.isReady ? "default" : "secondary"}>
                              {player.isReady ? t("lobby.ready") : t("lobby.notReady")}
                            </Badge>
                          )}
                          {isRoomOwner && player.id !== currentPlayer.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => kickPlayer(player.id)}
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-kick-${player.id}`}
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {Array.from({ length: room.settings.maxPlayers - room.players.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-border text-muted-foreground"
                      >
                        <Users className="w-5 h-5 me-2" />
                        {t("lobby.waitingForPlayers")}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t("lobby.settings")}
                </CardTitle>
                {isRoomOwner && (
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-settings">
                        {t("general.edit")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t("lobby.settings")}</DialogTitle>
                      </DialogHeader>
                      <SettingsForm 
                        settings={room.settings} 
                        onUpdate={(settings) => {
                          updateSettings(settings);
                          setSettingsOpen(false);
                        }} 
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("lobby.initialMoney")}</p>
                    <p className="text-lg font-bold text-foreground">₩{room.settings.initialMoney.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("lobby.diceCount")}</p>
                    <p className="text-lg font-bold text-foreground">
                      {room.settings.diceCount === 1 ? t("lobby.dice1") : t("lobby.dice2")}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("lobby.turnTime")}</p>
                    <p className="text-lg font-bold text-foreground">{room.settings.turnTimeLimit} {t("format.seconds")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t("lobby.maxPlayers")}</p>
                    <p className="text-lg font-bold text-foreground">{room.settings.maxPlayers}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{t("lobby.enableTax")}</span>
                    <Badge variant={room.settings.enableTax ? "default" : "secondary"}>
                      {room.settings.enableTax ? t("general.yes") : t("general.no")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{t("lobby.enableJail")}</span>
                    <Badge variant={room.settings.enableJail ? "default" : "secondary"}>
                      {room.settings.enableJail ? t("general.yes") : t("general.no")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isRoomOwner && currentPlayer.id !== room.ownerId && (
              <Button
                onClick={() => setReady(!currentPlayer.isReady)}
                variant={currentPlayer.isReady ? "secondary" : "default"}
                size="lg"
                className="gap-2"
                data-testid="button-ready"
              >
                {currentPlayer.isReady ? (
                  <>
                    <Clock className="w-5 h-5" />
                    {t("general.cancelReady")}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {t("general.imReady")}
                  </>
                )}
              </Button>
            )}

            {isRoomOwner && (
              <Button
                onClick={startGame}
                disabled={!canStartGame}
                size="lg"
                className="gap-2"
                data-testid="button-start-game"
              >
                <Play className="w-5 h-5" />
                {t("lobby.startGame")}
              </Button>
            )}
          </div>

          {isRoomOwner && !canStartGame && (
            <p className="text-center text-sm text-muted-foreground">
              {room.players.length < 2 
                ? t("lobby.minPlayersRequired")
                : t("lobby.allPlayersReady")}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function SettingsForm({ 
  settings, 
  onUpdate 
}: { 
  settings: import("@shared/schema").RoomSettings;
  onUpdate: (settings: Partial<import("@shared/schema").RoomSettings>) => void;
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("lobby.initialMoney")}</Label>
        <Select
          value={localSettings.initialMoney.toString()}
          onValueChange={(v) => setLocalSettings({ ...localSettings, initialMoney: parseInt(v) })}
        >
          <SelectTrigger data-testid="select-initial-money">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="500">₩500</SelectItem>
            <SelectItem value="750">₩750</SelectItem>
            <SelectItem value="1000">₩1,000</SelectItem>
            <SelectItem value="1250">₩1,250</SelectItem>
            <SelectItem value="1500">₩1,500</SelectItem>
            <SelectItem value="1750">₩1,750</SelectItem>
            <SelectItem value="2000">₩2,000</SelectItem>
            <SelectItem value="2500">₩2,500</SelectItem>
            <SelectItem value="3000">₩3,000</SelectItem>
            <SelectItem value="4000">₩4,000</SelectItem>
            <SelectItem value="5000">₩5,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("lobby.diceCount")}</Label>
        <Select
          value={localSettings.diceCount.toString()}
          onValueChange={(v) => setLocalSettings({ ...localSettings, diceCount: parseInt(v) as 1 | 2 })}
        >
          <SelectTrigger data-testid="select-dice-count">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("lobby.dice1")} (1-6)</SelectItem>
            <SelectItem value="2">{t("lobby.dice2")} (2-12)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("lobby.turnTime")}</Label>
        <Select
          value={localSettings.turnTimeLimit.toString()}
          onValueChange={(v) => setLocalSettings({ ...localSettings, turnTimeLimit: parseInt(v) })}
        >
          <SelectTrigger data-testid="select-turn-time">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 {t("format.seconds")}</SelectItem>
            <SelectItem value="45">45 {t("format.seconds")}</SelectItem>
            <SelectItem value="60">60 {t("format.seconds")}</SelectItem>
            <SelectItem value="90">90 {t("format.seconds")}</SelectItem>
            <SelectItem value="120">120 {t("format.seconds")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("lobby.maxPlayers")}</Label>
        <Select
          value={localSettings.maxPlayers.toString()}
          onValueChange={(v) => setLocalSettings({ ...localSettings, maxPlayers: parseInt(v) })}
        >
          <SelectTrigger data-testid="select-max-players">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">{t("format.2players")}</SelectItem>
            <SelectItem value="3">{t("format.3players")}</SelectItem>
            <SelectItem value="4">{t("format.4players")}</SelectItem>
            <SelectItem value="5">{t("format.5players")}</SelectItem>
            <SelectItem value="6">{t("format.6players")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>{t("lobby.enableTax")}</Label>
        <Switch
          checked={localSettings.enableTax}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableTax: checked })}
          data-testid="switch-tax"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>{t("lobby.enableJail")}</Label>
        <Switch
          checked={localSettings.enableJail}
          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableJail: checked })}
          data-testid="switch-jail"
        />
      </div>

      <Button onClick={() => onUpdate(localSettings)} className="w-full" data-testid="button-save-settings">
        {t("general.saveSettings")}
      </Button>
    </div>
  );
}
