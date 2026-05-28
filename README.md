# Web Mario Game

This project is a Mario-style 2D platformer built with **Cocos Creator 2.4.8**.

The game includes a complete playable flow from start menu, login/register, level selection, loading transition, main gameplay, level clear, game over, Firebase history, leaderboard, and Firebase Hosting deployment.

## Website and Project Information

- Firebase Hosting: `https://web-mario-game.web.app`
- GitHub repository: `https://github.com/ismesid/web-mario-game.git`
- Cocos Creator version: `2.4.8`
- Main build target: Web Desktop
- Build output: `build/web-desktop`

## Game Flow

```text
Open game
  -> optional LOGIN / REGISTER
  -> START
  -> Level Select
  -> choose WORLD1
  -> WORLD1 loading screen
  -> play MainGameScene
  -> level clear or game over
  -> return to Level Select
```

The login popup uses one account flow: entering an existing email signs in, and entering a new email registers a new account. Players can also use `BACK` on the level select screen to sign out and return to the start menu. The `WORLD1` loading screen is intentionally placed between level select and gameplay. It shows a black screen, Mario running in place, and `WORLD1` in the yellow font while the main game scene is loaded. BGM is muted during this buffer scene.

## Grading Progress

### Complete Game Process

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Start menu | 5% | Y | Start screen includes title, start button, login button, BGM, and button SFX. |
| Level select | 5% | Y | Level select includes `WORLD1`, back button, history, leaderboard, and setting buttons. |
| Game view / game start / game over | 5% | Y | `MainGameScene` can be entered, played, cleared, continued, or ended with game over. |

### Basic Rules

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| World map: physics, gravity, collision | 10% | Y | TMX map, physics, gravity, generated tile colliders, vine sensors, coin sensors, enemy colliders, hazard terrain, and tuned tile bounds are implemented. |
| Background and camera follow player | 10% | Y | Camera follows Mario, clamps to map bounds, supports a 960px gameplay viewport, and uses black side letterboxing on wide screens. |
| At least one world map | 10% | Y | `mario map.tmx` is the playable first level. |
| Static wall | 5% | Y | Solid TMX layers generate static physics colliders. |
| Question blocks | 5% | Y | Question blocks animate, detect hits from below, become used blocks, spawn reward coins, and play kick SFX. |
| Player movement, jump, hurt, death, respawn | 15% | Y | Movement, jump, long jump, climbing, damage, invincibility blink, death sequence, continue, and respawn are implemented. |
| Enemies and stomp rules | 15% | Y | Pipe flowers and Goombas are implemented. Goombas can be stomped, give score, play stomp SFX, and stay defeated after continue. |
| Super mushroom makes Mario bigger | 5% | N | Mushroom power-up is not implemented. |

### Animations

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Player walk / jump animations | 5% | Y | Mario has idle, walk, upward jump, long jump, climb, defeat, and victory animations. Long-jump air frames are held so the feet do not keep walking in air. |
| Enemy animation | Up to 5% | Y | Flowers animate open / close / retract, and Goombas walk, squash, then use angel frames when defeated. |

### Sound Effects

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| At least one BGM | 2% | Y | `bgm_1` is used outside gameplay. `bgm_3` is used in `MainGameScene`. |
| Player jump / die sound effects | 3% | Y | Jump and lose-one-life sounds are connected. |
| Additional sound effects | Up to 5% | Y | Coin, climb, stomp, kick, reserve button, game over, and level clear sounds are connected. |
| Sound effects must not interrupt BGM | Required | Y | BGM and SFX are handled separately through `SceneChanger` and `GameAudio`. |

### UI

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Player life | 3% | Y | HUD shows Mario icon and life count. Continue restores lives to 3 after spending coins. |
| Player score | 5% | Y | Coins and defeated enemies add score. Firebase records final score. |
| Timer | 2% | Y | HUD timer counts down during gameplay and pauses during death / victory transitions. |

