## 1. Effect foundation

- [x] 1.1 Add the cloud PNG asset at the agreed art path and verify it is a small transparent image suitable for alpha blending
- [x] 1.2 Add particle configuration and pure fade/variation helpers, then verify bounded sizes, positions, lifetimes, and opacity values with focused tests
- [x] 1.3 Implement the hero-owned cloud effect controller using Babylon core planes, shared texture/material ownership, one render observer, and explicit cleanup; verify the controller test leaves no active particles after completion and disposal

## 2. Hero and combat integration

- [x] 2.1 Attach the effect controller to each hero without changing root, collider, shadow, or artwork animation transforms; verify existing hero animation and physics tests still pass
- [x] 2.2 Trigger a bounded cloud burst from the non-lethal damage path and verify lethal damage does not leave a particle observer or active effect during delayed death disposal
- [x] 2.3 Verify repeated collision damage is capped or safely coalesced and does not create unbounded particles

## 3. Verification

- [x] 3.1 Run the production build and focused test suite, verifying both complete successfully
- [x] 3.2 Run the Vite app in a real browser and verify visible cloud fade-in/fade-out on hero damage, correct layering, and no console errors
- [x] 3.3 Verify the effect in a portrait mobile-sized viewport and after resize, confirming the centered 9:16 frame, touch behavior, and hero-relative placement remain intact
