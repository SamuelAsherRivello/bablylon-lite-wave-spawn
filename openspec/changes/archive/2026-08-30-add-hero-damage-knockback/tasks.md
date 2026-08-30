## 1. Knockback Rules and Test Coverage

- [x] 1.1 Add failing unit tests for the shared 0.25-world-unit distance, 0.16-second duration, normalized ease-out profile, source-to-target normalization, projectile-direction use, side-opposing zero-distance fallback, and finite results; verify the focused knockback tests fail for the missing behavior before production edits.
- [x] 1.2 Implement centralized knockback tuning and pure direction/velocity helpers in the combat rules; verify the focused knockback tests pass for opposing contact directions and identical class-independent displacement.

## 2. Movement Arbitration

- [x] 2.1 Add failing gameplay tests for timed knockback priority, timer expiry, remembered-target preservation, replacement by a later valid hit, and state clearing on removal; verify they fail against pursuit-only movement.
- [x] 2.2 Add per-unit knockback state and make the battle movement update consume it before target pursuit, using the same battle delta and planar velocity path; verify focused tests show pursuit resumes on the first update after expiry without stale velocity.
- [x] 2.3 Preserve the `TAKE_DAMAGE` artwork override while knockback velocity is active and keep fatal `DEAD` behavior terminal; verify animation/controller tests cover a living hit returning to its repeating state and a removed unit never resuming knockback.

## 3. Damage-Source Integration

- [x] 3.1 Update contact-damage tests to require position snapshots and opposite knockback directions for both surviving heroes, then integrate contact damage so each survivor receives its own away-from-impact reaction; verify simultaneous contact uses finite opposing vectors, normal collision remains active, and existing cooldown/health assertions still pass.
- [x] 3.2 Update projectile tests to require the incoming final ground-path direction with attacker-to-target and side-opposing fallbacks, then pass that direction through the hit callback; verify surviving targets are knocked along the visible projectile approach and projectile resources still dispose normally.
- [x] 3.3 Add boundary-focused tests for outward and diagonal knockback, then verify the existing arena constraint clips blocked components, retains allowed components, keeps Z fixed, prevents rotation, and updates Y-based depth ordering.

## 4. Integrated Verification

- [x] 4.1 Run the focused knockback, battle-rules, projectile, animation, and arena tests separately, then run `npm.cmd test`; verify all existing and new tests pass without changing damage amounts, cooldowns, targeting priority, or hero stats.
- [x] 4.2 Run `npm.cmd run build`; verify the production build completes with no new dependency or browser-bundle error.
- [x] 4.3 In one live browser session, verify melee and projectile knockback for Rook, Pawn, and Bishop at a large desktop viewport, a narrow portrait viewport, and a tall mobile viewport where width limits the frame; confirm direction is visually clear, ease-out displacement is comparable to one walking cycle, pursuit resumes, normal collisions remain active, and fatal hits remain terminal.
- [x] 4.4 During the same browser session, resize while knockback is active and test hits beside each arena wall; verify the frame stays centered and exactly 9:16, the canvas resizes without reload or console error, composition does not reflow or overlap, and heroes remain inside playable bounds with fixed depth.
