# Eihtikar - Arabic Multiplayer Board Game Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Gaming Focus
Drawing inspiration from successful digital board game implementations (Chess.com's clean multiplayer interface, digital Monopoly's spatial organization) while adapting for Arabic RTL layout and cultural context.

**Core Principles:**
- Immediate clarity of game state
- Spatial organization that honors board game tradition
- RTL-first design for Arabic content
- Clear hierarchy between game board and supporting interfaces

---

## RTL Design Requirements

All layouts flow right-to-left:
- Navigation elements positioned on right side
- Player info panels stack from right to left
- Chat interface anchors to right side
- Dice roll and game controls on right
- Board rotation: Start position at bottom-right corner, moving counter-clockwise

---

## Typography System

**Arabic Font Stack:**
- Primary: Cairo (Google Fonts) - Clean, modern, excellent for UI
- Secondary: Tajawal for smaller text and labels
- All weights: Regular (400), Medium (500), Bold (700)

**Hierarchy:**
- Page titles: text-4xl font-bold (room names, game titles)
- Section headers: text-2xl font-bold (player names, section titles)
- Primary labels: text-lg font-medium (property names, amounts)
- Body text: text-base (chat messages, descriptions)
- Small labels: text-sm (tile details, timestamps)
- Micro text: text-xs (card text, fine print)

---

## Layout System

**Spacing Primitives:** Consistently use Tailwind units of 2, 4, 6, 8, and 12
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (between related elements)
- Section spacing: p-6, gap-6 (component groups)
- Large spacing: p-8, gap-8 (major sections)
- Extra spacing: p-12 (screen padding)

**Game Board Layout:**
- Center-dominant: Board occupies 60-70% of viewport width on desktop
- Fixed aspect ratio container maintaining square board proportion
- Responsive: Full width on mobile with scrollable side panels
- Sidebar width: 300px on desktop (right side for Arabic)

---

## Component Library

### Game Board Components

**Board Container:**
- Square aspect ratio (use aspect-square utility)
- Grid layout: 11x11 cells (corners + sides)
- Border thickness: 8px around board perimeter
- Tile dimensions: Equal width/height calculated from container

**Property Tiles:**
- Vertical layout for side tiles, horizontal for top/bottom
- Header strip showing property color/category (h-8)
- Property name: text-sm font-bold, 2-line max with text-center
- Price display: text-xs beneath name
- Ownership indicator: Small badge in corner (8px circle)
- Padding: p-2 internal spacing

**Special Tiles (Jail, Free Parking, Start, etc.):**
- Larger than standard tiles (corner tiles 1.5x size)
- Icon-centered with text-xs label beneath
- Distinct visual treatment with icon size h-12

**Player Tokens:**
- Circular or square badges (w-8 h-8)
- Stack multiple tokens on same tile with slight offset
- Position at bottom of tile with absolute positioning

### Interface Panels

**Right Sidebar (Primary):**
- Fixed width: w-[300px] on desktop, full-width drawer on mobile
- Sections stacked vertically with gap-6
- Rounded corners: rounded-lg for each section card
- Padding: p-6 per section

**Player Status Cards:**
- Height: h-24 per player
- Display: Player avatar (w-16 h-16 rounded-full), name, money, property count
- Current turn indicator: Border treatment (border-4) or glow effect
- Spacing: gap-4 between players

**Game Controls Panel:**
- Fixed to bottom-right on desktop, bottom full-width on mobile
- Height: h-32
- Contains: Dice display, roll button, trade button, end turn button
- Button sizes: Large primary buttons (h-12 px-8)

**Dice Display:**
- Square containers: w-16 h-16 per die
- Grid of dots representing dice face
- Animation space reserved for roll animation

### Room Management Interface

**Room Lobby Screen:**
- Centered container: max-w-4xl mx-auto
- Room code prominently displayed: text-3xl font-bold with copy button
- Player list: Grid of player cards (grid-cols-2 md:grid-cols-3 gap-4)
- Each player card: h-32 with avatar, name, ready status
- Host controls at bottom: h-20 action bar

