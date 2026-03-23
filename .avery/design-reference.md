# BeatForge 808 - UI Design Reference

## Visual Identity
- **Theme**: Vintage drum machine / retro studio equipment
- **Primary Palette**: Warm browns, tan, cream, and orange
- **Always dark mode** - no light mode toggle needed

## Color System
- Background: `#1A1410` (deep warm black)
- Card/Panel: `#2C1E14` (dark brown)
- Secondary: `#3D2B1F` (medium brown)
- Border: `#4A3728` (warm border)
- Primary Text: `#F5E6D3` (vintage cream)
- Secondary Text: `#D4A574` (warm tan)
- Muted Text: `#A08060` (dusty brown)
- Accent: `#E8732A` (vibrant orange - LEDs, active states, CTAs)
- Success: `#27AE60` (green - power LED, play button)
- Danger: `#C0392B` (red - stop button, destructive)
- Genre Colors: Rock=#C0392B, Hip-Hop=#8E44AD, Jazz=#2980B9, Electronic=#27AE60, Latin=#F39C12

## Typography
- **Display/Labels**: `font-mono` (Courier New), uppercase, tracking-wider
- **Body**: Default sans-serif (Geist)
- **Labels**: `.vintage-label` class - 0.65rem, uppercase, letter-spacing 0.15em, color #A08060

## Component Patterns
- **Panels**: `.vintage-panel` - gradient background, 2px border, inset shadow
- **Buttons**: `.vintage-button` - gradient background, 1px border, drop shadow, active press effect
- **Display**: `.vintage-display` - black (#0A0A0A) background, 2px border, monospace orange text
- **LEDs**: `.vintage-led` class - 8px circles, glow effect when `.active`
- **Pads**: Square aspect ratio, rounded-sm, orange (#E8732A) when active with glow

## Spacing & Layout
- Max width: 5xl (1024px) for main content
- Panel padding: p-4 md:p-6
- Gap between sections: space-y-5
- Border radius: rounded-xl for panels, rounded-lg for buttons, rounded-sm for pads

## Interactive States
- Active pads: Orange with glow shadow
- Current step indicator: cream/tan glow
- Playing LED: Orange glow animation
- Hover: Lighter shade of current element
- Genre buttons: Colored background when selected with matching glow