### Appearance / Bonus / Git

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Appearance | 10% | Y | Start, level select, loading screens, HUD, popups, pixel font, buttons, map, background, enemies, and effects are polished. |
| Firebase bonus | 5% | Y | Firebase Auth, Firestore run records, and Firebase Hosting deployment are implemented. |
| Leaderboard / multiplayer / other bonus | Up to 10% | Y | History, best rank, and top-five leaderboard are implemented. |
| Git version control | 5% | Y | Development is committed and pushed to GitHub. |

## Features

- Start screen with `START` and `LOGIN`.
- Firebase email/password login and automatic registration if the entered email does not exist.
- Login success enters level select directly.
- Register success shows a success message before entering level select.
- Level select with `WORLD1`, `BACK`, `HISTORY`, `LEADERBOARD`, and `SETTING`.
- `BACK` signs out and returns to the start scene.
- `HISTORY` is disabled when the player is not logged in.
- History popup shows the latest 3 run records and the player's best completed record.
- Leaderboard popup shows top 5 completed records.
- Setting popup adjusts BGM and SFX volume with sliders from 0 to 100.
- Volume values are saved locally.
- Initial BGM and SFX volume are set to 50.
- The main game uses a TMX map, generated tile colliders, coins, question blocks, vines, flowers, Goombas, HUD, camera follow, and parallax background.
- Game over and level clear records are saved to Firestore when the player is logged in.

## Controls

### Menu

| Action | Control |
|---|---|
| Start game flow | Click `START` |
| Login / register | Click `LOGIN` |
| Select level 1 | Click `WORLD1` |
| Return to start and sign out | Click `BACK` in level select |
| Open popups | Click `HISTORY`, `LEADERBOARD`, or `SETTING` |

### Main Game

| Action | Control |
|---|---|
| Move left / right | `A / D` |
| Jump | `W` |
| Long jump | Run left / right before jumping |
| Climb vines | `W / S` while touching vines |

## Game Systems

### Player

- Spawns from the TMX `start point` object group.
- Supports left/right movement, jump, long jump, and vine climbing.
- Uses grouped Mario frames from `player/mario_grouped_small`.
- Plays `jump` once when jumping.
- Plays repeated `climb` SFX only while climbing and moving up/down.
- Takes damage from enemies and hazards.
- Uses temporary invincibility blink after damage.
- At 0 lives, Mario flies upward, stays inside the map top bound, and plays the lose-one-life animation.
- During the defeat sequence, background BGM pauses and the rest of the game is paused.
- After the lose-one-life sound finishes, the continue prompt appears if the player has at least 10 coins.
- Continuing spends 10 coins, restores 3 lives, keeps score / collected coins / defeated enemies, and respawns Mario on the ground in idle state.
- If the player cannot continue or chooses not to, the game enters the game-over black screen and returns to level select.
- On victory, Mario plays a two-frame victory animation while the rest of the game is paused.

### Map and Collision

- `mario map.tmx` is the first playable level.
- All solid TMX layers except `no collide` generate physics colliders.
- Vine layers generate sensor colliders.
- Tile collision bounds are generated from visible pixels to reduce invisible collision.
- Pipe, spike, and flower collision areas were manually tuned.
- Finish detection is based on the castle door tile area, with a narrow trigger near the left side of the door and a height limit so castle-top coin collection does not trigger victory.

### Coins and Score

- Coins are generated from the TMX `coins` object group.
- Question blocks can spawn reward coins.
- Coin collection updates coin count, score, collection effect, and SFX.
- Coin SFX uses a stronger engine volume so it stays audible.
- Goomba stomp adds score.

### Question Blocks

- Generated from the TMX `questions` object group.
- Use a four-frame question block animation.
- Detect centered hits from below.
- Turn into a used block after being hit.
- Spawn a reward coin on the nearest valid surface.
- Play `kick` when the reward is triggered.

### Enemies

- Pipe flowers are generated from the TMX `flowers` object group.
- Flowers detect Mario nearby, emerge, animate, retract, and then cool down.
- Flower Y collision was reduced to better match the visible sprite.
- Goombas chase Mario when on the same platform.
- Goombas return to their start point after losing Mario.
- Stomping a Goomba plays `stomp`, bounces Mario upward, adds score, and destroys the Goomba after a short animation.

