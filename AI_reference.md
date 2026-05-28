# AI Reference

Web Mario Game: AI-assisted development record

## 1. AI Tool(s) Used

- **ChatGPT / Codex**: Used to analyze assignment requirements, plan implementation order, write and modify Cocos Creator 2.4.8 scripts, debug runtime behavior, improve UI layout, tune audio, connect Firebase, guide build/deploy steps, and update documentation.

## 2. Scope of Usage / Code Location

| File / Location | AI Assistance | Current Usage |
|---|---|---|
| `assets/scripts/SceneChanger.ts` | Scene switching, BGM routing, login/register popup, level select buttons, history/leaderboard/setting popups, loading transition, UI SFX. | Used in start and level select scenes. |
| `assets/scripts/FirebaseService.ts` | Firebase SDK loading, Auth sign in/register/sign out, Firestore run records, history, leaderboard, best rank. | Used by login UI, HUD, history popup, and leaderboard popup. |
| `assets/scripts/GameAudio.ts` | Central SFX loading/playback, clip duration lookup, 0-100 volume conversion, SFX master volume. | Used by player, coins, enemies, question blocks, and UI. |
| `assets/scripts/GamePause.ts` | Shared pause state for gameplay systems. | Used during death, continue, and victory flow. |
| `assets/scripts/PlayerController.ts` | Mario movement, jump, long jump, climbing, damage, invincibility, death, continue respawn, victory trigger, animations, SFX. | Used by the Mario player node. |
| `assets/scripts/GameHUD.ts` | HUD, timer, score/life/coin updates, continue popup, game-over flow, level-clear flow, Firebase run saving. | Used in `MainGameScene`. |
| `assets/scripts/CameraFollow.ts` | X/Y follow, camera clamp, zoom, Y dead zone, viewport width handling, black side letterbox. | Used by `Main Camera` in gameplay. |
| `assets/scripts/ParallaxBackground.ts` | Gameplay background placement and camera-relative movement. | Used by `Main Camera` in gameplay. |
| `assets/scripts/TileMapCollisionBuilder.ts` | Runtime TMX tile collision generation and vine sensor generation. | Used by the TMX map node. |
| `assets/scripts/TileCollisionBounds.ts` | Pixel-based tile collision bounds and manual collision tuning. | Used by tile collider generation. |
| `assets/scripts/CoinSpawner.ts` | TMX coin generation, dynamic question-block coin generation, coin animation, collection effect, coin SFX. | Used by the TMX map node. |
| `assets/scripts/CoinCollectible.ts` | Coin-player contact handling. | Used by generated coin nodes. |
| `assets/scripts/QuestionBlockSpawner.ts` | Runtime question-block generation, used-state handling, reward coin placement. | Used by the TMX map node. |
| `assets/scripts/QuestionBlock.ts` | Hit-from-below detection and question-block trigger logic. | Used by generated question block nodes. |
| `assets/scripts/FlowerSpawner.ts` | Runtime pipe flower generation from TMX objects. | Used by the TMX map node. |
| `assets/scripts/FlowerEnemy.ts` | Flower detection, emerge/retract animation, mouth animation, cooldown, collision. | Used by generated flower nodes. |
| `assets/scripts/GoombaSpawner.ts` | Runtime Goomba generation, surface detection, platform bounds. | Used by the TMX map node. |
| `assets/scripts/GoombaEnemy.ts` | Goomba chase, lost-player return, stomp detection, score reward, stomp SFX, defeated animation. | Used by generated Goomba nodes. |
| `assets/scripts/GroundGenerator.ts` | Early generated-ground prototype using selected ground tiles. | Implemented during development, then removed after switching to TMX map workflow. |
| `assets/scripts/LevelIntro.ts` | Early reusable level-intro overlay. | Implemented during development, then replaced by the final `WORLD1` loading screen. |
| `assets/scripts/AnimatedTileBackground.ts` | Early animated water-style intro background. | Implemented during development, then removed with the old intro UI. |
| `assets/scripts/IntroTextGroupSwitcher.ts` | Early intro text switching helper. | Implemented during development, then removed with the old intro UI. |
| `assets/scenes/StartScene.fire` | Start UI, login button, login popup layout, button/font tuning. | Used as the first scene. |
| `assets/scenes/LevelSelectScene.fire` | Level select UI, back button placement, side menu buttons, popup colors/layout. | Used as the level selection scene. |
| `assets/scenes/MainGameScene.fire` | Gameplay hierarchy, HUD, camera, map, player, spawners, background. | Used as the first playable level. |
| `assets/resources/tiles/mario map.tmx` | Map inspection, layer/object-group usage, start/finish/coins/questions/flowers/goombas setup. | Used as the first playable map. |
| `assets/resources/player/mario_grouped_small.plist` | Grouped Mario animation frame mapping. | Used for idle, walk, jump, climb, defeat, and victory frames. |
| `assets/resources/audio/` | BGM and SFX routing and volume tuning. | Used for BGM, jump, coin, climb, stomp, kick, reserve, lose-one-life, game over, and level clear. |
| `assets/resources/pictures/` | Button assets, background images, UI styling. | Used by menu screens, popups, and background. |
| `README.md` | Feature/status documentation. | Updated to match the current implementation. |
| `AI_reference.md` | AI usage documentation. | Updated to include all AI-assisted work. |

