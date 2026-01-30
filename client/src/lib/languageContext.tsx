import { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface Translations {
  [key: string]: string;
}

const englishTranslations: Translations = {
  // App title
  "app.title": "Eihtikar",
  "app.subtitle": "Arabic Multiplayer Board Game",
  "app.footer": "Eihtikar Alpha Version - Arabic multiplayer board game",

  // Home page
  "home.playerName": "Player Name",
  "home.playerNamePlaceholder": "Enter your name",
  "home.joinTab": "Join Room",
  "home.createTab": "Create Room",
  "home.roomCode": "Room Code",
  "home.roomCodePlaceholder": "Enter 6-character room code",
  "home.roomName": "Room Name (optional)",
  "home.roomNamePlaceholder": "Your room name",
  "home.joinButton": "Join Room",
  "home.createButton": "Create New Room",
  "home.upTo6Players": "Up to 6 players",
  "home.instantPlay": "Instant play",
  "home.liveChat": "Live chat",

  // Lobby
  "lobby.title": "Game Lobby",
  "lobby.roomCode": "Room Code",
  "lobby.copyCode": "Copy Code",
  "lobby.players": "Players",
  "lobby.ready": "Ready",
  "lobby.notReady": "Not Ready",
  "lobby.owner": "Owner",
  "lobby.you": "You",
  "lobby.kick": "Kick",
  "lobby.settings": "Room Settings",
  "lobby.initialMoney": "Initial Money",
  "lobby.diceCount": "Dice Count",
  "lobby.dice1": "1 Die",
  "lobby.dice2": "2 Dice",
  "lobby.turnTime": "Turn Time (seconds)",
  "lobby.maxPlayers": "Max Players",
  "lobby.enableTax": "Enable Tax",
  "lobby.enableJail": "Enable Jail",
  "lobby.toggleReady": "Toggle Ready",
  "lobby.startGame": "Start Game",
  "lobby.leaveRoom": "Leave Room",
  "lobby.waitingForPlayers": "Waiting for players...",
  "lobby.minPlayersRequired": "At least 2 players required",
  "lobby.allPlayersReady": "Waiting for all players to be ready",

  // Game
  "game.yourTurn": "Your Turn",
  "game.turnOf": "'s Turn",
  "game.rollDice": "Roll Dice",
  "game.buyProperty": "Buy Property",
  "game.payRent": "Pay Rent",
  "game.endTurn": "End Turn",
  "game.useJailCard": "Use Jail Free Card",
  "game.payJailFine": "Pay Fine (₩50)",
  "game.inJail": "In Jail",
  "game.money": "Money",
  "game.properties": "Properties",
  "game.position": "Position",
  "game.jailFreeCards": "Jail Free Cards",
  "game.bankrupt": "Bankrupt",
  "game.winner": "Winner!",
  "game.gameOver": "Game Over",
  "game.congratulations": "Congratulations!",
  "game.won": "won the game!",
  "game.backToLobby": "Back to Lobby",
  "game.chat": "Chat",
  "game.chatPlaceholder": "Type a message...",
  "game.send": "Send",
  "game.events": "Events",
  "game.leaderboard": "Leaderboard",
  "game.rank": "Rank",
  "game.player": "Player",
  "game.netWorth": "Net Worth",

  // Property card
  "property.price": "Price",
  "property.rent": "Rent",
  "property.baseRent": "Base Rent",
  "property.with1House": "With 1 House",
  "property.with2Houses": "With 2 Houses",
  "property.with3Houses": "With 3 Houses",
  "property.with4Houses": "With 4 Houses",
  "property.withHotel": "With Hotel",
  "property.houseCost": "House Cost",
  "property.mortgaged": "Mortgaged",
  "property.owned": "Owned",
  "property.unowned": "Unowned",

  // Tile types
  "tile.start": "Start",
  "tile.jail": "Jail",
  "tile.freeParking": "Free Parking",
  "tile.goToJail": "Go to Jail",
  "tile.chance": "Chance",
  "tile.community": "Community Chest",
  "tile.tax": "Tax",
  "tile.station": "Station",
  "tile.utility": "Utility",

  // Cards
  "card.chance": "Chance Card",
  "card.community": "Community Chest Card",
  "card.dismiss": "OK",

  // General
  "general.loading": "Loading...",
  "general.error": "Error",
  "general.close": "Close",
  "general.cancel": "Cancel",
  "general.confirm": "Confirm",
  "general.yes": "Yes",
  "general.no": "No",
  "general.active": "active",
  "general.connected": "Connected",
  "general.disconnected": "Disconnected",
  "general.copied": "Copied!",
  "general.edit": "Edit",
  "general.save": "Save",
  "general.saveSettings": "Save Settings",
  "general.cancelReady": "Cancel Ready",
  "general.imReady": "I'm Ready",
  "general.noMessages": "No messages yet",
  "general.noHouses": "None",
  "general.hotel": "Hotel",
  "general.housesBuilt": "Houses Built",
  "general.owner": "Owner",
  "general.rentDue": "Rent due",
  "general.waitingForPlayer": "Waiting for other player's turn...",
  "general.players": "Players",
  "general.oneStation": "1 station",
  "general.stations": "stations",
  "general.noEvents": "No events yet",
  "general.connecting": "Connecting...",
  "app.boardTitle": "Eihtikar",
  "app.boardSubtitle": "Arabic Board Game",

  // Currency and formatting
  "format.currency": "₩",
  "format.seconds": "seconds",
  "format.players": "Players",
  "format.2players": "2 Players",
  "format.3players": "3 Players",
  "format.4players": "4 Players",
  "format.5players": "5 Players",
  "format.6players": "6 Players",

  // Game event patterns
  "event.rolled": "rolled",
  "event.movedTo": "moved to",
  "event.bought": "bought",
  "event.paid": "paid",
  "event.collected": "collected",
  "event.sentToJail": "was sent to jail",
  "event.passedStart": "passed Start and collected",
  "event.drewCard": "drew a card",
  "event.goBankrupt": "went bankrupt",
  "event.payRent": "rent to",
  "event.for": "for",

  // Trade
  "trade.title": "Propose Trade",
  "trade.description": "Select a player and items to trade",
  "trade.proposeButton": "Trade",
  "trade.selectPlayer": "Select Player",
  "trade.selectPlayerPlaceholder": "Choose a player...",
  "trade.youOffer": "You Offer",
  "trade.youRequest": "You Request",
  "trade.moneyOffer": "Money to offer",
  "trade.moneyRequest": "Money to request",
  "trade.noProperties": "No properties",
  "trade.propose": "Send Offer",
  "trade.activeTitle": "Active Trade",
  "trade.offering": "Offering",
  "trade.requesting": "Requesting",
  "trade.accept": "Accept",
  "trade.reject": "Reject",
  "trade.cancel": "Cancel Trade",
  "trade.counterOffer": "Counter Offer",
  "trade.counterDescription": "Propose your own terms to",
  "trade.counterOfferLabel": "Counter Offer",
  "trade.sendCounter": "Send Counter Offer",
  "trade.jailFreeCards": "Jail Free Cards",
  "trade.jailFreeCard": "Get Out of Jail Free",
  "trade.jailCardsOffer": "Cards to offer",
  "trade.jailCardsRequest": "Cards to request",

  // Mortgage
  "mortgage.title": "Property Management",
  "mortgage.mortgage": "Mortgage",
  "mortgage.unmortgage": "Unmortgage",
  "mortgage.mortgaged": "Mortgaged",
  "mortgage.value": "Mortgage Value",
  "mortgage.unmortgageCost": "Unmortgage Cost",
  "mortgage.noProperties": "You don't own any properties",
  "mortgage.bankruptcyWarning": "Bankruptcy Warning",
  "mortgage.mustMortgage": "You must mortgage properties or declare bankruptcy!",
  "mortgage.amountOwed": "Amount Owed",
  "mortgage.declareBankruptcy": "Declare Bankruptcy",
  "mortgage.mortgageToSurvive": "Mortgage properties to get enough money",

  // Building
  "build.title": "Build Houses",
  "build.buildHouse": "Build House",
  "build.sellHouse": "Sell House",
  "build.houses": "houses",
  "build.hotel": "Hotel",
  "build.houseCost": "House Cost",
  "build.sellValue": "Sell Value",
  "build.noCompleteSets": "No complete color sets available for building",
  "build.mustOwnAll": "You must own all properties in a color group to build",
  "build.evenBuilding": "Build evenly across all properties in the group",
  "build.maxBuilt": "Maximum buildings reached",
  "general.yourMoney": "Your Money",

  // Property Colors (use lowercase to match gameData.ts color values)
  "color.brown": "Brown",
  "color.lightblue": "Light Blue",
  "color.pink": "Pink",
  "color.orange": "Orange",
  "color.red": "Red",
  "color.yellow": "Yellow",
  "color.green": "Green",
  "color.blue": "Blue",
};

const arabicTranslations: Translations = {
  // App title
  "app.title": "احتكار",
  "app.subtitle": "لعبة الطاولة العربية متعددة اللاعبين",
  "app.footer":
    "احتكار الإصدار التجريبي الأول - لعبة طاولة عربية متعددة اللاعبين",

  // Home page
  "home.playerName": "اسم اللاعب",
  "home.playerNamePlaceholder": "أدخل اسمك",
  "home.joinTab": "انضمام لغرفة",
  "home.createTab": "إنشاء غرفة",
  "home.roomCode": "رمز الغرفة",
  "home.roomCodePlaceholder": "أدخل رمز الغرفة المكون من 6 أحرف",
  "home.roomName": "اسم الغرفة (اختياري)",
  "home.roomNamePlaceholder": "اسم غرفتك",
  "home.joinButton": "انضمام للغرفة",
  "home.createButton": "إنشاء غرفة جديدة",
  "home.upTo6Players": "حتى 6 لاعبين",
  "home.instantPlay": "لعب فوري",
  "home.liveChat": "محادثة مباشرة",

  // Lobby
  "lobby.title": "صالة الانتظار",
  "lobby.roomCode": "رمز الغرفة",
  "lobby.copyCode": "نسخ الرمز",
  "lobby.players": "اللاعبون",
  "lobby.ready": "جاهز",
  "lobby.notReady": "غير جاهز",
  "lobby.owner": "المالك",
  "lobby.you": "أنت",
  "lobby.kick": "طرد",
  "lobby.settings": "إعدادات الغرفة",
  "lobby.initialMoney": "المال الابتدائي",
  "lobby.diceCount": "عدد النرد",
  "lobby.dice1": "نرد واحد",
  "lobby.dice2": "نردان",
  "lobby.turnTime": "وقت الدور (ثانية)",
  "lobby.maxPlayers": "أقصى عدد لاعبين",
  "lobby.enableTax": "تفعيل الضرائب",
  "lobby.enableJail": "تفعيل السجن",
  "lobby.toggleReady": "تبديل الجاهزية",
  "lobby.startGame": "بدء اللعبة",
  "lobby.leaveRoom": "مغادرة الغرفة",
  "lobby.waitingForPlayers": "بانتظار اللاعبين...",
  "lobby.minPlayersRequired": "تحتاج لاعبين على الأقل",
  "lobby.allPlayersReady": "بانتظار أن يكون جميع اللاعبين جاهزين",

  // Game
  "game.yourTurn": "دورك",
  "game.turnOf": " دور",
  "game.rollDice": "رمي النرد",
  "game.buyProperty": "شراء العقار",
  "game.payRent": "دفع الإيجار",
  "game.endTurn": "إنهاء الدور",
  "game.useJailCard": "استخدام بطاقة الخروج",
  "game.payJailFine": "دفع الغرامة (₩50)",
  "game.inJail": "في السجن",
  "game.money": "المال",
  "game.properties": "العقارات",
  "game.position": "الموقع",
  "game.jailFreeCards": "بطاقات الخروج من السجن",
  "game.bankrupt": "مفلس",
  "game.winner": "الفائز!",
  "game.gameOver": "انتهت اللعبة",
  "game.congratulations": "تهانينا!",
  "game.won": "فاز باللعبة!",
  "game.backToLobby": "العودة للصالة",
  "game.chat": "المحادثة",
  "game.chatPlaceholder": "اكتب رسالة...",
  "game.send": "إرسال",
  "game.events": "الأحداث",
  "game.leaderboard": "لوحة المتصدرين",
  "game.rank": "المرتبة",
  "game.player": "اللاعب",
  "game.netWorth": "صافي الثروة",

  // Property card
  "property.price": "السعر",
  "property.rent": "الإيجار",
  "property.baseRent": "الإيجار الأساسي",
  "property.with1House": "مع منزل واحد",
  "property.with2Houses": "مع منزلين",
  "property.with3Houses": "مع 3 منازل",
  "property.with4Houses": "مع 4 منازل",
  "property.withHotel": "مع فندق",
  "property.houseCost": "تكلفة المنزل",
  "property.mortgaged": "مرهون",
  "property.owned": "مملوك",
  "property.unowned": "غير مملوك",

  // Tile types
  "tile.start": "البداية",
  "tile.jail": "السجن",
  "tile.freeParking": "موقف مجاني",
  "tile.goToJail": "اذهب للسجن",
  "tile.chance": "فرصة",
  "tile.community": "صندوق المجتمع",
  "tile.tax": "ضريبة",
  "tile.station": "محطة",
  "tile.utility": "خدمات",

  // Cards
  "card.chance": "بطاقة فرصة",
  "card.community": "بطاقة صندوق المجتمع",
  "card.dismiss": "حسناً",

  // General
  "general.loading": "جاري التحميل...",
  "general.error": "خطأ",
  "general.close": "إغلاق",
  "general.cancel": "إلغاء",
  "general.confirm": "تأكيد",
  "general.yes": "نعم",
  "general.no": "لا",
  "general.active": "نشط",
  "general.connected": "متصل",
  "general.disconnected": "غير متصل",
  "general.copied": "تم النسخ!",
  "general.edit": "تعديل",
  "general.save": "حفظ",
  "general.saveSettings": "حفظ الإعدادات",
  "general.cancelReady": "إلغاء الاستعداد",
  "general.imReady": "أنا جاهز",
  "general.noMessages": "لا توجد رسائل بعد",
  "general.noHouses": "لا يوجد",
  "general.hotel": "فندق",
  "general.housesBuilt": "المنازل المبنية",
  "general.owner": "المالك",
  "general.rentDue": "يجب دفع إيجار",
  "general.waitingForPlayer": "في انتظار دور اللاعب الآخر...",
  "general.players": "اللاعبون",
  "general.oneStation": "محطة واحدة",
  "general.stations": "محطات",
  "general.noEvents": "لا توجد أحداث بعد",
  "general.connecting": "جاري الاتصال...",
  "app.boardTitle": "احتكار",
  "app.boardSubtitle": "لعبة الطاولة العربية",

  // Currency and formatting
  "format.currency": "₩",
  "format.seconds": "ثانية",
  "format.players": "لاعبين",
  "format.2players": "2 لاعبين",
  "format.3players": "3 لاعبين",
  "format.4players": "4 لاعبين",
  "format.5players": "5 لاعبين",
  "format.6players": "6 لاعبين",

  // Game event patterns
  "event.rolled": "رمى",
  "event.movedTo": "انتقل إلى",
  "event.bought": "اشترى",
  "event.paid": "دفع",
  "event.collected": "حصل على",
  "event.sentToJail": "أُرسل إلى السجن",
  "event.passedStart": "مر على البداية وحصل على",
  "event.drewCard": "سحب بطاقة",
  "event.goBankrupt": "أفلس",
  "event.payRent": "إيجار إلى",
  "event.for": "مقابل",

  // Trade
  "trade.title": "اقتراح صفقة",
  "trade.description": "اختر لاعباً وعناصر للتبادل",
  "trade.proposeButton": "تبادل",
  "trade.selectPlayer": "اختر لاعباً",
  "trade.selectPlayerPlaceholder": "اختر لاعباً...",
  "trade.youOffer": "تعرض",
  "trade.youRequest": "تطلب",
  "trade.moneyOffer": "مبلغ تعرضه",
  "trade.moneyRequest": "مبلغ تطلبه",
  "trade.noProperties": "لا توجد عقارات",
  "trade.propose": "إرسال العرض",
  "trade.activeTitle": "صفقة نشطة",
  "trade.offering": "يعرض",
  "trade.requesting": "يطلب",
  "trade.accept": "قبول",
  "trade.reject": "رفض",
  "trade.cancel": "إلغاء الصفقة",
  "trade.counterOffer": "عرض مضاد",
  "trade.counterDescription": "اقترح شروطك الخاصة إلى",
  "trade.counterOfferLabel": "عرض مضاد",
  "trade.sendCounter": "إرسال العرض المضاد",
  "trade.jailFreeCards": "بطاقات الخروج من السجن",
  "trade.jailFreeCard": "بطاقة الخروج من السجن",
  "trade.jailCardsOffer": "بطاقات تعرضها",
  "trade.jailCardsRequest": "بطاقات تطلبها",

  // Mortgage
  "mortgage.title": "إدارة العقارات",
  "mortgage.mortgage": "رهن",
  "mortgage.unmortgage": "فك الرهن",
  "mortgage.mortgaged": "مرهون",
  "mortgage.value": "قيمة الرهن",
  "mortgage.unmortgageCost": "تكلفة فك الرهن",
  "mortgage.noProperties": "لا تملك أي عقارات",
  "mortgage.bankruptcyWarning": "تحذير الإفلاس",
  "mortgage.mustMortgage": "يجب عليك رهن عقاراتك أو إعلان الإفلاس!",
  "mortgage.amountOwed": "المبلغ المستحق",
  "mortgage.declareBankruptcy": "إعلان الإفلاس",
  "mortgage.mortgageToSurvive": "ارهن عقاراتك للحصول على مال كافي",

  // Building
  "build.title": "بناء المنازل",
  "build.buildHouse": "بناء منزل",
  "build.sellHouse": "بيع منزل",
  "build.houses": "منازل",
  "build.hotel": "فندق",
  "build.houseCost": "تكلفة المنزل",
  "build.sellValue": "قيمة البيع",
  "build.noCompleteSets": "لا توجد مجموعات لونية مكتملة للبناء",
  "build.mustOwnAll": "يجب امتلاك جميع عقارات المجموعة اللونية للبناء",
  "build.evenBuilding": "البناء بالتساوي على جميع عقارات المجموعة",
  "build.maxBuilt": "تم الوصول للحد الأقصى من البناء",
  "general.yourMoney": "مالك",

  // Property Colors (use lowercase to match gameData.ts color values)
  "color.brown": "بني",
  "color.lightblue": "أزرق فاتح",
  "color.pink": "وردي",
  "color.orange": "برتقالي",
  "color.red": "أحمر",
  "color.yellow": "أصفر",
  "color.green": "أخضر",
  "color.blue": "أزرق",
};

// Card text translations - 16 official cards each
export const cardTranslations: Record<
  Language,
  Record<number, { chance: string; community: string }>
> = {
  en: {
    1: {
      chance: "Advance to Boardwalk",
      community: "Advance to Go (Collect ₩200)",
    },
    2: {
      chance: "Advance to Go (Collect ₩200)",
      community: "Bank error in your favor. Collect ₩200",
    },
    3: {
      chance: "Advance to Illinois Avenue. If you pass Go, collect ₩200",
      community: "Doctor's fee. Pay ₩50",
    },
    4: {
      chance: "Advance to St. Charles Place. If you pass Go, collect ₩200",
      community: "From sale of stock you get ₩50",
    },
    5: {
      chance:
        "Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay twice the rental to which they are otherwise entitled",
      community: "Get Out of Jail Free",
    },
    6: {
      chance:
        "Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay twice the rental to which they are otherwise entitled",
      community:
        "Go to Jail. Go directly to jail, do not pass Go, do not collect ₩200",
    },
    7: {
      chance:
        "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times amount thrown",
      community: "Holiday fund matures. Receive ₩100",
    },
    8: {
      chance: "Bank pays you dividend of ₩50",
      community: "Income tax refund. Collect ₩20",
    },
    9: {
      chance: "Get Out of Jail Free",
      community: "It is your birthday. Collect ₩10 from every player",
    },
    10: {
      chance: "Go Back 3 Spaces",
      community: "Life insurance matures. Collect ₩100",
    },
    11: {
      chance:
        "Go to Jail. Go directly to Jail, do not pass Go, do not collect ₩200",
      community: "Pay hospital fees of ₩100",
    },
    12: {
      chance:
        "Make general repairs on all your property. For each house pay ₩25. For each hotel pay ₩100",
      community: "Pay school fees of ₩50",
    },
    13: {
      chance: "Speeding fine ₩15",
      community: "Receive ₩25 consultancy fee",
    },
    14: {
      chance: "Take a trip to Reading Railroad. If you pass Go, collect ₩200",
      community:
        "You are assessed for street repair. ₩40 per house. ₩115 per hotel",
    },
    15: {
      chance:
        "You have been elected Chairman of the Board. Pay each player ₩50",
      community: "You have won second prize in a beauty contest. Collect ₩10",
    },
    16: {
      chance: "Your building loan matures. Collect ₩150",
      community: "You inherit ₩100",
    },
  },
  ar: {
    1: {
      chance: "تقدم إلى مكة المكرمة",
      community: "تقدم إلى البداية (احصل على ₩200)",
    },
    2: {
      chance: "تقدم إلى البداية (احصل على ₩200)",
      community: "خطأ في البنك لصالحك. احصل على ₩200",
    },
    3: {
      chance: "تقدم إلى بغداد. إذا مررت بالبداية احصل على ₩200",
      community: "أتعاب الطبيب. ادفع ₩50",
    },
    4: {
      chance: "تقدم إلى بيروت. إذا مررت بالبداية احصل على ₩200",
      community: "من بيع الأسهم تحصل على ₩50",
    },
    5: {
      chance:
        "تقدم إلى أقرب محطة قطار. إذا كانت غير مملوكة يمكنك شراؤها. إذا كانت مملوكة ادفع ضعف الإيجار",
      community: "بطاقة خروج من السجن مجاناً",
    },
    6: {
      chance:
        "تقدم إلى أقرب محطة قطار. إذا كانت غير مملوكة يمكنك شراؤها. إذا كانت مملوكة ادفع ضعف الإيجار",
      community: "اذهب للسجن مباشرة. لا تمر بالبداية ولا تحصل على ₩200",
    },
    7: {
      chance:
        "تقدم إلى أقرب شركة خدمات. إذا كانت غير مملوكة يمكنك شراؤها. إذا كانت مملوكة ارمِ النرد وادفع 10 أضعاف الرقم",
      community: "استحق صندوق العطلات. احصل على ₩100",
    },
    8: {
      chance: "البنك يدفع لك أرباح ₩50",
      community: "استرداد ضريبة الدخل. احصل على ₩20",
    },
    9: {
      chance: "بطاقة خروج من السجن مجاناً",
      community: "عيد ميلادك! احصل على ₩10 من كل لاعب",
    },
    10: {
      chance: "ارجع 3 خطوات للخلف",
      community: "استحق تأمين الحياة. احصل على ₩100",
    },
    11: {
      chance: "اذهب للسجن مباشرة. لا تمر بالبداية ولا تحصل على ₩200",
      community: "ادفع رسوم المستشفى ₩100",
    },
    12: {
      chance: "قم بإصلاحات عامة لعقاراتك. ادفع ₩25 عن كل منزل و₩100 عن كل فندق",
      community: "ادفع رسوم المدرسة ₩50",
    },
    13: { chance: "غرامة سرعة ₩15", community: "احصل على رسوم استشارة ₩25" },
    14: {
      chance: "قم برحلة إلى محطة قطار مصر. إذا مررت بالبداية احصل على ₩200",
      community: "تم تقييمك لإصلاح الشوارع. ₩40 عن كل منزل و₩115 عن كل فندق",
    },
    15: {
      chance: "تم انتخابك رئيساً لمجلس الإدارة. ادفع ₩50 لكل لاعب",
      community: "فزت بالمركز الثاني في مسابقة الجمال. احصل على ₩10",
    },
    16: {
      chance: "استحق قرض البناء الخاص بك. احصل على ₩150",
      community: "ورثت ₩100",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  translateEvent: (description: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translations =
      language === "ar" ? arabicTranslations : englishTranslations;
    return translations[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    return `₩${amount}`;
  };

  const translateEvent = (description: string): string => {
    if (language === "en") return description;

    let translated = description
      .replace(/\$(\d+)/g, "₩$1")
      .replace(/rolled/g, t("event.rolled"))
      .replace(/moved to/g, t("event.movedTo"))
      .replace(/bought/g, t("event.bought"))
      .replace(/paid/g, t("event.paid"))
      .replace(/collected/g, t("event.collected"))
      .replace(/was sent to jail/g, t("event.sentToJail"))
      .replace(/passed Start and collected/g, t("event.passedStart"))
      .replace(/drew a card/g, t("event.drewCard"))
      .replace(/went bankrupt/g, t("event.goBankrupt"))
      .replace(/rent to/g, t("event.payRent"))
      .replace(/ for /g, ` ${t("event.for")} `);

    return translated;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        translateEvent,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
