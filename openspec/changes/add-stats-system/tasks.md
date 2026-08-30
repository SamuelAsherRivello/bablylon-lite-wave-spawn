## 1. Canonical stats and runtime model

- [x] 1.1 Replace the scattered hero stat values with one immutable profile lookup containing Rook 120/20/20, Pawn 40/30/10, and Bishop 80/20/30; verify exact values and role ordering with unit tests.
- [x] 1.2 Update hero construction so each unit receives profile health, speed, and damage while current health remains mutable per unit; verify canonical profiles are unchanged after collision damage.

## 2. Cards and battle integration

- [x] 2.1 Update hero-selection cards to render role plus labeled HP, SPD, and DMG from the canonical lookup; verify the card text matches runtime values and remains selectable by mouse, keyboard, and touch.
- [x] 2.2 Confirm movement and collision use the runtime profile values, preserve the existing movement scale and removal behavior, and add tests for Pawn's speed advantage and Bishop's damage advantage.

## 3. Verification and polish

- [x] 3.1 Adjust plain CSS card typography/layout for the expanded stat labels and verify the three cards remain legible in desktop and portrait mobile 9:16 viewports.
- [x] 3.2 Run the complete unit test suite and production build; verify both commands pass.
- [ ] 3.3 Start the Vite app and perform a real-browser smoke test covering all three selection cards, three selections, formation spawning, and the start of movement; verify no console/runtime errors.
