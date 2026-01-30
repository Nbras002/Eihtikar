import type { Tile, GameCard } from "./schema";

// 40 tiles for the board - Arabic property names
export const BOARD_TILES: Tile[] = [
  // Bottom row (right to left for RTL)
  { id: 0, type: "start", name: "Start", nameAr: "البداية" },
  {
    id: 1,
    type: "property",
    name: "Cairo City",
    nameAr: "مدينة القاهرة",
    color: "brown",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
  },
  {
    id: 2,
    type: "community",
    name: "Community Chest",
    nameAr: "صندوق المجتمع",
  },
  {
    id: 3,
    type: "property",
    name: "Damascus City",
    nameAr: "مدينة دمشق",
    color: "brown",
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
  },
  {
    id: 4,
    type: "tax",
    name: "Income Tax",
    nameAr: "ضريبة الدخل",
    taxAmount: 200,
  },
  {
    id: 5,
    type: "station",
    name: "Misr Railway Station",
    nameAr: "محطة قطار مصر",
    price: 200,
    rent: [25, 50, 100, 200],
  },
  {
    id: 6,
    type: "property",
    name: "Beirut City",
    nameAr: "مدينة بيروت",
    color: "lightblue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
  },
  { id: 7, type: "chance", name: "Chance", nameAr: "فرصة" },
  {
    id: 8,
    type: "property",
    name: "Amman City",
    nameAr: "مدينة عَمان",
    color: "lightblue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
  },
  {
    id: 9,
    type: "property",
    name: "Jerusalem City",
    nameAr: "مدينة القدس",
    color: "lightblue",
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
  },

  // Left column (bottom to top)
  { id: 10, type: "jail", name: "Jail", nameAr: "السجن" },
  {
    id: 11,
    type: "property",
    name: "Mosul City",
    nameAr: "مدينة الموصل",
    color: "pink",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
  },
  {
    id: 12,
    type: "utility",
    name: "Electric Company",
    nameAr: "شركة الكهرباء",
    price: 150,
  },
  {
    id: 13,
    type: "property",
    name: "Basra City",
    nameAr: "مدينة البصرة",
    color: "pink",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
  },
  {
    id: 14,
    type: "property",
    name: "Baghdad City",
    nameAr: "مدينة بغداد",
    color: "pink",
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
  },
  {
    id: 15,
    type: "station",
    name: "Tanger Railway Station",
    nameAr: "محطة قطار طنجة",
    price: 200,
    rent: [25, 50, 100, 200],
  },
  {
    id: 16,
    type: "property",
    name: "Tunisia City",
    nameAr: "مدينة تونس",
    color: "orange",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
  },
  {
    id: 17,
    type: "community",
    name: "Community Chest",
    nameAr: "صندوق المجتمع",
  },
  {
    id: 18,
    type: "property",
    name: "Algiers City",
    nameAr: "مدينة الجزائر",
    color: "orange",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
  },
  {
    id: 19,
    type: "property",
    name: "Rabat City",
    nameAr: "مدينة الرباط",
    color: "orange",
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
  },

  // Top row (left to right, but displayed right to left)
  { id: 20, type: "free-parking", name: "Free Parking", nameAr: "موقف مجاني" },
  {
    id: 21,
    type: "property",
    name: "Kuwait City",
    nameAr: "مدينة الكويت",
    color: "red",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
  },
  { id: 22, type: "chance", name: "Chance", nameAr: "فرصة" },
  {
    id: 23,
    type: "property",
    name: "Manama City",
    nameAr: "مدينة المنامة",
    color: "red",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
  },
  {
    id: 24,
    type: "property",
    name: "Doha City",
    nameAr: "مدينة الدوحة",
    color: "red",
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
  },
  {
    id: 25,
    type: "station",
    name: "Dubai Railway Station",
    nameAr: "محطة قطار دبي",
    price: 200,
    rent: [25, 50, 100, 200],
  },
  {
    id: 26,
    type: "property",
    name: "Muscat City",
    nameAr: "مدينة مسقط",
    color: "yellow",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
  },
  {
    id: 27,
    type: "property",
    name: "Dubai City",
    nameAr: "مدينة دبي",
    color: "yellow",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
  },
  {
    id: 28,
    type: "utility",
    name: "Water Company",
    nameAr: "شركة المياه",
    price: 150,
  },
  {
    id: 29,
    type: "property",
    name: "Abu Dhabi City",
    nameAr: "مدينة أبوظبي",
    color: "yellow",
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
  },

  // Right column (top to bottom)
  { id: 30, type: "go-to-jail", name: "Go to Jail", nameAr: "اذهب للسجن" },
  {
    id: 31,
    type: "property",
    name: "Dammam City",
    nameAr: "مدينة الدمام",
    color: "green",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
  },
  {
    id: 32,
    type: "property",
    name: "Jeddah City",
    nameAr: "مدينة جدة",
    color: "green",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
  },
  {
    id: 33,
    type: "community",
    name: "Community Chest",
    nameAr: "صندوق المجتمع",
  },
  {
    id: 34,
    type: "property",
    name: "Riyadh City",
    nameAr: "مدينة الرياض",
    color: "green",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
  },
  {
    id: 35,
    type: "station",
    name: "Mecca Railway Station",
    nameAr: "محطة قطار مكة المكرمة",
    price: 200,
    rent: [25, 50, 100, 200],
  },
  { id: 36, type: "chance", name: "Chance", nameAr: "فرصة" },
  {
    id: 37,
    type: "property",
    name: "Medina City",
    nameAr: "المدينة المنورة",
    color: "blue",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
  },
  {
    id: 38,
    type: "tax",
    name: "Income Tax",
    nameAr: "ضريبة الدخل",
    taxAmount: 100,
  },
  {
    id: 39,
    type: "property",
    name: "Makkah City",
    nameAr: "مدينة مكة المكرمة",
    color: "blue",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
  },
];

