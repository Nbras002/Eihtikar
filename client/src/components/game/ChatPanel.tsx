import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/languageContext";
import type { ChatMessage, Player } from "@shared/schema";
import { MessageCircle, Send } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  players: Player[];
  onSendMessage: (text: string) => void;
  currentPlayerId: string;
}

export function ChatPanel({ messages, players, onSendMessage, currentPlayerId }: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlayerColor = (senderId: string) => {
    const player = players.find(p => p.id === senderId);
    return player?.color || "#6B7280";
  };

  const formatTime = (timestamp: number) => {
    const locale = language === "ar" ? "ar-EG" : "en-US";
    return new Date(timestamp).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-4 h-4" />
          {t("game.chat")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-0">
        <ScrollArea className="flex-1 h-[300px] pe-3" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                {t("general.noMessages")}
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg p-2",
                    message.isSystem 
                      ? "bg-muted/50 text-center" 
                      : message.senderId === currentPlayerId
                        ? "bg-primary/10 me-4"
                        : "bg-muted/30 ms-4"
                  )}
                  data-testid={`message-${message.id}`}
                >
                  {!message.isSystem && (
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPlayerColor(message.senderId) }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground ms-auto">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <p className={cn(
                    "text-sm",
                    message.isSystem ? "text-muted-foreground italic" : "text-foreground"
                  )}>
                    {message.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-3">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("game.chatPlaceholder")}
            className="flex-1"
            maxLength={500}
            data-testid="input-chat"
          />
          <Button 
            onClick={handleSend} 
            size="icon"
            disabled={!inputText.trim()}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