## 3. Prompt / Response Evidence

### Record 1: Assignment analysis and development order

**Prompt (translated)**

> First analyze the teacher's grading criteria and the resource files. Then teach me how to create a Cocos project, push to Git, and implement the features step by step.

**AI Response Summary**

AI organized the grading criteria into scenes, map/physics, player, enemies, question blocks, UI, audio, Firebase, Git, and deployment. The work was broken into small testable stages.

**Final Result**

The project now has a full flow: start screen, login/register, level select, gameplay, victory/game-over, Firebase records, leaderboard, and deployment.

---

### Record 2: Cocos Creator version compatibility

**Prompt (translated)**

> I cannot attach the script, and Cocos is showing errors.

**AI Response Summary**

The first script style was adjusted from Cocos Creator 3.x imports to Cocos Creator 2.4.8 syntax using `cc._decorator`, `cc.Component`, and `cc.director.loadScene()`.

**Final Result**

All project scripts use Cocos Creator 2.4.8 compatible TypeScript style.

---

### Record 3: Start screen and level select scene

**Prompt (translated)**

> Teach me the next step after creating the project.

**AI Response Summary**

AI guided creation of `StartScene`, `LevelSelectScene`, and `MainGameScene`, including button setup, Cocos click events, and scene switching.

**Final Result**

`StartScene` contains `START` and `LOGIN`. `LevelSelectScene` contains `WORLD1`, `BACK`, `HISTORY`, `LEADERBOARD`, and `SETTING`.

---

### Record 4: Pixel-art display and bitmap font tuning

**Prompt (translated)**

> The images are clear, but the font is still blurry.

**AI Response Summary**

AI explained that pixel art and bitmap font textures should use point filtering and that non-integer scaling can blur text.

**Final Result**

Pixel-art textures, button sprites, and bitmap fonts were tuned repeatedly. Several UI labels were split into separate labels when the bitmap font had no space character.

---

### Record 5: TMX map setup

**Prompt (translated)**

> I redrew the map with 16x16 tiles. Please confirm the map position, camera size, and what I need to set in Cocos.

**AI Response Summary**

AI inspected the TMX map size, layer names, object groups, and Cocos 2.4.8 TMX compatibility. The map was confirmed as `240 x 40` tiles, `16 x 16` each.

**Final Result**

`assets/resources/tiles/mario map.tmx` is the playable map. It contains start, coins, question blocks, flowers, Goombas, and castle/finish area data.

---

### Record 6: Runtime tile collision

**Prompt (translated)**

> Except for `no collide`, the other map layers should have collision. The collision range may be too large. Can you read my tile map and write the actual collision range into code?

**AI Response Summary**

AI helped generate per-tile collision bounds from visible pixels and added a runtime collision builder for TMX tile layers.

**Final Files**

| File | Change |
|---|---|
| `TileCollisionBounds.ts` | Stores tile-specific collision bounds and manual tuning. |
| `TileMapCollisionBuilder.ts` | Builds solid colliders and vine sensor colliders from TMX layers. |

**Final Result**

Solid tiles, vines, pipes, spikes, and platform edges have usable physics. Pipe and flower collision bounds were later tuned manually based on gameplay screenshots.

---

### Record 7: Mario movement, jump, long jump, and climb

**Prompt (translated)**

> Use my grouped Mario animation. Normal movement uses walk, forward jump uses forward jump, straight up jump uses upward jump, idle uses idle, and vines use climbing.

**AI Response Summary**

