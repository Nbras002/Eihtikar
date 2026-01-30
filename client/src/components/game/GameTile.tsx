import type { Tile, Player, OwnedProperty } from "@shared/schema";
import { getPropertyColorHex } from "@shared/gameData";
import { useLanguage } from "@/lib/languageContext";
import { Home, Hotel, Train, Zap, Droplets, HelpCircle, Gift, Landmark, Lock, ArrowLeft, ParkingCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GameTileProps {
  tile: Tile;
  players: Player[];
  ownership?: OwnedProperty;
  ownerInfo?: { color: string; name: string };
  position: "top" | "bottom" | "left" | "right";
  isCorner?: boolean;
  onClick?: () => void;
}

export function GameTile({ tile, players, ownership, ownerInfo, position, isCorner, onClick }: GameTileProps) {
  const { language, formatCurrency } = useLanguage();
  const isProperty = tile.type === "property";
  const isStation = tile.type === "station";
  const isUtility = tile.type === "utility";
  const isPurchasable = isProperty || isStation || isUtility;

  const tileName = language === "ar" ? tile.nameAr : tile.name;

  const getIcon = () => {
    switch (tile.type) {
      case "start":
        return <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-primary" />;
      case "jail":
        return <Lock className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-orange-500" />;
      case "go-to-jail":
        return <Lock className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-red-500" />;
      case "free-parking":
        return <ParkingCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-green-500" />;
      case "chance":
        return <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-blue-500" />;
      case "community":
        return <Gift className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-purple-500" />;
      case "tax":
        return <Landmark className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-red-500" />;
      case "station":
        return <Train className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />;
      case "utility":
        return tile.name.includes("Electric") ? 
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500" /> : 
          <Droplets className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const colorBarStyle = isProperty ? {
    backgroundColor: getPropertyColorHex((tile as any).color),
  } : isStation ? {
    backgroundColor: "#4A4A4A",
  } : undefined;

  const isVertical = position === "left" || position === "right";

  // Color bar should face INWARD (toward the center of the board) - using absolute positioning
  const getColorBarPosition = () => {
    if (position === "top") return "absolute bottom-0 left-0 right-0 h-3";
    if (position === "bottom") return "absolute top-0 left-0 right-0 h-3";
    if (position === "left") return "absolute left-0 top-0 bottom-0 w-3";
    if (position === "right") return "absolute right-0 top-0 bottom-0 w-3";
    return "";
  };

  // Owner bar should be on OUTER edge (toward the board edge)
  const getOwnerBarPosition = () => {
    if (position === "top") return "top-0 left-0 right-0 h-4";
    if (position === "bottom") return "bottom-0 left-0 right-0 h-4";
    if (position === "left") return "top-0 bottom-0 right-0 w-4";
    if (position === "right") return "top-0 bottom-0 left-0 w-4";
    return "";
  };


  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full h-full bg-card flex cursor-pointer transition-all hover:z-10 hover:scale-105 group border border-border",
        isCorner && "flex-col justify-center items-center",
        !isCorner && position === "top" && "flex-col",
        !isCorner && position === "bottom" && "flex-col",
        !isCorner && position === "left" && "flex-row",
        !isCorner && position === "right" && "flex-row"
      )}
    >
      {colorBarStyle && !isCorner && (
        <div 
          className={cn(getColorBarPosition(), "z-0")}
          style={colorBarStyle}
        />
      )}

      <div className={cn(
        "flex-1 flex flex-col items-center justify-center p-0.5 min-w-0",
        isCorner && "p-1",
        !isCorner && colorBarStyle && position === "top" && "pb-3",
        !isCorner && colorBarStyle && position === "bottom" && "pt-3",
        !isCorner && colorBarStyle && position === "left" && "ps-3",
        !isCorner && colorBarStyle && position === "right" && "pe-3",
        // Rotate content for vertical tiles (left: bottom-to-top, right: top-to-bottom)
        !isCorner && position === "left" && "-rotate-90",
        !isCorner && position === "right" && "rotate-90"
      )}>
        {isCorner ? (
          <>
            {getIcon()}
            <span className="text-[6px] sm:text-[8px] md:text-xs font-medium text-center text-foreground leading-tight mt-1">
              {tileName}
            </span>
          </>
        ) : (
          <>
            {!isPurchasable && getIcon()}
            <span className="text-[5px] sm:text-[7px] md:text-[10px] font-medium text-center text-foreground leading-tight line-clamp-2">
              {tileName}
            </span>
            {isPurchasable && (
              <span className="text-[5px] sm:text-[6px] md:text-[9px] text-muted-foreground">
                {formatCurrency((tile as any).price)}
              </span>
            )}
          </>
        )}
      </div>

      {ownerInfo && !isCorner && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "absolute flex items-center justify-center overflow-hidden z-0 cursor-help", 
                getOwnerBarPosition()
              )}
              style={{ backgroundColor: ownerInfo.color }}
            >
              <span 
                className="font-bold text-white text-center leading-none whitespace-nowrap"
                style={{
                  fontSize: `clamp(4px, ${Math.max(4, 8 - ownerInfo.name.length * 0.3)}px, 7px)`,
                  ...(position === "left" ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } :
                      position === "right" ? { writingMode: "vertical-rl" as const } :
                      {})
                }}
              >
                {ownerInfo.name}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {ownerInfo.name}
          </TooltipContent>
        </Tooltip>
      )}

      {ownership && ownership.houses > 0 && !ownership.isMortgaged && colorBarStyle && (
        <div className={cn(
          "absolute flex gap-0.5 items-center justify-center z-10",
          position === "top" && "bottom-0 left-0 right-0 h-3 flex-row",
          position === "bottom" && "top-0 left-0 right-0 h-3 flex-row",
          position === "left" && "left-0 top-0 bottom-0 w-3 flex-col",
          position === "right" && "right-0 top-0 bottom-0 w-3 flex-col"
        )}>
          {ownership.houses === 5 ? (
            <Hotel className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white drop-shadow-md" />
          ) : (
            Array.from({ length: ownership.houses }).map((_, i) => (
              <Home key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 text-white drop-shadow-md" />
            ))
          )}
        </div>
      )}

      {ownership?.isMortgaged && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <FileText className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white drop-shadow-md" />
        </div>
      )}

      {players.length > 0 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
          {players.slice(0, 4).map((player) => (
            <div
              key={player.id}
              className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full border border-white shadow-sm animate-bounce-in"
              style={{ backgroundColor: player.color }}
            />
          ))}
          {players.length > 4 && (
            <span className="text-[6px] sm:text-[8px] text-muted-foreground">+{players.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}
