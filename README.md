# Web Mario

This project is a Mario-style 2D platformer built with **Cocos Creator 2.4.8**.

The current version already includes the basic game flow: the player can enter the start menu, move to the level select screen, and click `LEVEL 1` to enter the main game scene. The first playable scene now includes a level intro overlay, generated ground, basic Mario movement, jump control, and walking animation. More gameplay systems such as camera follow, enemies, question blocks, UI, sound effects, and Firebase deployment will be added later.

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
| Game view / game start / game over | 5% | Partial | `MainGameScene` is created and can be entered from `LEVEL 1`. The level intro, ground, and player control are implemented, but game over is not finished yet. |

### Basic Rules

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| World map: physics, gravity, collision | 10% | Partial | Basic physics, gravity, generated ground, and ground collision are implemented. More map objects are still needed. |
| Background and camera follow player | 10% | N | Camera follow is not implemented yet. |
| At least one world map | 10% | Partial | A generated first-level ground exists. Decorative map objects still need to be placed. |
| Static wall | 5% | N | Not implemented yet. |
| Question blocks | 5% | N | Question block assets are available, but interaction logic is not implemented yet. |
| Player movement, jump, hurt, death, respawn | 15% | Partial | Movement, jump, and walking animation are implemented. Hurt, death, and respawn are not implemented yet. |
| Enemies and stomp rules | 15% | N | Enemy assets are imported. Goomba is planned as the first enemy. |
| Super mushroom makes Mario bigger | 5% | N | Planned as the first question block reward. |

### Animations

| Item | Points | Status | Notes |
|---|---:|:---:|---|
| Player walk / jump animations | 5% | Partial | Mario walking animation is implemented through script using frames from `mario_small.plist`. Jump animation is basic and can still be improved. |
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
| Appearance | 10% | Partial | The start screen, level select screen, and level intro use Mario-style assets, bitmap fonts, and pixel-art rendering settings. The in-game map still needs more decoration. |
| Firebase bonus | 5% | N | Not deployed yet. |
| Leaderboard / multiplayer / other bonus | Up to 10% | N | Not implemented yet. |
| Git version control | 5% | N | The first commit will be created after the current stable version is confirmed. |

## Gameplay

The current version can test the basic flow:

1. Open the game.
2. Click **START** on the start screen.
3. Click **LEVEL 1** on the level select screen.
4. The game enters `MainGameScene`.
5. The level intro appears first.
6. After the generated ground is ready, the intro fades out and Mario becomes controllable.

## Current Features

- Created `StartScene` as the start screen.
- Created `LevelSelectScene` as the level select screen.
- Created `MainGameScene` as the main game scene.
- `START` switches from `StartScene` to `LevelSelectScene`.
- `LEVEL 1` switches from `LevelSelectScene` to `MainGameScene`.
- Imported TA-provided assets from `audio`, `pictures`, `player`, `enemies`, `tiles`, `fonts`, and `others`.
- Adjusted pixel-art textures and bitmap fonts for clearer display.
- Added a reusable level intro overlay inside `MainGameScene`.
- Added animated water loading background using `tiles_570.png` to `tiles_573.png`.
- Added intro text switching from `LEVEL 1` to `GET` / `READY`.
- Added generated first-level ground using `tiles_271.png`, `tiles_272.png`, and `tiles_273.png`.
- Added basic Mario movement, jump, walking animation, and intro lock behavior.

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
    GroundGenerator.ts
    LevelIntro.ts
    AnimatedTileBackground.ts
    IntroTextGroupSwitcher.ts