AI updated `PlayerController` to load grouped frames and switch animations according to movement, jump, long-jump state, and climb state.

**Final Result**

Mario supports:

- Idle
- Walking
- Upward jump
- Long jump
- Long-jump air frame hold so the feet do not keep moving
- Vine climbing
- Defeat animation
- Victory animation

---

### Record 8: Camera follow and widescreen behavior

**Prompt (translated)**

> The camera does not move right. Later, after deployment, why does the left side show an extra piece?

**AI Response Summary**

AI added camera follow and map-bound clamping, then later helped debug deployment-only widescreen behavior. The solution added viewport handling and black side letterboxing so the gameplay view behaves like level select instead of exposing background/map edges.

**Final Files**

| File | Change |
|---|---|
| `CameraFollow.ts` | Follow, clamp, zoom, dead zone, design-width viewport, side letterbox. |
| `GameHUD.ts` | HUD layout follows effective gameplay viewport. |
| `ParallaxBackground.ts` | Background centered to the camera view. |

**Final Result**

Gameplay now uses a 960px reference view with side black bars on wider screens, matching the level select style.

---

### Record 9: Parallax and background placement

**Prompt (translated)**

> I want `map_background` to be the whole map background. It should feel far away, like Mario is running in the foreground.

**AI Response Summary**

AI helped implement camera-relative background movement and later adjusted it to avoid edge artifacts on deployment.

**Final Result**

The main game background stays visually behind the map and no longer exposes unwanted background edge strips at the map start/end.

---

### Record 10: Coins and HUD

**Prompt (translated)**

> Generate coins according to the positions marked in the map. They should spin and update the HUD.

**AI Response Summary**

AI helped implement coin spawning from TMX objects, coin animation, collection logic, collection effect, SFX, and HUD update events.

**Final Files**

| File | Change |
|---|---|
| `CoinSpawner.ts` | Spawns static and dynamic coins, animates them, plays coin SFX. |
| `CoinCollectible.ts` | Handles player contact. |
| `GameHUD.ts` | Updates coin count and score. |

**Final Result**

Coins update both coin count and score. The coin sound was tuned separately because it was hard to hear compared with other SFX.

---

### Record 11: Question blocks

**Prompt (translated)**

> Generate question blocks from the map. When Mario hits from below, turn them into used blocks and spawn rewards.

**AI Response Summary**

AI helped split question block graphics, generate blocks from TMX objects, detect bottom hits, prevent adjacent blocks from triggering together, and place reward coins safely.

**Final Result**

Question blocks animate, become used blocks, spawn coins, and play `kick` when a reward is triggered.

---

### Record 12: Flower enemies

**Prompt (translated)**

> Add flower enemies. When Mario is nearby, they should emerge, animate, retract, and then cool down.

**AI Response Summary**

AI created a flower enemy state machine and connected it to TMX object spawning.

**Final Result**

Pipe flowers detect Mario, play a full emerge/open-close/retract cycle, use active collision while visible, and have smaller Y collision to better match the sprite.

---

### Record 13: Goomba enemies and stomp rules

**Prompt (translated / summarized)**

> Add enemy behavior and stomp sound. When Mario stomps an enemy, play `stomp`.

**AI Response Summary**

AI added Goomba spawning and behavior. Goombas activate when Mario is on the same platform, chase, lose Mario, return to their start position, and can be stomped.

**Final Files**

| File | Change |
|---|---|
| `GoombaSpawner.ts` | Creates Goombas on valid surfaces. |
| `GoombaEnemy.ts` | Controls chase/return and stomp defeat. |
| `PlayerController.ts` | Detects harmless defeated Goombas and enemy contact. |
| `GameHUD.ts` | Adds score when enemies are defeated. |

**Final Result**

Stomping a Goomba plays `stomp`, bounces Mario, adds score, and removes the Goomba. Defeated enemies do not return after a continue.

---

### Record 14: BGM and SFX architecture

**Prompt (translated)**

> Add background music. `gamescene` uses `bgm_3`; other scenes use `bgm_1`. Make volume adjustable. Later, add jump, coin, climb, stomp, kick, and button sounds.

**AI Response Summary**

AI helped add separate BGM and SFX handling. BGM is controlled in `SceneChanger`; SFX uses `GameAudio`. Volume was repeatedly tuned based on testing because the original 0-1 engine volume was too loud and some SFX became inaudible.

**Final Result**