### HUD and State

- HUD shows world, lives, timer, coin count, and score.
- HUD stays in screen space and is not affected by camera movement.
- Timer pauses during game pause, death sequence, continue popup, and victory sequence.
- Run records are saved on game over and level clear.

### Audio

- `bgm_1` plays in non-game scenes.
- `bgm_3` plays in `MainGameScene`.
- The level loading buffer and game-over / level-clear black screens control their own audio behavior.
- Connected SFX:
  - `jump`
  - `coin`
  - `climb`
  - `stomp`
  - `kick`
  - `reserve`
  - `loseOneLife`
  - `Game Over`
  - `levelClear`
- BGM and SFX volumes use 0-100 UI values.
- `GameAudio` maps 100 to a low engine volume so the game is not too loud.

### Firebase

- Firebase SDK is loaded dynamically in browser builds.
- Firebase Auth is used for email/password login.
- If login fails because the user does not exist, the same popup registers a new account.
- Firestore stores user profiles under `users/{uid}`.
- Firestore stores run records under `users/{uid}/runs`.
- A run record includes:
  - `uid`
  - `email`
  - `score`
  - `coins`
  - `playTimeSec`
  - `timeLeft`
  - `world`
  - `cleared`
  - `createdAt`
- Leaderboard only uses records where `cleared == true`.
- Leaderboard sorting:
  1. Higher score first.
  2. Lower play time first.
  3. Higher coin count first.
- Player display names use the email prefix before `@`, for example `test1@gmail.com` displays as `TEST1`.

## Project Structure

```text
assets/
  resources/
    audio/
    pictures/
    player/
    enemies/
    tiles/
    fonts/
    others/
  scenes/
    StartScene.fire
    LevelSelectScene.fire
    MainGameScene.fire
  scripts/
    CameraFollow.ts
    CoinCollectible.ts
    CoinSpawner.ts
    FirebaseService.ts
    FlowerEnemy.ts
    FlowerSpawner.ts
    GameAudio.ts
    GameHUD.ts
    GamePause.ts
    GoombaEnemy.ts
    GoombaSpawner.ts
    ParallaxBackground.ts
    PlayerController.ts
    QuestionBlock.ts
    QuestionBlockSpawner.ts
    SceneChanger.ts
    TileCollisionBounds.ts
    TileMapCollisionBuilder.ts
```

## Main Scripts

| Script | Purpose |
|---|---|
| `SceneChanger.ts` | Scene switching, BGM control, login popup, level select UI, history popup, leaderboard popup, setting popup, loading screen, button SFX. |
| `FirebaseService.ts` | Firebase SDK loading, Auth login/register/sign-out, Firestore run saving, history query, leaderboard query, best-rank query. |
| `GameAudio.ts` | Central SFX loader/player and 0-100 volume scaling. |
| `GamePause.ts` | Shared pause flag used by gameplay systems during death, continue, and victory. |
| `PlayerController.ts` | Mario movement, jump, long jump, climbing, damage, death sequence, continue respawn, victory trigger, animations, SFX. |
| `GameHUD.ts` | HUD, timer, score, coins, lives, continue popup, game-over flow, level-clear flow, Firebase run saving. |
| `CameraFollow.ts` | Camera follow, map clamping, viewport handling, and side letterbox support. |
| `ParallaxBackground.ts` | Camera-centered background placement for the gameplay scene. |
| `TileMapCollisionBuilder.ts` | Runtime TMX tile collider generation. |
| `TileCollisionBounds.ts` | Pixel-based tile collision bounds. |
| `CoinSpawner.ts` | TMX coin spawning, dynamic reward coin spawning, coin animation, coin collection SFX/effect. |
| `CoinCollectible.ts` | Coin-player collision handling. |
| `QuestionBlockSpawner.ts` | Runtime question block creation and reward placement. |
| `QuestionBlock.ts` | Bottom-hit detection and used-block transition trigger. |
| `FlowerSpawner.ts` | Runtime pipe flower creation from TMX objects. |
| `FlowerEnemy.ts` | Pipe flower state machine and collision. |
| `GoombaSpawner.ts` | Runtime Goomba creation and platform bounds. |
| `GoombaEnemy.ts` | Goomba chase/return behavior, stomp detection, defeated animation, score reward. |