// Chance cards - 16 official cards
export const CHANCE_CARDS: GameCard[] = [
  {
    id: 1,
    type: "chance",
    textAr: "تقدم إلى مكة المكرمة",
    action: { type: "move", position: 39 },
  },
  {
    id: 2,
    type: "chance",
    textAr: "تقدم إلى البداية (احصل على ₩200)",
    action: { type: "move", position: 0 },
  },
  {
    id: 3,
    type: "chance",
    textAr: "تقدم إلى بغداد. إذا مررت بالبداية احصل على ₩200",
    action: { type: "move", position: 14 },
  },
  {
    id: 4,
    type: "chance",
    textAr: "تقدم إلى بيروت. إذا مررت بالبداية احصل على ₩200",
    action: { type: "move", position: 6 },
  },
  {
    id: 5,
    type: "chance",
    textAr: "تقدم إلى أقرب محطة قطار. إذا كانت غير مملوكة يمكنك شراؤها. إذا كانت مملوكة ادفع ضعف الإيجار",
    action: { type: "move-nearest-railroad" },
  },
  {
    id: 6,
    type: "chance",
    textAr: "تقدم إلى أقرب محطة قطار. إذا كانت غير مملوكة يمكنك شراؤها. إذا كانت مملوكة ادفع ضعف الإيجار",
    action: { type: "move-nearest-railroad" },
  },
  {
    id: 7,
    type: "chance",
    textAr: "تقدم إلى أقرب شركة خدمات. إذا كانت غير مملوكة يمكنك شراؤها. إذا كانت مملوكة ارمِ النرد وادفع 10 أضعاف الرقم",
    action: { type: "move-nearest-utility" },
  },
  {
    id: 8,
    type: "chance",
    textAr: "البنك يدفع لك أرباح ₩50",
    action: { type: "collect", amount: 50 },
  },
  {
    id: 9,
    type: "chance",
    textAr: "بطاقة خروج من السجن مجاناً",
    action: { type: "jail-free" },
  },
  {
    id: 10,
    type: "chance",
    textAr: "ارجع 3 خطوات للخلف",
    action: { type: "move-back", spaces: 3 },
  },
  {
    id: 11,
    type: "chance",
    textAr: "اذهب للسجن مباشرة. لا تمر بالبداية ولا تحصل على ₩200",
    action: { type: "jail" },
  },
  {
    id: 12,
    type: "chance",
    textAr: "قم بإصلاحات عامة لعقاراتك. ادفع ₩25 عن كل منزل و₩100 عن كل فندق",
    action: { type: "repairs", houseAmount: 25, hotelAmount: 100 },
  },
  {
    id: 13,
    type: "chance",
    textAr: "غرامة سرعة ₩15",
    action: { type: "pay", amount: 15 },
  },
  {
    id: 14,
    type: "chance",
    textAr: "قم برحلة إلى محطة قطار مصر. إذا مررت بالبداية احصل على ₩200",
    action: { type: "move", position: 5 },
  },
  {
    id: 15,
    type: "chance",
    textAr: "تم انتخابك رئيساً لمجلس الإدارة. ادفع ₩50 لكل لاعب",
    action: { type: "pay-each", amount: 50 },
  },
  {
    id: 16,
    type: "chance",
    textAr: "استحق قرض البناء الخاص بك. احصل على ₩150",
    action: { type: "collect", amount: 150 },
  },
];