- Non-game scenes use `audio/bgm_1`.
- `MainGameScene` uses `audio/bgm_3`.
- Loading transition has no BGM.
- BGM pauses during defeat.
- UI volume is 0-100.
- Initial BGM and SFX volume is 50.
- SFX are played independently from BGM.

---

### Record 15: Level loading transition

**Prompt (translated)**

> Between level select and main game, add a black screen with Mario running in place and `WORLD1`. I want this because the game scene should load first before switching.

**AI Response Summary**

AI implemented an intermediate loading overlay instead of immediately showing `MainGameScene`. It preloads/loads the game scene while showing Mario running and the yellow `WORLD1` font.

**Final Result**

The transition screen has no BGM, shows Mario running beside `WORLD1`, and then enters the main game once the scene load completes.

---

### Record 16: Death, continue, and game over flow

**Prompt (translated)**

> When Mario's life reaches 0, Mario should fly into the air but not exceed the map top. Play the lose-one-life animation and sound. Everything except Mario should pause. After that, ask whether the player wants to spend 10 coins to retry. If yes, respawn and keep score/coins/time and removed objects. If no or not enough coins, show a game-over black screen and return to level select.

**AI Response Summary**

AI split the logic between `PlayerController`, `GameHUD`, `GamePause`, and `GameAudio`.

**Final Result**

- Mario flies upward and freezes in air.
- Defeat frames are timed across the `loseOneLife` audio duration.
- Game state, animations, enemies, and timer pause.
- BGM pauses.
- Continue costs 10 coins and restores 3 lives.
- Respawn snaps Mario to the ground and forces idle.
- Collected coins and defeated enemies stay removed.
- Game over saves a failed Firebase run, plays game-over sound, shows a black screen, and returns to level select.

---

### Record 17: Victory and level clear flow

**Prompt (translated)**

> When Mario reaches the finish point, play a victory animation, pause all game state except Mario, then switch to a level-clear black screen. Play `levelclear`; after it finishes, return to level select.

**AI Response Summary**

AI added finish trigger detection near the castle door, victory animation, level-clear overlay, Firebase cleared record saving, and level-clear audio timing.

**Final Result**

- Finish detection is near the left side of the castle door tile.
- The trigger has a Y limit so coins on top of the castle do not trigger victory.
- Victory animation uses two frames, each about one second.
- Level-clear screen uses victory pose frames while playing `levelClear`.
- The silent tail of the `levelClear` audio is excluded from timing.
- A completed Firebase run is saved.

---

### Record 18: Firebase login/register

**Prompt (translated)**

> Add a `LOGIN` button below `START`. If the account exists, log in. If it does not exist, register. Use `button_blue` for the popup buttons if needed.

**AI Response Summary**

AI added Firebase config handling, dynamic SDK loading, Auth sign in/register logic, and a login popup.

**Final Result**

- `LOGIN` appears under `START`.
- Email/password popup accepts input.
- Existing accounts sign in.
- Missing accounts register.
- Login success goes to level select.
- Register success shows `REGISTER SUCCESS`.
- Back from level select signs out.

---

### Record 19: Login popup UI tuning

**Prompt (translated / summarized)**

> The button size and font should match `START`. The text is missing. The popup text is too small, spread too far apart, misaligned, and input text is invisible or moves after focus changes.

**AI Response Summary**

AI repeatedly adjusted popup label size, label bounds, input field styling, placeholder handling, button scale, and text alignment.

**Final Result**

The login popup uses visible input fields, placeholder text, styled OK/CANCEL buttons, readable title text, and stable input display after focus changes.

---

### Record 20: Level select history, leaderboard, and settings

**Prompt (translated)**

> In level select, add a back button below `WORLD1`. Add a lower-left setting area with `history`, `leaderboard`, and `setting`. History shows the player's recent records and best rank. Leaderboard shows top five completed records. Setting adjusts BGM and SFX volume.

**AI Response Summary**

AI added level select side buttons, popups, Firebase queries, visual styling, icons, and volume sliders.

**Final Result**

- `BACK` button is below `WORLD1`.
- Side buttons: `HISTORY`, `LEADERBOARD`, `SETTING`.
- History is disabled when not logged in.
- History shows latest 3 records.
- Best completed run is shown with global rank.
- Leaderboard shows top 5 completed runs.
- Leaderboard sort: higher score, lower time, higher coins.
- Setting popup adjusts BGM and SFX volume.

