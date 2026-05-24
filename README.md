# Web Mario

This project is a Mario-style 2D platformer built with **Cocos Creator 2.4.8**.

The current version already includes the basic game flow: the player can enter the start menu, move to the level select screen, and click `LEVEL 1` to enter the main game scene. The first playable scene now uses a TMX tile map, generated tile collision, camera follow, Mario movement, jump control, grouped Mario animations, vine climbing, collectable coins, question blocks, pipe flower enemies, a HUD panel, and a scrolling background. Sound effects, player death / respawn, and Firebase deployment will be added later.

## Website and Project Information

- Firebase Hosting: not deployed yet
- GitHub repository: `https://github.com/ismesid/web-mario-game.git`
- Cocos Creator version: `2.4.8`

## Grading Progress

### Complete Game Process

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Start menu | 5% | Y | The start screen is complete, including a Mario-style background, title image, and `START` button. |
| Level select | 5% | Y | The level select screen is complete, including the `LEVEL SELECT` title and `LEVEL 1` button. |
| Game view / game start / game over | 5% | Partial | `MainGameScene` is created and can be entered from `LEVEL 1`. The TMX map, player control, camera follow, HUD, and tile collision are implemented, but game over is not finished yet. |

### Basic Rules

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| World map: physics, gravity, collision | 10% | Partial | Physics, gravity, TMX map collision, vine sensors, generated tile collision, question block collision, coin sensors, flower collision, and tuned pipe / spike bounds are implemented. Player death and enemy damage rules still need to be connected. |
| Background and camera follow player | 10% | Y | `CameraFollow` follows Mario, clamps the view inside the map bounds, and the map uses a repeated parallax background. |
| At least one world map | 10% | Y | `mario map.tmx` is used as the first playable map. |
| Static wall | 5% | Partial | Solid tile layers generate static colliders. Collision bounds are tuned per tile, including smaller bounds for pipes and spikes. |
| Question blocks | 5% | Y | Question blocks are generated from the TMX `questions` object group, animate, react to hits from below, turn into used blocks, and spawn reward coins. |
| Player movement, jump, hurt, death, respawn | 15% | Partial | Movement, jump, grouped animations, and vine climbing are implemented. Hurt, death, and respawn are not implemented yet. |
| Enemies and stomp rules | 15% | Partial | Pipe flower enemies are generated from the TMX `flowers` object group. They detect Mario, emerge, animate, retract, and collide with Mario. Death / stomp rules are not finished yet. |
| Super mushroom makes Mario bigger | 5% | N | Planned as the first question block reward. |

### Animations

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Player walk / jump animations | 5% | Partial | Mario idle, walk, forward jump, upward jump, and climb animations are implemented through `mario_grouped_small`. |
| Enemy animation | Up to 5% | Partial | Pipe flowers use script-driven open / close animation from `enemies/Flower.plist`. Other enemies are not implemented yet. |

### Sound Effects

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| At least one BGM | 2% | N | Audio assets are imported, but not connected to scenes yet. |
| Player jump / die sound effects | 3% | N | Audio assets are imported, but not connected to player actions yet. |
| Additional sound effects | Up to 5% | N | Coin, kick, power up, stomp, and level clear sounds are imported. |
| Sound effects must not interrupt BGM | Required | N | This will be handled later by playing BGM and sound effects separately. |

### UI

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Player life | 3% | Partial | HUD displays the current life count. Life loss behavior is not connected yet. |
| Player score | 5% | Partial | HUD displays score and coin collection increases the score. More scoring rules are planned. |
| Timer | 2% | Y | HUD displays and counts down the level timer. |

### Appearance / Bonus / Git

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Appearance | 10% | Partial | The start screen, level select screen, TMX map, Mario sprites, HUD, parallax background, coins, question blocks, and pipe flowers are in place. Some gameplay objects still need polish. |
| Firebase bonus | 5% | N | Not deployed yet. |
| Leaderboard / multiplayer / other bonus | Up to 10% | N | Not implemented yet. |
| Git version control | 5% | Y | Development is tracked with Git and pushed to the remote repository. |

## Gameplay

The current version can test the basic flow:

1. Open the game.
2. Click **START** on the start screen.
3. Click **LEVEL 1** on the level select screen.
4. The game enters `MainGameScene`.
5. Mario spawns from the TMX `start point` object group.
6. The camera follows Mario as he moves through the map.
7. Coins, question blocks, pipe flowers, HUD, and the background can be tested in the level.

## Current Features