**Settings Panel:**
- Modal overlay or slide-in drawer (w-full md:w-[600px])
- Form layout with gap-6 between setting groups
- Toggle switches: h-6 for boolean options
- Number inputs: h-12 for money amounts
- Labeled sections with text-lg font-bold headers

### Card System (Chance/Community Chest)

**Card Display:**
- Modal overlay centered: max-w-md
- Card dimensions: w-full h-[400px] aspect-[3/4]
- Card header: h-16 with category name
- Card body: p-8 for message text (text-xl centered)
- Action buttons: h-12 at bottom

### Chat Interface

**Chat Panel:**
- Height: h-[400px] on desktop, h-[300px] on mobile
- Message list: Scrollable with gap-2 between messages
- Each message: p-3 rounded-lg
- Message structure: 
  - Sender name: text-sm font-bold
  - Message text: text-base
  - Timestamp: text-xs opacity-70
- Input field: h-12 with send button (w-12 h-12)

### Property Cards & Trading

**Property Detail Modal:**
- Width: w-full md:w-[500px]
- Property header: h-24 with property name, color strip, image
- Details section: grid-cols-2 for stats (rent levels, cost)
- Action buttons: Full-width h-12 buttons with gap-3

**Trade Interface:**
- Two-column layout: grid-cols-2 representing two players
- Each column: Property checklist with thumbnails (h-16 per item)
- Money exchange inputs: h-12 centered between columns
- Confirmation area: h-20 at bottom

### Game Log

**Event Feed:**
- Right sidebar section or separate tab
- List items: h-12 per event with gap-1
- Event types with icons: Purchase (w-5 h-5 icon), Rent, Jail, Card
- Text: text-sm with timestamp text-xs
- Max height: h-[500px] with scroll

---

## Responsive Breakpoints

**Desktop (lg: 1024px+):**
- Side-by-side layout: Board center, sidebar right
- All panels visible simultaneously
- Chat docked in sidebar

**Tablet (md: 768px):**
- Board scales to 80% width
- Sidebar becomes slide-out drawer
- Controls remain fixed at bottom

**Mobile (base):**
- Board full-width with vertical scroll
- Bottom sheet for player info (swipe up)
- Floating action button for dice roll (w-16 h-16 bottom-right)
- Hamburger menu for settings/chat

---

## Spatial Organization

**Game Screen Layout (Desktop):**
```
┌─────────────────────────────────────┐
│  Header: Room Name, Exit (h-16)    │
├────────────┬────────────────────────┤
│            │                        │
│   Board    │  Right Sidebar:        │
│  (Square   │  - Player Status       │
│   60-70%   │  - Game Log            │
│   width)   │  - Chat                │
│            │  (w-[300px])           │
│            │                        │
├────────────┴────────────────────────┤
│  Bottom Controls (h-32)             │
└─────────────────────────────────────┘
```

---

## Animation Guidelines

Use sparingly - only for:
- Dice roll animation (2-3 second duration)
- Player token movement along board path (smooth transition)
- Card reveal flip animation
- Turn transition indicator (subtle pulse)
- NO hover animations on tiles or properties
- NO scroll-triggered effects

---

## Images

**No large hero image** - This is a game application, not a marketing site.

**Required imagery:**
- Property tile images: Small illustrative icons (32x32px) per property type
- Player avatars: Circular (64x64px) user-selected or default
- Card backgrounds: Decorative patterns for Chance/Community cards
- Special tile icons: Jail bars, parking meter, question mark (48x48px)
- Token designs: 6-8 unique player token graphics (simple icons)

All images should be crisp, icon-style graphics rather than photographic.

---

## Component Treatment

All components use consistent pattern:
- Rounded corners: rounded-lg (standard), rounded-xl (emphasis)
- Borders: border-2 for definition where needed
- Shadows: shadow-md for elevation (cards, modals)
- No gradients on functional elements
- Solid fills for clarity

Button states handled by component system - no custom hover specifications needed.