---

### Record 21: History and leaderboard data display

**Prompt (translated / summarized)**

> Firebase shows records, but history and leaderboard are blank. Maybe the text display range is too small. Make text larger, use coin/time icons, use email prefix as player name, and do not show extra query count text.

**AI Response Summary**

AI fixed data loading and display issues, then repeatedly tuned label bounds, font size, icon size, spacing, alignment, and popup colors.

**Final Result**

- History and leaderboard load Firestore data.
- Player names display as email prefix, for example `test1@gmail.com` becomes `TEST1`.
- History shows `LATEST 3 RECORDS`.
- Leaderboard headers use `RANK`, `PLAYER`, `SCORE`, `TIME`, `COIN`.
- Records use readable icons and labels.
- Popups use themed colors and larger text.

---

### Record 22: Firebase run records and leaderboard rules

**Prompt (translated)**

> I want to store login account, historical score, historical coin count, and game time. Leaderboard only references completed level records. Sort by score first, then game time, then coins.

**AI Response Summary**

AI designed the Firestore data shape and sorting logic.

**Final Result**

Run records are saved under:

```text
users/{uid}/runs/{runId}
```

Each record includes score, coins, play time, time left, world, cleared flag, email, uid, and server timestamp.

Leaderboard sorting:

1. Higher score first.
2. Lower play time first.
3. Higher coin count first.

---

### Record 23: UI button color and popup styling

**Prompt (translated / summarized)**

> The side button colors are ugly. Use blue, orange, blue. Change popup background and border colors. Back button inside popup should be orange.

**AI Response Summary**

AI adjusted side button tinting, popup background colors, border colors, disabled button state, and back button appearance.

**Final Result**

Level select now has clearer visual grouping:

- History: blue style.
- Leaderboard: orange style.
- Setting: blue style.
- Disabled history uses the gray button asset when logged out.
- Leaderboard popup uses orange/brown styling and orange back button.

---

### Record 24: Deployment and Cocos build path issue

**Prompt (translated)**

> Help me deploy this web page. Or tell me how to press build in Cocos.

**AI Response Summary**

AI guided the Cocos Creator build settings and explained the build error caused by spaces in the build path.

**Final Result**

- Cocos build uses Web Desktop.
- Initial scene is `StartScene.fire`.
- `StartScene`, `LevelSelectScene`, and `MainGameScene` are included.
- A no-space project copy is used at `C:\Users\User\Desktop\web_mario_game` because Cocos rejected paths containing spaces.
- The project was deployed to Firebase Hosting.

---

### Record 25: Firebase security and Git ignore

**Prompt (translated / summarized)**

> GitHub warned me. Did you push something that should not be pushed?

**AI Response Summary**

AI checked the repo status and clarified that the Firebase web config is public-facing client config, not a private admin key. Build/deploy artifacts were ignored.

**Final Result**

`.firebase/` and `/settings/builder.json` are ignored because they are local build/deploy artifacts. The Firebase client config remains in the browser code as expected for Firebase web apps.

---

### Record 26: Early generated-ground prototype

**Prompt (translated)**

> `tiles_272` is the middle ground tile, `tiles_271` is the left edge ground tile, and `tiles_273` is the right edge ground tile. Generate the ground at three times the original image size and use the placed `tiles_272` position as the starting point.

**AI Response Summary**

AI created an early ground generator that used manually placed editor tiles as a position reference and generated a platform from the left, middle, and right ground tile frames.

**Final Result**

This prototype was useful for testing movement and collision before the TMX map was ready. It was later removed because the final level uses `mario map.tmx` and runtime TMX collision generation.

---

### Record 27: Early animated level-intro prototype

**Prompt (translated)**

> Mario falls before the ground is generated. Can we add an entering-level screen? I want the level intro background to use `tiles_570` to `tiles_573` as an animation that looks like water flowing down.

**AI Response Summary**

AI created an early reusable intro system with `LevelIntro.ts`, `AnimatedTileBackground.ts`, and `IntroTextGroupSwitcher.ts`.

**Final Result**

The prototype displayed an animated tile background while waiting for the level to become ready. It was later replaced by the final black loading transition between level select and main game, because the user wanted the main game scene to finish loading before gameplay appears.

---

### Record 28: Cocos and TMX compatibility debugging

**Prompt (translated / summarized)**

> Cocos cannot read or display the map correctly. Confirm the TMX settings and Cocos setup.