- Created `StartScene` as the start screen.
- Created `LevelSelectScene` as the level select screen.
- Created `MainGameScene` as the main game scene.
- `START` switches from `StartScene` to `LevelSelectScene`.
- `LEVEL 1` switches from `LevelSelectScene` to `MainGameScene`.
- Imported TA-provided assets from `audio`, `pictures`, `player`, `enemies`, `tiles`, `fonts`, and `others`.
- Adjusted pixel-art textures and bitmap fonts for clearer display.
- Added a TMX-based first level using `assets/resources/tiles/mario map.tmx`.
- Added generated physics colliders for TMX tile layers.
- Added alpha-based tile collision bounds through `TileCollisionBounds.ts`.
- Added camera follow, map-bound clamping, camera zoom, and vertical dead-zone smoothing through `CameraFollow.ts`.
- Added grouped Mario animation support through `mario_grouped_small`.
- Added Mario idle, walk, forward jump, upward jump, and climb animation switching.
- Added vine climbing through sensor colliders.
- Added Mario spawn from the TMX `start point` object group.
- Added basic Mario movement, jump, walking animation, and collision tuning.
- Added generated coins from the TMX `coins` object group.
- Added coin collection, coin count updates, score updates, and collection effects.
- Added a Mario-style HUD showing world, lives, timer, coin count, and score.
- Added a repeated parallax background using `pictures/map_background`.
- Added question block generation from the TMX `questions` object group.
- Added animated question blocks that become used blocks when hit from below.
- Added question block reward coins that are placed on the nearest valid surface inside map bounds.
- Added pipe flower enemies from the TMX `flowers` object group.
- Added flower emerge / mouth animation / retract behavior with cooldown timing.
- Added flower collision while the flower is active.
- Tuned spike and pipe collision bounds to reduce invisible walls and oversized collision.

## Controls

### Menu

| Action | Control |
|---|---|
| Start game flow | Click `START` |
| Select level 1 | Click `LEVEL 1` |

### Main Game

| Action | Control |
|---|---|
| Move left / right | `A / D` or arrow keys |
| Jump | `Space` or `W` |
| Climb vines | `W / S` or up / down arrow keys while touching vines |

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
    SceneChanger.ts
    PlayerController.ts
    CameraFollow.ts
    ParallaxBackground.ts
    GameHUD.ts
    TileMapCollisionBuilder.ts
    TileCollisionBounds.ts
    CoinSpawner.ts
    CoinCollectible.ts
    QuestionBlockSpawner.ts
    QuestionBlock.ts
    FlowerSpawner.ts
    FlowerEnemy.ts
