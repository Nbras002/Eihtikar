import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useGame } from "@/lib/gameContext";
import { useLanguage } from "@/lib/languageContext";
import { useToast } from "@/hooks/use-toast";
import { Dices, Users, Plus, LogIn, Crown, Sparkles } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { connect, room, isJoining, connectionError } = useGame();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (room) {
      navigate("/lobby");
    }
  }, [room, navigate]);

  useEffect(() => {
    if (connectionError) {
      toast({
        title: t("general.error"),
        description: connectionError,
        variant: "destructive",
      });
    }
  }, [connectionError, toast, t]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    connect("", playerName, true, roomName || undefined);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    connect(roomCode.toUpperCase(), playerName, false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Dices className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("app.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
              <Dices className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-2">{t("app.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("app.subtitle")}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <Tabs defaultValue="join" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="join" className="gap-2" data-testid="tab-join">
                    <LogIn className="w-4 h-4" />
                    {t("home.joinTab")}
                  </TabsTrigger>
                  <TabsTrigger value="create" className="gap-2" data-testid="tab-create">
                    <Plus className="w-4 h-4" />
                    {t("home.createTab")}
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="playerName" className="text-foreground">
                      {t("home.playerName")}
                    </Label>
                    <Input
                      id="playerName"
                      placeholder={t("home.playerNamePlaceholder")}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={20}
                      className="text-start"
                      data-testid="input-player-name"
                    />
                  </div>
                </div>

                <TabsContent value="join" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="roomCode" className="text-foreground">
                      {t("home.roomCode")}
                    </Label>
                    <Input
                      id="roomCode"
                      placeholder={t("home.roomCodePlaceholder")}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center tracking-widest font-mono text-lg uppercase"
                      data-testid="input-room-code"
                    />
                  </div>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || roomCode.length !== 6 || isJoining}
                    className="w-full gap-2"
                    size="lg"
                    data-testid="button-join-room"
                  >
                    <Users className="w-5 h-5" />
                    {isJoining ? t("general.connecting") : t("home.joinButton")}
                  </Button>
                </TabsContent>

                <TabsContent value="create" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="roomName" className="text-foreground">
                      {t("home.roomName")}
                    </Label>
                    <Input
                      id="roomName"
                      placeholder={t("home.roomNamePlaceholder")}
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      maxLength={30}
                      className="text-start"
                      data-testid="input-room-name"
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!playerName.trim() || isJoining}
                    className="w-full gap-2"
                    size="lg"
                    data-testid="button-create-room"
                  >
                    <Crown className="w-5 h-5" />
                    {isJoining ? t("general.connecting") : t("home.createButton")}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-card">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("home.upTo6Players")}</p>
            </div>
            <div className="p-4 rounded-lg bg-card">
              <Dices className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("home.instantPlay")}</p>
            </div>
            <div className="p-4 rounded-lg bg-card">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("home.liveChat")}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border">
        {t("app.footer")}
      </footer>
    </div>
  );
}