**AI Response Summary**

AI helped inspect the TMX file, Cocos import behavior, scene hierarchy, and map/camera sizing.

**Final Result**

The map workflow was stabilized by checking TMX layer names, object groups, object coordinates, tile size, map size, and Cocos Creator 2.4.8 compatibility. Tiled version differences were noted because newer TMX metadata can confuse Cocos 2.4.8.

---

### Record 29: Iterative UI screenshot tuning

**Prompt (translated / summarized)**

> The text is too small, clipped, too high, too far apart, or the button color looks bad. Adjust the display range, position, and colors.

**AI Response Summary**

AI iteratively adjusted label bounds, font sizes, split labels, popup layout, button scale, disabled button assets, and popup colors based on screenshot feedback.

**Final Result**

The login popup, level select side buttons, history popup, leaderboard popup, setting popup, and loading/game-over/level-clear screens were all tuned visually through repeated screenshot comparison.

## 4. Current AI Usage Summary

AI was used for:

- Understanding the grading rubric.
- Planning the implementation order.
- Creating the scene flow.
- Fixing Cocos Creator 2.4.8 script compatibility.
- Setting up pixel-art fonts and textures.
- Creating and later replacing early generated-ground and animated-intro prototypes.
- Importing and validating TMX map data.
- Building runtime tile collision.
- Implementing Mario movement, jump, long jump, climb, damage, death, continue, and victory.
- Implementing camera follow and widescreen side letterboxing.
- Implementing parallax/background placement.
- Implementing coins, scoring, HUD, and timer.
- Implementing question blocks and reward coin placement.
- Implementing pipe flowers.
- Implementing Goombas and stomp rules.
- Connecting BGM and SFX.
- Tuning 0-100 volume controls.
- Creating the loading transition.
- Creating the game-over and level-clear black screens.
- Connecting Firebase Auth and Firestore.
- Designing Firestore record structure.
- Implementing history and leaderboard popups.
- Styling level select popups and buttons.
- Guiding Cocos build and Firebase deploy.
- Updating `README.md` and `AI_reference.md`.

## 5. Current Cocos Setup Notes

| Node | Component / Setup |
|---|---|
| `Canvas > Main Camera` | Attach `CameraFollow` and `ParallaxBackground`. Use the player node and TMX map node paths. |
| `Canvas` | Attach `GameHUD` so HUD stays in screen space. |
| `Canvas > World > Map > mario map` | Attach `cc.TiledMap`, `TileMapCollisionBuilder`, `CoinSpawner`, `QuestionBlockSpawner`, `FlowerSpawner`, and `GoombaSpawner`. |
| `Canvas > World > Player > mario_grouped_small.plist` | Attach `PlayerController`, `RigidBody`, `PhysicsBoxCollider`, and `Sprite`. Keep physics scale at `1`. |
| `StartScene` UI node | Attach/use `SceneChanger` for start, login, BGM, and button sound. |
| `LevelSelectScene` UI node | Attach/use `SceneChanger` for world button, back/sign-out, history, leaderboard, setting, and loading transition. |

## 6. Build and Deploy Notes

Recommended Cocos build settings:

| Setting | Value |
|---|---|
| Platform | Web Desktop |
| Build path | `./build` |
| Initial scene | `db://assets/scenes/StartScene.fire` |
| Build scenes | `StartScene`, `LevelSelectScene`, `MainGameScene` |
| Inline all SpriteFrame | Enabled |
| Debug mode | Disabled for deployment |
| Source Maps | Disabled for deployment |

The original development repo path contains a space:

```text
C:\Users\User\Desktop\SW Studio Lab\web_mario_game
```

Cocos build failed when the build path contained spaces. A no-space copy was used for build/deploy:

```text
C:\Users\User\Desktop\web_mario_game
```

## 7. Remaining Work

| Item | Status |
|---|:---:|
| Start, level select, gameplay flow | Complete |
| Login/register | Complete |
| History and leaderboard | Complete |
| Firebase Hosting deploy | Complete |
| Camera and widescreen letterbox | Complete |
| BGM/SFX and volume sliders | Complete |
| Player death/continue/game-over | Complete |
| Victory/level-clear | Complete |
| Coins, question blocks, flowers, Goombas | Complete |
| Mushroom power-up | Not implemented |
| Additional levels | Not implemented |
| Mobile controls | Not implemented |
| More enemy types such as turtle | Not implemented |
