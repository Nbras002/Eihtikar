import { cn } from "@/lib/utils";

interface DiceProps {
  value: number;
  isRolling?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Dice({ value, isRolling, size = "md" }: DiceProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const getDotPositions = (val: number) => {
    const positions: { x: string; y: string }[] = [];
    
    switch (val) {
      case 1:
        positions.push({ x: "50%", y: "50%" });
        break;
      case 2:
        positions.push({ x: "25%", y: "25%" });
        positions.push({ x: "75%", y: "75%" });
        break;
      case 3:
        positions.push({ x: "25%", y: "25%" });
        positions.push({ x: "50%", y: "50%" });
        positions.push({ x: "75%", y: "75%" });
        break;
      case 4:
        positions.push({ x: "25%", y: "25%" });
        positions.push({ x: "75%", y: "25%" });
        positions.push({ x: "25%", y: "75%" });
        positions.push({ x: "75%", y: "75%" });
        break;
      case 5:
        positions.push({ x: "25%", y: "25%" });
        positions.push({ x: "75%", y: "25%" });
        positions.push({ x: "50%", y: "50%" });
        positions.push({ x: "25%", y: "75%" });
        positions.push({ x: "75%", y: "75%" });
        break;
      case 6:
        positions.push({ x: "25%", y: "20%" });
        positions.push({ x: "25%", y: "50%" });
        positions.push({ x: "25%", y: "80%" });
        positions.push({ x: "75%", y: "20%" });
        positions.push({ x: "75%", y: "50%" });
        positions.push({ x: "75%", y: "80%" });
        break;
    }
    
    return positions;
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative bg-white dark:bg-gray-100 rounded-lg shadow-lg border-2 border-gray-200",
        isRolling && "animate-dice-roll"
      )}
    >
      {getDotPositions(value).map((pos, i) => (
        <div
          key={i}
          className={cn(
            dotSize[size],
            "absolute rounded-full bg-gray-900 -translate-x-1/2 -translate-y-1/2"
          )}
          style={{
            left: pos.x,
            top: pos.y,
          }}
        />
      ))}
    </div>
  );
}

interface DicePairProps {
  values: number[];
  isRolling?: boolean;
  size?: "sm" | "md" | "lg";
}

export function DicePair({ values, isRolling, size = "md" }: DicePairProps) {
  return (
    <div className="flex gap-3 items-center justify-center">
      {values.map((value, index) => (
        <Dice key={index} value={value} isRolling={isRolling} size={size} />
      ))}
    </div>
  );
}