```

## Scene Overview

| Scene | Purpose | Current Status |
|---|---|---|
| `StartScene` | Game start screen | Complete for the current version |
| `LevelSelectScene` | Level selection screen | Complete for the current version |
| `MainGameScene` | Main gameplay scene | Includes level intro, generated ground, and basic Mario control |

## Main Scripts

### `SceneChanger.ts`

This script is attached to UI buttons and uses `cc.director.loadScene()` to switch scenes.

| Function | Purpose |
|---|---|
| `goToLevelSelect()` | Called by the `START` button and loads `LevelSelectScene`. |
| `goToMainGame()` | Called by the `LEVEL 1` button and loads `MainGameScene`. |
| `goToStart()` | Reserved for returning to the start screen, such as after game over. |

### `PlayerController.ts`

Controls Mario movement, jump, sprite direction, walking animation, and level intro locking.

| Feature | Notes |
|---|---|
| Movement | Supports `A / D` and left / right arrow keys. |
| Jump | Supports `W` and `Space`. |
| Animation | Uses side-facing frames from `mario_small.plist`. |
| Intro lock | Mario is hidden and physics is paused until the level is ready. |

### `GroundGenerator.ts`

Generates the first-level ground based on the position of the sample `tiles_272` node placed in COCO.

| Setting | Notes |
|---|---|
| Left edge tile | `tiles_271.png` |
| Middle tile | `tiles_272.png` |
| Right edge tile | `tiles_273.png` |
| Tile scale | `3` |
| Collider | Creates a long static ground collider. |

### `LevelIntro.ts`

Controls the full-screen intro overlay.

| Feature | Notes |
|---|---|
| Intro root | Uses `LevelIntroUI`. |
| Minimum display time | Keeps the intro visible long enough to be readable. |
| Fade out | Fades out after the level emits `level-ready`. |

### `AnimatedTileBackground.ts`

Builds a tiled animated background for the level intro.

| Setting | Notes |
|---|---|
| Atlas path | `tiles/tiles` |
| Frames | `tiles_570.png`, `tiles_571.png`, `tiles_572.png`, `tiles_573.png` |
| Layering | Keeps the water background below intro text. |

### `IntroTextGroupSwitcher.ts`

Switches between two manually arranged text groups in COCO.

| Group | Purpose |
|---|---|
| `InitialTextGroup` | Displays the first-frame text, such as `LEVEL 1`. |
| `ReadyTextGroup` | Displays the water-loading text, such as separate `GET` and `READY` labels. |

## COCO Setup Notes

### `Canvas`

| Component | Important Setting |
|---|---|
| `LevelIntro` | Assign `Intro Root` to `LevelIntroUI`. `Min Display Time` controls how long the loading screen stays visible. |

### `Canvas > LevelIntroUI`

| Node / Component | Important Setting |
|---|---|
| `WaterBackground` | Attach `AnimatedTileBackground`. Set Atlas Path to `tiles/tiles`. Set Frame Names to `tiles_570.png,tiles_571.png,tiles_572.png,tiles_573.png`. |
| `InitialTextGroup` | Place the first-frame text here, such as `LEVEL 1`. |
| `ReadyTextGroup` | Place the water-loading text here. Use separate labels for `GET` and `READY` so spacing can be adjusted visually. |
| `IntroTextGroupSwitcher` | Attach to `LevelIntroUI`. Assign `Initial Group` and `Ready Group`. |

### `Canvas > World > Map`

| Component | Important Setting |
|---|---|
| `GroundGenerator` | Attach to `Map` or `Ground`, not to the sample `tiles_272` node. The script uses the sample `tiles_272` position as the ground starting point. |

### `Canvas > World > Player`

| Component | Important Setting |
|---|---|
| `PlayerController` | Controls Mario movement and animation. If Mario size needs to change, adjust the Player node scale directly in COCO instead of hardcoding it in script. |

## How to Run Locally

1. Open the project with **Cocos Creator 2.4.8**.
2. Open `assets/scenes/StartScene.fire`.
3. Press Preview / Play.
4. Test the flow:

```text
StartScene -> LevelSelectScene -> MainGameScene
```

## Next Development Steps

1. Add camera follow so the view follows Mario to the right.
2. Manually place question blocks, pipes, bushes, clouds, and other decorative or interactive map objects in COCO.
3. Implement question block animation and hit behavior.
4. Add enemies, coins, score, timer, and life UI.
5. Add BGM and sound effects such as jump, coin, and stomp.
6. Build the web version and deploy it to Firebase.