## Cocos Setup Notes

### Scenes

| Scene | Purpose |
|---|---|
| `StartScene.fire` | Start menu and login/register popup. |
| `LevelSelectScene.fire` | Level selection, Firebase history, leaderboard, setting panel, sign-out back button. |
| `MainGameScene.fire` | Main gameplay. |

### Main Gameplay Nodes

| Node | Component / Setup |
|---|---|
| `Canvas > Main Camera` | Attach `CameraFollow` and `ParallaxBackground`. |
| `Canvas` | Attach `GameHUD`. |
| `Canvas > World > Map > mario map` | Attach `cc.TiledMap`, `TileMapCollisionBuilder`, `CoinSpawner`, `QuestionBlockSpawner`, `FlowerSpawner`, and `GoombaSpawner`. |
| `Canvas > World > Player > mario_grouped_small.plist` | Attach `PlayerController`, `RigidBody`, `PhysicsBoxCollider`, and `Sprite`. Keep physics scale at `1`. |

### Build Notes

Cocos Creator reported a build error when the build path contained spaces. Because the original folder path includes `SW Studio Lab`, a no-space copy is used for build/deploy:

```text
C:\Users\User\Desktop\web_mario_game
```

The normal development repository remains:

```text
C:\Users\User\Desktop\SW Studio Lab\web_mario_game
```

Recommended Cocos build settings:

- Platform: `Web Desktop`
- Build path: `./build`
- Initial scene: `db://assets/scenes/StartScene.fire`
- Build scenes: `StartScene`, `LevelSelectScene`, `MainGameScene`
- Inline all SpriteFrame: enabled
- Debug mode: disabled for deployment

## How to Run Locally

1. Open the project with **Cocos Creator 2.4.8**.
2. Open `assets/scenes/StartScene.fire`.
3. Press Preview / Play.
4. Test the flow:

```text
StartScene -> LevelSelectScene -> WORLD1 loading screen -> MainGameScene
```

## How to Build and Deploy

1. Open the no-space project copy in Cocos Creator if needed.
2. Open **Project > Build...**.
3. Choose **Web Desktop**.
4. Set the build path to `./build`.
5. Make sure all three scenes are included.
6. Click **Build**.
7. Deploy the generated web build to Firebase Hosting.

The `.firebase/` folder and `settings/builder.json` are ignored by Git because they are local build/deploy artifacts.

## Development Work Also Completed

Some work was implemented or tested during development even if it was later replaced by the final version:

- Imported and organized TA-provided assets from `audio`, `pictures`, `player`, `enemies`, `tiles`, `fonts`, and `others`.
- Fixed Cocos Creator 3.x style script examples into Cocos Creator 2.4.8-compatible TypeScript.
- Adjusted pixel-art texture filtering and bitmap font settings many times to avoid blurry or clipped text.
- Built an early generated-ground prototype using `tiles_271`, `tiles_272`, and `tiles_273` before the project moved fully to the TMX map workflow.
- Built an early level-intro prototype with animated water-like tiles from `tiles_570` to `tiles_573`.
- Removed the old intro prototype after replacing it with the final black `WORLD1` loading screen.
- Tested top-only tile collision, then disabled it because it allowed side entry through solid blocks.
- Inspected and adjusted the TMX file after Tiled saved a newer map version that Cocos Creator 2.4.8 could not read correctly.
- Debugged several deployment-only viewport issues, including the extra visible background strip at the map start/end.
- Tuned popup UI label bounds, button label bounds, button scale, colors, and input field behavior across multiple screenshots.
- Checked Git status before commits and ignored local build/deploy artifacts.

## Remaining Work

| Item | Status |
|---|:---:|
| Mushroom power-up | Not implemented |
| Additional levels | Not implemented |
| Mobile touch controls | Not implemented |
| More enemy types such as turtle | Not implemented |
| Final balancing and playtest polish | Ongoing |
