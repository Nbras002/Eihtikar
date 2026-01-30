import { BOARD_TILES } from "@shared/gameData";
import { GameTile } from "./GameTile";
import { useLanguage } from "@/lib/languageContext";
import type { Player, OwnedProperty } from "@shared/schema";

interface GameBoardProps {
  players: Player[];
  ownedProperties: OwnedProperty[];
  onTileClick?: (tileId: number) => void;
}

export function GameBoard({ players, ownedProperties, onTileClick }: GameBoardProps) {
  const { t } = useLanguage();
  
  const getPlayersOnTile = (tileId: number) => {
    return players.filter(p => p.position === tileId && !p.isBankrupt);
  };

  const getOwnership = (tileId: number) => {
    return ownedProperties.find(op => op.tileId === tileId);
  };

  const getOwnerInfo = (tileId: number) => {
    const ownership = getOwnership(tileId);
    if (!ownership) return undefined;
    const owner = players.find(p => p.id === ownership.ownerId);
    return owner ? { color: owner.color, name: owner.name } : undefined;
  };

  // Board layout: CLOCKWISE movement (bottom → right → top → left)
  // Start at bottom-left, move right along bottom, up right side, left along top, down left side
  // Bottom: tiles 0-10, col 1 (left) to col 11 (right)
  // Right: tiles 11-19, row 10 (bottom) to row 2 (top)
  // Top: tiles 20-30, col 11 (right) to col 1 (left)
  // Left: tiles 31-39, row 2 (top) to row 10 (bottom)
  const bottomTiles = BOARD_TILES.slice(0, 11); // tiles 0-10
  const rightTiles = BOARD_TILES.slice(11, 20); // tiles 11-19
  const topTiles = BOARD_TILES.slice(20, 31); // tiles 20-30
  const leftTiles = BOARD_TILES.slice(31, 40); // tiles 31-39

  return (
    <div className="w-full aspect-square max-w-[min(90vw,600px)] sm:max-w-[min(95vw,750px)] md:max-w-[min(95vw,900px)] lg:max-w-[min(95vw,1020px)] mx-auto p-1 sm:p-2">
      <div className="w-full h-full grid grid-cols-11 grid-rows-11 gap-[0.5px] sm:gap-[1px] bg-border rounded-lg overflow-hidden shadow-lg">
        {topTiles.map((tile, index) => (
          <div
            key={tile.id}
            style={{
              gridColumn: 11 - index, // tile 20 at col 11 (right), tile 30 at col 1 (left)
              gridRow: 1,
            }}
          >
            <GameTile
              tile={tile}
              players={getPlayersOnTile(tile.id)}
              ownership={getOwnership(tile.id)}
              ownerInfo={getOwnerInfo(tile.id)}
              position="top"
              isCorner={index === 0 || index === 10}
              onClick={() => onTileClick?.(tile.id)}
            />
          </div>
        ))}

        {leftTiles.map((tile, index) => (
          <div
            key={tile.id}
            style={{
              gridColumn: 1,
              gridRow: index + 2, // tile 31 at row 2 (top), tile 39 at row 10 (bottom)
            }}
          >
            <GameTile
              tile={tile}
              players={getPlayersOnTile(tile.id)}
              ownership={getOwnership(tile.id)}
              ownerInfo={getOwnerInfo(tile.id)}
              position="left"
              onClick={() => onTileClick?.(tile.id)}
            />
          </div>
        ))}

        <div 
          className="bg-card flex items-center justify-center"
          style={{
            gridColumn: "2 / 11",
            gridRow: "2 / 11",
          }}
        >
          <div className="text-center p-2 sm:p-4">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-primary mb-1 sm:mb-2">{t("app.boardTitle")}</h2>
            <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm lg:text-base">{t("app.boardSubtitle")}</p>
          </div>
        </div>

        {rightTiles.map((tile, index) => (
          <div
            key={tile.id}
            style={{
              gridColumn: 11,
              gridRow: 10 - index, // tile 11 at row 10 (bottom), tile 19 at row 2 (top)
            }}
          >
            <GameTile
              tile={tile}
              players={getPlayersOnTile(tile.id)}
              ownership={getOwnership(tile.id)}
              ownerInfo={getOwnerInfo(tile.id)}
              position="right"
              onClick={() => onTileClick?.(tile.id)}
            />
          </div>
        ))}

        {bottomTiles.map((tile, index) => (
          <div
            key={tile.id}
            style={{
              gridColumn: index + 1, // tile 0 at col 1 (left), tile 10 at col 11 (right)
              gridRow: 11,
            }}
          >
            <GameTile
              tile={tile}
              players={getPlayersOnTile(tile.id)}
              ownership={getOwnership(tile.id)}
              ownerInfo={getOwnerInfo(tile.id)}
              position="bottom"
              isCorner={index === 0 || index === 10}
              onClick={() => onTileClick?.(tile.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