// Community Chest cards - 16 official cards
export const COMMUNITY_CARDS: GameCard[] = [
  {
    id: 1,
    type: "community",
    textAr: "تقدم إلى البداية (احصل على ₩200)",
    action: { type: "move", position: 0 },
  },
  {
    id: 2,
    type: "community",
    textAr: "خطأ في البنك لصالحك. احصل على ₩200",
    action: { type: "collect", amount: 200 },
  },
  {
    id: 3,
    type: "community",
    textAr: "أتعاب الطبيب. ادفع ₩50",
    action: { type: "pay", amount: 50 },
  },
  {
    id: 4,
    type: "community",
    textAr: "من بيع الأسهم تحصل على ₩50",
    action: { type: "collect", amount: 50 },
  },
  {
    id: 5,
    type: "community",
    textAr: "بطاقة خروج من السجن مجاناً",
    action: { type: "jail-free" },
  },
  {
    id: 6,
    type: "community",
    textAr: "اذهب للسجن مباشرة. لا تمر بالبداية ولا تحصل على ₩200",
    action: { type: "jail" },
  },
  {
    id: 7,
    type: "community",
    textAr: "استحق صندوق العطلات. احصل على ₩100",
    action: { type: "collect", amount: 100 },
  },
  {
    id: 8,
    type: "community",
    textAr: "استرداد ضريبة الدخل. احصل على ₩20",
    action: { type: "collect", amount: 20 },
  },
  {
    id: 9,
    type: "community",
    textAr: "عيد ميلادك! احصل على ₩10 من كل لاعب",
    action: { type: "collect-from-each", amount: 10 },
  },
  {
    id: 10,
    type: "community",
    textAr: "استحق تأمين الحياة. احصل على ₩100",
    action: { type: "collect", amount: 100 },
  },
  {
    id: 11,
    type: "community",
    textAr: "ادفع رسوم المستشفى ₩100",
    action: { type: "pay", amount: 100 },
  },
  {
    id: 12,
    type: "community",
    textAr: "ادفع رسوم المدرسة ₩50",
    action: { type: "pay", amount: 50 },
  },
  {
    id: 13,
    type: "community",
    textAr: "احصل على رسوم استشارة ₩25",
    action: { type: "collect", amount: 25 },
  },
  {
    id: 14,
    type: "community",
    textAr: "تم تقييمك لإصلاح الشوارع. ₩40 عن كل منزل و₩115 عن كل فندق",
    action: { type: "repairs", houseAmount: 40, hotelAmount: 115 },
  },
  {
    id: 15,
    type: "community",
    textAr: "فزت بالمركز الثاني في مسابقة الجمال. احصل على ₩10",
    action: { type: "collect", amount: 10 },
  },
  {
    id: 16,
    type: "community",
    textAr: "ورثت ₩100",
    action: { type: "collect", amount: 100 },
  },
];

// Get tile by ID
export function getTileById(id: number): Tile | undefined {
  return BOARD_TILES.find((tile) => tile.id === id);
}

// Get property color
export function getPropertyColorHex(color: string): string {
  const colors: Record<string, string> = {
    brown: "#8B4513",
    lightblue: "#87CEEB",
    pink: "#FF69B4",
    orange: "#FFA500",
    red: "#EF4444",
    yellow: "#EAB308",
    green: "#22C55E",
    blue: "#3B82F6",
    station: "#4A4A4A",
    utility: "#6B7280",
  };
  return colors[color] || "#6B7280";
}

// Get random card
export function getRandomCard(type: "chance" | "community"): GameCard {
  const cards = type === "chance" ? CHANCE_CARDS : COMMUNITY_CARDS;
  return cards[Math.floor(Math.random() * cards.length)];
}

// Get all properties in a color group
export function getPropertiesByColor(color: string): number[] {
  return BOARD_TILES
    .filter(tile => tile.type === "property" && (tile as any).color === color)
    .map(tile => tile.id);
}

// Get the color of a property
export function getPropertyColor(tileId: number): string | null {
  const tile = getTileById(tileId);
  if (tile && tile.type === "property" && "color" in tile) {
    return tile.color;
  }
  return null;
}
