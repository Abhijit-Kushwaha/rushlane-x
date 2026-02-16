

## Add Mobile Controls Toggle Setting

A simple setting that lets users show or hide the on-screen mobile control buttons. By default, mobile controls will be visible on mobile devices, but users can toggle them off if they prefer touch-swipe-only controls.

### Changes

1. **`src/game/GameCanvas.tsx`**
   - Add a `showMobileControls` state (default: `true`)
   - Add a small settings/gear icon button near the canvas that opens a controls toggle
   - Conditionally render the mobile control buttons (left/right/brake/ability) based on `showMobileControls`
   - Use a Switch component or simple toggle button to let the user enable/disable mobile controls
   - Persist the preference in `localStorage` so it remembers across sessions

2. **UI Layout**
   - Place a small gear/settings icon in the top-right area above the canvas
   - When tapped, show a compact popover or inline toggle with a Switch labeled "Mobile Controls"
   - The toggle controls visibility of the bottom control buttons

### Technical Details
- Use the existing `Switch` component from `src/components/ui/switch.tsx`
- Store preference in `localStorage` under key `rushlane-mobile-controls`
- Read from `localStorage` on mount to initialize the state
- The `md:hidden` class on the controls div will be combined with the toggle state

