# Web Mario

This project is a Mario-style 2D platformer built with **Cocos Creator 2.4.8**.

The current version already includes the basic game flow: the player can enter the start menu, move to the level select screen, and click `LEVEL 1` to enter the main game scene. The first playable scene now uses a TMX tile map, generated tile collision, camera follow, Mario movement, jump control, grouped Mario animations, and vine climbing. More gameplay systems such as enemies, question blocks, UI, sound effects, and Firebase deployment will be added later.

## Website and Project Information

- Firebase Hosting: not deployed yet
- GitHub / GitLab repository: not uploaded yet
- Cocos Creator version: `2.4.8`

## Grading Progress

### Complete Game Process

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Start menu | 5% | Y | The start screen is complete, including a Mario-style background, title image, and `START` button. |
| Level select | 5% | Y | The level select screen is complete, including the `LEVEL SELECT` title and `LEVEL 1` button. |
| Game view / game start / game over | 5% | Partial | `MainGameScene` is created and can be entered from `LEVEL 1`. The TMX map, player control, camera follow, and tile collision are implemented, but game over is not finished yet. |

### Basic Rules

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| World map: physics, gravity, collision | 10% | Partial | Physics, gravity, TMX map collision, vine sensors, and tile-based collision generation are implemented. Some gameplay objects still need behavior. |
| Background and camera follow player | 10% | Y | `CameraFollow` follows Mario horizontally and clamps the view inside the map bounds. |
| At least one world map | 10% | Y | `mario map.tmx` is used as the first playable map. |
| Static wall | 5% | Partial | Solid tile layers generate static colliders. Collision tuning is still being tested. |
| Question blocks | 5% | N | Question block assets are available, but interaction logic is not implemented yet. |
| Player movement, jump, hurt, death, respawn | 15% | Partial | Movement, jump, grouped animations, and vine climbing are implemented. Hurt, death, and respawn are not implemented yet. |
| Enemies and stomp rules | 15% | N | Enemy assets are imported. Goomba is planned as the first enemy. |
| Super mushroom makes Mario bigger | 5% | N | Planned as the first question block reward. |

### Animations

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Player walk / jump animations | 5% | Partial | Mario idle, walk, forward jump, upward jump, and climb animations are implemented through `mario_grouped_small`. |
| Enemy animation | Up to 5% | N | Enemy sprites are imported, but animation clips are not created yet. |

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
| Player life | 3% | N | Not implemented yet. |
| Player score | 5% | N | Not implemented yet. |
| Timer | 2% | N | Not implemented yet. |

### Appearance / Bonus / Git

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Appearance | 10% | Partial | The start screen, level select screen, TMX map, Mario sprites, and pixel-art rendering settings are in place. Some gameplay objects still need polish. |
| Firebase bonus | 5% | N | Not deployed yet. |
| Leaderboard / multiplayer / other bonus | Up to 10% | N | Not implemented yet. |
| Git version control | 5% | N | The first commit will be created after the current stable version is confirmed. |

## Gameplay

The current version can test the basic flow:

1. Open the game.
2. Click **START** on the start screen.
3. Click **LEVEL 1** on the level select screen.
4. The game enters `MainGameScene`.
5. Mario spawns from the TMX `start point` object group.
6. The camera follows Mario as he moves through the map.

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
- Added horizontal camera follow through `CameraFollow.ts`.
- Added grouped Mario animation support through `mario_grouped_small`.
- Added Mario idle, walk, forward jump, upward jump, and climb animation switching.
- Added vine climbing through sensor colliders.
- Added Mario spawn from the TMX `start point` object group.
- Added basic Mario movement, jump, walking animation, and collision tuning.

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
    TileMapCollisionBuilder.ts
    TileCollisionBounds.ts
```

## Scene Overview

| Scene | Purpose | Current Status |
|---|---|---|
| `StartScene` | Game start screen | Complete for the current version |
| `LevelSelectScene` | Level selection screen | Complete for the current version |
| `MainGameScene` | Main gameplay scene | Includes TMX map, tile collision, camera follow, and Mario control |

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

Follows Mario horizontally and clamps the camera inside the TMX map bounds.

| Setting | Notes |
|---|---|
| Target Node Path | `Canvas/World/Player/mario_grouped_small.plist` |
| Map Node Path | `Canvas/World/Map/mario map` |
| View Size | Uses `960 x 640` for the current game view. |

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

## COCO Setup Notes

### `Canvas > World > Map`

| Component | Important Setting |
|---|---|
| `cc.TiledMap` | Use `assets/resources/tiles/mario map.tmx` as the first playable map. |
| `TileMapCollisionBuilder` | Attach to the TMX map node. Set `Solid Layer Names` to `*`, `Ignored Layer Names` to `no collide`, and `Vine Layer Names` to `vines`. Keep `Enable Top Only Layers` disabled for the current map. |

### `Canvas > Main Camera`

| Component | Important Setting |
|---|---|
| `CameraFollow` | Set Target Node Path to `Canvas/World/Player/mario_grouped_small.plist` and Map Node Path to `Canvas/World/Map/mario map`. |

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

1. Implement question block animation and hit behavior from the TMX `questions` object group.
2. Add enemy behavior from the TMX enemy object groups.
3. Add coin collection and flower / item behavior from the TMX object groups.
4. Add score, timer, and life UI.
5. Add BGM and sound effects such as jump, coin, and stomp.
6. Build the web version and deploy it to Firebase.