```

## Scene Overview

| Scene | Purpose | Current Status |
|---|---|---|
| `StartScene` | Game start screen | Complete for the current version |
| `LevelSelectScene` | Level selection screen | Complete for the current version |
| `MainGameScene` | Main gameplay scene | Includes TMX map, tile collision, camera follow, Mario control, HUD, coins, question blocks, parallax background, and pipe flowers |

## Main Scripts

### `SceneChanger.ts`

This script is attached to UI buttons and uses `cc.director.loadScene()` to switch scenes.

| Function | Purpose |
|---|---|
| `goToLevelSelect()` | Called by the `START` button and loads `LevelSelectScene`. |
| `goToMainGame()` | Called by the `LEVEL 1` button and loads `MainGameScene`. |
| `goToStart()` | Reserved for returning to the start screen, such as after game over. |

### `PlayerController.ts`

Controls Mario movement, jump, sprite direction, grouped animation, vine climbing, and TMX start-point spawning.

| Feature | Notes |
|---|---|
| Movement | Supports `A / D` and left / right arrow keys. |
| Jump | Supports `W` and `Space`. |
| Animation | Uses grouped frames from `mario_grouped_small`. |
| Climbing | Uses vine sensor colliders and `W / S` or up / down input. |
| Spawn | Reads the first object in the TMX `start point` object group. |

### `CameraFollow.ts`

Follows Mario on the X and Y axes, clamps the camera inside the TMX map bounds, and uses a Y-axis dead zone so normal jumps do not make the camera shake too much.

| Setting | Notes |
|---|---|
| Target Node Path | `Canvas/World/Player/mario_grouped_small.plist` |
| Map Node Path | `Canvas/World/Map/mario map` |
| View Size | Uses `960 x 640` as the configured view size and `zoomRatio` to control the visible gameplay range. |

### `ParallaxBackground.ts`

Creates the repeated map background and moves it more slowly than the foreground to create depth.

| Setting | Notes |
|---|---|
| Background Sprite Path | `pictures/map_background` |
| Map Node Path | `Canvas/World/Map/mario map` |
| Repeat Horizontally | Enabled so the background can cover the full level width. |

### `GameHUD.ts`

Builds the in-game HUD and listens for coin collection events.

| Display | Notes |
|---|---|
| World | Shows the current world label. |
| Lives | Shows Mario icon, multiplier, and life count. |
| Timer | Counts down during gameplay. |
| Coins | Shows coin icon and collected coin count. |
| Score | Shows the current score. |

### `TileMapCollisionBuilder.ts`

Builds physics colliders from the TMX tile layers at runtime.

| Setting | Notes |
|---|---|
| Solid Layer Names | `*`, meaning all non-ignored tile layers can collide. |
| Ignored Layer Names | `no collide`. |
| Vine Layer Names | `vines`, generated as sensor colliders. |
| Top Only Layers | Disabled for the current map so solid objects cannot be walked through from the side. |

### `TileCollisionBounds.ts`

Stores generated per-tile collision bounds based on the visible alpha pixels of the used tile graphics.

### `CoinSpawner.ts` and `CoinCollectible.ts`

Generate collectable coins from the TMX `coins` object group.

| Feature | Notes |
|---|---|
| Coin animation | Uses `coins/coin_spin`. |
| Collection | Uses a sensor collider and emits `coin-collected`. |
| Effects | Plays the configured collect effect frame from `tiles/effects`. |

### `QuestionBlockSpawner.ts` and `QuestionBlock.ts`

Generate and control question blocks from the TMX `questions` object group.

| Feature | Notes |
|---|---|
| Animation | Uses `question_blocks/question_spin`. |
| Used block | Switches to `question_blocks/question_used` after being hit. |
| Hit detection | Requires Mario to hit from below and be centered enough under the block. |
| Reward coin | Spawns on the nearest valid surface above the block without placing the coin outside the map or inside a solid object. |

### `FlowerSpawner.ts` and `FlowerEnemy.ts`

Generate pipe flower enemies from the TMX `flowers` object group.

| Feature | Notes |
|---|---|
| Sprite source | Uses `enemies/Flower.plist`. |
| Detection | Triggers when Mario is near the flower. |
| Attack cycle | Emerges from the pipe, opens / closes its mouth, retracts, then enters cooldown. |
| Collision | Uses an active enemy collider while the flower is visible. |

## COCO Setup Notes

### `Canvas > World > Map`

| Component | Important Setting |
|---|---|
| `cc.TiledMap` | Use `assets/resources/tiles/mario map.tmx` as the first playable map. |
| `TileMapCollisionBuilder` | Attach to the TMX map node. Set `Solid Layer Names` to `*`, `Ignored Layer Names` to `no collide`, and `Vine Layer Names` to `vines`. Keep `Enable Top Only Layers` disabled for the current map. |
| `CoinSpawner` | Reads the TMX `coins` object group and uses `coins/coin_spin`. |
| `QuestionBlockSpawner` | Reads the TMX `questions` object group and uses the generated `question_blocks` assets. |
| `FlowerSpawner` | Reads the TMX `flowers` object group and uses `enemies/Flower`. |

### `Canvas > Main Camera`

| Component | Important Setting |
|---|---|
| `CameraFollow` | Set Target Node Path to `Canvas/World/Player/mario_grouped_small.plist` and Map Node Path to `Canvas/World/Map/mario map`. |
| `ParallaxBackground` | Set Background Sprite Path to `pictures/map_background`; keep it behind gameplay objects. |

### `Canvas > World > Player`

| Component | Important Setting |
|---|---|
| `PlayerController` | Controls Mario movement, animation, jumping, vine climbing, and TMX start-point spawning. Keep the physics root scale at `1`; if visual scaling is needed later, use a child sprite node instead of scaling the physics node. |

## How to Run Locally

1. Open the project with **Cocos Creator 2.4.8**.
2. Open `assets/scenes/StartScene.fire`.
3. Press Preview / Play.
4. Test the flow:

```text
StartScene -> LevelSelectScene -> MainGameScene
```

## Next Development Steps

1. Add Mario hurt, death, respawn, and game over behavior.
2. Connect flower / enemy collision to Mario death or damage.
3. Add Goomba / Turtle enemy movement and stomp rules.
4. Add mushroom / power-up behavior from question blocks.
5. Add BGM and sound effects such as jump, coin, hit, and stomp.
6. Build the web version and deploy it to Firebase.
