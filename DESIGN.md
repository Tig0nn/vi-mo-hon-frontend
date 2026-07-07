# Design System: Ví Mỏ Hỗn

## 1. Visual Theme & Atmosphere
A clean, Gen Z fintech aesthetic that feels like a highly curated behavior-change tool, not a generic financial dashboard. The atmosphere is sharp and slightly playful, but never childish. 
- **Variance: 7** (Offset asymmetric elements for visual interest).
- **Motion: 8** (Fluid, tactile interactions with spring physics).
- **Density: 6** (Focused, negative space-heavy, prioritizing quick actions).
It feels like a premium utility app that has gamification baked into its core DNA, avoiding the trap of looking like a cheap mobile game.

## 2. Color Palette & Roles
- **Canvas White** (`#F8FAFC`) — Primary background surface.
- **Pure Surface** (`#FFFFFF`) — Card and container fill.
- **Charcoal Ink** (`#0F172A`) — Primary text, headlines, and data values.
- **Muted Steel** (`#64748B`) — Secondary text, metadata, descriptions, and disabled states.
- **Whisper Border** (`rgba(226,232,240,0.8)`) — Structural lines, card borders, and list dividers.
- **Emerald Accent** (`#10B981`) — Single primary accent for positive gamification actions (XP gains, completed challenges). 
- **Caution Orange** (`#F97316`) — Secondary accent reserved strictly for warning states (high-spend alerts, boss damage).

*(Mandatory constraints: Max 1 core accent color for primary actions. No purple/neon glows. No pure black `#000000`. No AI-purple gradients.)*

## 3. Typography Direction
- **Display/Headlines:** `Outfit` (or `Cabinet Grotesk`) — Track-tight, controlled scale, weight-driven hierarchy. Used for total balances, boss HP, and major app titles.
- **Body:** `Geist` or `Satoshi` — Relaxed leading, 65ch max-width, strictly used for descriptions and challenges. **`Inter` is strictly BANNED.**
- **Numbers/Data:** Monospace variant (e.g., `Geist Mono`) must be used for XP, money amounts, and health stats.
- **Rule:** Hierarchy is created through extreme weight contrast (e.g., UltraBold vs Regular) and color (Charcoal vs Muted Steel), rather than just massive font size.

## 4. Spacing Scale & Layout Principles
- **Grid-First:** Asymmetric layouts. CSS Grid over Flexbox math. No percentage hacks.
- **Spacing:** Use generous internal padding. Sections are separated by structural borders or negative space, not heavy background color blocks.
- **No Overlapping:** Elements must sit in their own clean spatial zones.
- **Mobile Constraints:** All layouts collapse to a single column. No horizontal scrolling for core content.

## 5. Mobile Screen Hierarchy & Home Screen Rules
**Mobile Screen Hierarchy:**
1. Quick input (most accessible zone).
2. Gamified progress (Challenges/Boss).
3. Hard financial stats.

**Home Screen Layout Rules:**
- **Quick Expense Input:** Must be the most prominent, immediate interaction point (e.g., sticky top or bottom). Frictionless and not hidden behind a menu.
- **Current Challenge:** Displayed as a high-priority, asymmetric card highlighting immediate action.
- **Boss Progress:** Compact, non-intrusive skeletal progress bar or stat block. **Banned:** Huge mascot or boss illustrations dominating the screen.
- **Stats:** Kept secondary, below the gamification layer.

## 6. Component Rules
- **Buttons:** Flat, brutalist-lite. Tactile `-1px` translate on active (Spring physics). No outer glows. Primary buttons use Charcoal Ink or Emerald Accent fill.
- **Cards:** Generously rounded corners (`1.5rem`). No heavy drop shadows. Use diffused whisper shadows (`rgba(15, 23, 42, 0.03)`) or purely rely on 1px Whisper Borders for definition.
- **Inputs:** Quick expense input should feel frictionless—large tap target, clean border, label-above pattern. Focus ring in Charcoal Ink.
- **Progress Bars:** Skeletal and sharp. Flat color fills with stark borders. No pill-shaped, glossy, or heavily gradient bars.
- **Empty States:** Composed, typographic compositions guiding the user to action—not just "No data" text.

## 7. Motion & Interaction
- **Spring Physics:** `stiffness: 100, damping: 20` for all interactions (button presses, card expansions). No linear easing.
- **Gamified Feedback:** Haptic feedback on every expense entry. Staggered cascade delays for waterfall reveals of challenge lists.
- **Perpetual Micro-loops:** Subtle pulse on the primary "Add Expense" button or active challenge indicators.

## 8. Vietnamese UI Tone
- **Voice:** "Mỏ Hỗn" (Sassy, direct, slightly sarcastic but ultimately helpful). Gen Z slang is used for impact, not constantly.
- **Format:** Short, punchy sentences. No robotic translations (e.g., "Vui lòng nhập số tiền"). Use direct calls to action (e.g., "Nhập tiền đi", "Boss vả giờ").
- **Constraint:** Avoid AI copywriting clichés ("Nâng tầm", "Trải nghiệm liền mạch", "Kiến tạo"). Keep it raw and authentic.

## 9. Anti-Patterns (Banned)
- No emojis anywhere (use clean SVG icons or typography instead).
- No `Inter` font.
- No generic serif fonts.
- No pure black (`#000000`).
- No neon/outer glow shadows.
- No AI-purple gradients.
- No generic equal-sized 3-card layouts.
- No massive mascot illustrations dominating the screen.
- No AI copywriting clichés.
- No overlapping elements — clean spatial separation always.
