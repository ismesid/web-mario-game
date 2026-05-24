# AI Reference

Web Mario: AI-assisted development record

## 1. AI Tool(s) Used

- **ChatGPT**: Used to analyze assignment requirements, plan the development order, confirm Cocos Creator 2.4.8 scripting patterns, solve UI layout issues, debug gameplay behavior, and draft `README.md` and `AI_reference.md`.

## 2. Scope of Usage / Code Location

| File / Location | AI Assistance | Current Usage |
|---|---|---|
| `assets/scripts/SceneChanger.ts` | Helped write a Cocos Creator 2.4.8-compatible scene switching script. | Used by the `START` and `LEVEL 1` buttons. |
| `assets/scripts/PlayerController.ts` | Helped implement Mario movement, jump, sprite direction, walking animation, and intro lock behavior. | Used by the Player node in `MainGameScene`. |
| `assets/scripts/CameraFollow.ts` | Helped implement X/Y camera follow, map-bound clamping, zoom, and vertical dead-zone smoothing. | Used by `Main Camera` in `MainGameScene`. |
| `assets/scripts/ParallaxBackground.ts` | Helped implement the repeated map background and camera-relative parallax movement. | Used by `Main Camera` in `MainGameScene`. |
| `assets/scripts/GameHUD.ts` | Helped implement the in-game HUD for world, lives, timer, coin count, and score. | Used by the Canvas in `MainGameScene`. |
| `assets/scripts/TileMapCollisionBuilder.ts` | Helped generate physics colliders from TMX tile layers and configure solid, ignored, and vine layers. | Used by the TMX map node in `MainGameScene`. |
| `assets/scripts/TileCollisionBounds.ts` | Helped generate per-tile collision bounds from the visible alpha pixels of used tiles. | Used by `TileMapCollisionBuilder` to avoid oversized tile colliders. |
| `assets/scripts/CoinSpawner.ts` | Helped generate animated coins from TMX objects and support dynamic coin spawning. | Used by the TMX map node in `MainGameScene`. |
| `assets/scripts/CoinCollectible.ts` | Helped handle coin-player contact and coin collection events. | Used by generated coin nodes. |
| `assets/scripts/QuestionBlockSpawner.ts` | Helped generate animated question blocks from TMX objects and place reward coins safely. | Used by the TMX map node in `MainGameScene`. |
| `assets/scripts/QuestionBlock.ts` | Helped detect centered hits from below and trigger question block state changes. | Used by generated question block nodes. |
| `assets/scripts/FlowerSpawner.ts` | Helped generate pipe flower enemies from TMX objects. | Used by the TMX map node in `MainGameScene`. |
| `assets/scripts/FlowerEnemy.ts` | Helped control flower detection, emerge animation, mouth animation, retract timing, cooldown, and collision activation. | Used by generated flower enemy nodes. |
| `assets/scripts/GroundGenerator.ts` | Helped prototype generated ground before the TMX map was added. | Removed after switching to the TMX map workflow. |
| `assets/scripts/LevelIntro.ts` | Helped prototype the reusable level intro overlay and fade-out flow. | Removed after the level intro UI was taken out of the current gameplay scene. |
| `assets/scripts/AnimatedTileBackground.ts` | Helped prototype an animated tiled water intro background. | Removed with the old level intro UI. |
| `assets/scripts/IntroTextGroupSwitcher.ts` | Helped prototype manually arranged intro text groups. | Removed with the old level intro UI. |
| `assets/scenes/StartScene.fire` | Helped plan the start screen UI structure and button setup. | Used as the game start screen. |
| `assets/scenes/LevelSelectScene.fire` | Helped plan the level select UI structure and button setup. | Used as the level selection screen. |
| `assets/scenes/MainGameScene.fire` | Helped debug the main scene hierarchy and runtime setup. | Used as the first gameplay scene. |
| `assets/resources/tiles/mario map.tmx` | Helped inspect TMX layers, object groups, map size, start point, finish point, and Cocos-compatible TMX version. | Used as the first playable map. |
| `assets/resources/player/mario_grouped_small.plist` | Helped connect the grouped Mario atlas to script-driven animations. | Used by `PlayerController` for idle, walk, jump, and climb frames. |
| `assets/resources/coins/coin_spin.png` | Helped create script-driven coin animation and HUD coin icon usage. | Used by `CoinSpawner` and `GameHUD`. |
| `assets/resources/question_blocks/` | Helped split question block and used block images from the tileset. | Used by `QuestionBlockSpawner`. |
| `assets/resources/enemies/Flower.plist` | Helped identify flower frames and connect them to script-driven enemy animation. | Used by `FlowerSpawner` and `FlowerEnemy`. |
| `README.md` | Helped organize current features, gameplay instructions, grading status, and setup notes. | Used as the project README. |
| `AI_reference.md` | Helped organize the AI usage record. | Will be exported as `AI_reference.pdf`. |

## 3. Prompt / Response Evidence

### Record 1: Assignment analysis and development order

**Prompt (translated)**

> First analyze the teacher's grading criteria and the resource files I gave you. Then teach me how to create a Cocos project, how to push it to Git, and how to implement the features one by one. After I finish each step, I will tell you, and then you can tell me the next step.

**AI Response Summary**

ChatGPT helped organize the grading requirements and suggested a step-by-step development plan: create the Cocos project, import assets, create scenes and menu flow, then implement the player, map, enemies, question blocks, UI, sound effects, Git workflow, and Firebase deployment.

**Refinement & Explanation**

Only the first phase was implemented at the beginning: a testable basic flow from `StartScene` to `LevelSelectScene` to `MainGameScene`. This reduced risk by allowing each stage to be verified before adding more gameplay systems.

---

### Record 2: Asset import and asset usage scope

**Prompt (translated)**

> Should I import the two images inside the `others` folder? They look like different types of Mario.

**AI Response Summary**

ChatGPT suggested importing the `others` folder but not using those assets in the first version. Those images may represent other Mario forms, and adding them too early would increase gameplay complexity.

**Refinement & Explanation**

The `others` folder was imported into the project, but the current version only uses menu, title, button, font, player, and tile assets. Other Mario forms may be considered after the basic game is complete.

---

### Record 3: Start screen and level select screen

**Prompt (translated)**

> Done. Teach me the next step.

**AI Response Summary**

ChatGPT guided the creation of `StartScene`, `LevelSelectScene`, and `MainGameScene`, including how to place backgrounds, title images, button sprites, and button hover / pressed states.

**Refinement & Explanation**

The UI layout, size, and display style were manually adjusted in Cocos Creator. TA-provided UI assets were used instead of default Cocos buttons so that the menu style better matched a Mario-style game.

---

### Record 4: Fixing Cocos Creator version-specific script issues

**Prompt (translated)**

> I cannot find where to attach `SceneChanger`, and Cocos is reporting errors.

**AI Response Summary**

The first script version used Cocos Creator 3.x syntax. After checking the error and the project version, ChatGPT corrected the script to use Cocos Creator 2.4.8 syntax: `cc._decorator`, `cc.Component`, and `cc.director.loadScene()`.

**Final Code Used**

```ts
const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneChanger extends cc.Component {
    goToLevelSelect() {
        cc.director.loadScene('LevelSelectScene');
    }

    goToMainGame() {
        cc.director.loadScene('MainGameScene');
    }

    goToStart() {
        cc.director.loadScene('StartScene');
    }
}
```

**Refinement & Explanation**

The incompatible Cocos 3.x import syntax was replaced with Cocos Creator 2.4.8-compatible syntax. The script is attached to a button node and called through the Button component's Click Events.

---

### Record 5: Pixel art and bitmap font display

**Prompt (translated)**

> The images are clear now, but the font is still blurry.

**AI Response Summary**

ChatGPT explained that pixel-art images and bitmap font textures should use the `Point` filter. It also recommended avoiding non-integer label scaling because that can make bitmap fonts look blurry.

**Refinement & Explanation**

Texture filter settings for backgrounds, buttons, titles, and bitmap fonts were adjusted so that the menu screens display more clearly.

---

### Record 6: MainGameScene visibility and player control

**Prompt (translated)**

> Nothing is visible. There is only one fixed Mario. When I press A/D, he raises his hand, but he still does not move, and the screen is black.

**AI Response Summary**

ChatGPT inspected the Cocos Creator project structure and helped debug the `MainGameScene` setup. The work focused on making the scene visible, enabling player physics, using side-facing Mario frames, adding keyboard movement, adding jump input, and building sprite animation from `mario_small.plist`.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/PlayerController.ts` | Added Mario keyboard movement, jump, walking animation, side-facing idle frame, and intro lock behavior. |
| `assets/resources/player/mario_small.plist` | Used as the sprite atlas reference for Mario animation frames. |

**Refinement & Explanation**

Mario's visual scale should be controlled in COCO instead of being hardcoded in script. This makes it easier to compare Mario's size with manually placed map objects.

---

### Record 7: Ground generation

**Prompt (translated)**

> `tiles_272` is the middle ground tile, `tiles_271` is the left edge ground tile, and `tiles_273` is the right edge ground tile. Generate the ground at three times the original image size and use the x/y coordinate of the `tiles_272` tile I placed in COCO as the starting point.

**AI Response Summary**

ChatGPT created a reusable ground generator that reads the manually placed `tiles_272` node as the first ground tile position. It then generates a longer platform using the left, middle, and right tile frames from the `tiles/tiles` atlas.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/GroundGenerator.ts` | Generates first-level ground from `tiles_271.png`, `tiles_272.png`, and `tiles_273.png` at 3x scale. |
| `assets/resources/tiles/tiles.plist` | Used as the tile atlas source. |

**Refinement & Explanation**

The generator is intended to be attached to `Map` or `Ground`, not to the sample `tiles_272` node. The sample tile remains useful as an editor-side position marker and is hidden by the script at runtime.

---

### Record 8: Level intro and loading UI

**Prompt (translated)**

> Mario falls before the ground is generated. Can we add an entering-level screen? I want the level intro background to use `tiles_570` to `tiles_573` as an animation that looks like water flowing down.

**AI Response Summary**

ChatGPT separated the level intro logic from the ground generator so that the same intro behavior can be reused by other levels. The solution stays inside `MainGameScene` and does not require an additional scene. `LevelIntroUI` is used as an overlay while the map and physics setup finish.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/LevelIntro.ts` | Controls intro root display, minimum display time, level-ready waiting, and fade-out. |
| `assets/scripts/AnimatedTileBackground.ts` | Builds a full-screen animated water background using `tiles_570.png` to `tiles_573.png`. |
| `assets/scripts/IntroTextGroupSwitcher.ts` | Switches from an initial text group such as `LEVEL 1` to a ready text group such as `GET` / `READY`. |

**Refinement & Explanation**

The first frame can show a simple `LEVEL 1` text to avoid an empty black frame. After the water animation frames are ready, the intro text switches to a separate ready group. This also avoids relying on unsupported bitmap-font characters such as hyphens or visually unclear spaces.

---

### Record 9: TMX map setup and Cocos compatibility

**Prompt (translated)**

> I redrew the map with 16x16 tiles. Please confirm the map position, camera size, and what I need to set in Cocos Creator.

**AI Response Summary**

ChatGPT helped inspect the TMX map size, layer names, object groups, and Cocos Creator 2.4.8 import issues. The map was confirmed as `240 x 40` tiles, with `16 x 16` tiles, for a total size of `3840 x 640`.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/resources/tiles/mario map.tmx` | Used as the first playable TMX map. The TMX `version` is adjusted back to `1.0` after Tiled saves it as `1.10`, because Cocos Creator 2.4.8 reports the newer version as unsupported. |
| `assets/scenes/MainGameScene.fire` | Updated the map node setup and connected the TMX map to the main gameplay scene. |

**Refinement & Explanation**

The map remains `3840 x 640`, so the current camera view size of `960 x 640` is still appropriate. The TMX `start point` object group is used to place Mario at runtime.

---

### Record 10: Grouped Mario animations and vine climbing

**Prompt (translated)**

> Change Mario's animation to use my latest grouped version. Normal left/right movement should use walk, forward movement with jump should use forward jump, straight up jump should use upward jump, idle should use idle, and vines should switch to climbing.

**AI Response Summary**

ChatGPT helped update `PlayerController` to load the grouped Mario atlas and switch animation frames based on movement, jump state, and climbing state. It also added vine climbing using sensor colliders and prevented held jump input from repeatedly triggering jumps.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/PlayerController.ts` | Added grouped animation frame lists, jump animation locking, vine climbing, TMX start-point spawning, and improved grounded checks. |
| `assets/resources/player/mario_grouped_small.plist` | Used as the sprite atlas for idle, walk, jump, and climb frames. |

**Refinement & Explanation**

The Player physics root should stay at scale `1`. Scaling the same node that owns `RigidBody` and `PhysicsBoxCollider` also scales the collider and can cause unstable collision behavior. If a larger visual Mario is needed later, the visual sprite should be placed under a child node while the physics root remains unscaled.

---

### Record 11: Tile collision generation and collision debugging

**Prompt (translated)**

> Except for `no collide`, the other map layers should have collision. The issue may be that the collision range is too large. Can you read my tile map and write the actual collision range into code?

**AI Response Summary**

ChatGPT inspected the TMX layers and generated collision bounds from the alpha pixels of the tiles actually used by the map. It then added a runtime collision builder that creates physics colliders from TMX tile layers.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/TileCollisionBounds.ts` | Generated per-GID collision bounds from the used tile images. |
| `assets/scripts/TileMapCollisionBuilder.ts` | Generates static colliders for solid tile layers, sensor colliders for vines, ignores `no collide`, and merges continuous colliders to reduce seams. |
| `assets/scenes/MainGameScene.fire` | Connected `TileMapCollisionBuilder` to the TMX map node. |

**Refinement & Explanation**

The current collision rule is: `Solid Layer Names = *`, `Ignored Layer Names = no collide`, `Vine Layer Names = vines`, and `Enable Top Only Layers = false`. Top-only collision was tested but disabled because it allowed Mario to pass through objects from the side.

---

### Record 12: Camera follow

**Prompt (translated)**

> The camera does not move to the right.

**AI Response Summary**

ChatGPT added a camera follow script that tracks Mario and clamps the camera inside the TMX map bounds. Later prompts refined this into X/Y follow with camera zoom, Y-axis dead-zone behavior, and map-bound clamping so the camera does not move outside the top or bottom of the map.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/CameraFollow.ts` | Follows the player on X/Y, applies camera zoom, smooths Y movement, and clamps the camera inside the map bounds. |
| `assets/scenes/MainGameScene.fire` | Attached `CameraFollow` to `Main Camera`. |

**Refinement & Explanation**

The map size is still `3840 x 640`. The camera is configured with a `960 x 640` view reference and `zoomRatio`, then clamped against the effective visible size. The final setup follows horizontally and vertically, but Y movement only reacts after Mario leaves the dead zone, which keeps ordinary jumps from making the camera drift too much.

---

### Record 13: Coin generation and collection

**Prompt (translated)**

> Generate coins according to the coin positions marked in my map. The coins should use the four coin frames and keep spinning. The x position from the map is most important, and the bottom of each coin should align with the plane I marked.

**AI Response Summary**

ChatGPT helped crop the four coin frames, create a reusable coin spinner, read the TMX `coins` object group, and align each generated coin by its bottom edge. It also connected coin collection to a HUD event and a small collection effect.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/CoinSpawner.ts` | Generates animated coins from the TMX `coins` object group and supports dynamic coins spawned by question blocks. |
| `assets/scripts/CoinCollectible.ts` | Detects Mario overlap and notifies the coin spawner when collected. |
| `assets/resources/coins/coin_spin.png` | Stores the four-frame coin spin strip. |

**Refinement & Explanation**

The final placement rule uses the TMX object rectangle bottom edge as the coin bottom edge. This makes map editing predictable: moving the object marker in Tiled directly controls where the coin appears.

---

### Record 14: HUD panel

**Prompt (translated)**

> I want the game screen to look similar to this reference: top-left world name, life count, timer, coin icon and coin count, and score. What do I need to attach in Cocos, and how do I avoid camera changes affecting it?

**AI Response Summary**

ChatGPT helped implement a camera-independent HUD that is placed on the Canvas instead of inside the world map. The HUD displays world, lives, timer, coin count, and score, and listens for `coin-collected` events.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/GameHUD.ts` | Builds the HUD row, aligns icon / label pairs, updates timer, coin count, and score. |
| `assets/scenes/MainGameScene.fire` | Connected the HUD component to the gameplay scene. |

**Refinement & Explanation**

The HUD is kept in screen space so camera movement, camera zoom, and map scrolling do not move or scale it with the world.

---

### Record 15: Parallax background

**Prompt (translated)**

> I want to use `map_background` as the whole map background. It should feel like Mario is running in the foreground and the background is far away. The image size does not match the map. How should we do it?

**AI Response Summary**

ChatGPT helped implement a repeated background system using `pictures/map_background`. The background repeats horizontally and follows the camera with a smaller X movement factor to create depth.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/ParallaxBackground.ts` | Creates repeated background tiles and moves them relative to camera / map bounds. |
| `assets/scenes/MainGameScene.fire` | Connected the parallax background component and tuned scroll factors. |

**Refinement & Explanation**

The final version repeats the image instead of stretching it across the whole map, because stretching made the right side look black or distorted. Horizontal parallax is emphasized more than vertical parallax.

---

### Record 16: Question blocks and reward coin placement

**Prompt (translated)**

> Split the question block and used block images from the tileset, generate question blocks at the `question` positions in the map, and when Mario hits one from below, turn it into the used block. The question block should animate.

**AI Response Summary**

ChatGPT helped create question block resources, generate animated question blocks from the TMX `questions` object group, detect hits from below, and turn the block into a used block. Later prompts refined the reward coin placement so coins do not appear inside solid objects or outside the map.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/resources/question_blocks/question_spin.png` | Four-frame question block animation strip. |
| `assets/resources/question_blocks/question_used.png` | Used block sprite. |
| `assets/scripts/QuestionBlockSpawner.ts` | Generates blocks, loads frames, handles used state, and spawns reward coins. |
| `assets/scripts/QuestionBlock.ts` | Detects centered bottom hits from Mario and triggers the spawner. |

**Refinement & Explanation**

Adjacent question blocks originally triggered together because Mario's collider overlapped both. The hit rule was tightened so Mario's center must be inside the target block's inner hit band. Reward coins are now placed on the nearest valid surface above the block; if a continuous object would place the coin outside the map, that object is skipped.

---

### Record 17: Pipe flower enemies

**Prompt (translated)**

> Add `flowers` enemies. Use the flower image from `enemies`. When the flower detects Mario nearby, it should emerge from the pipe, open and close its mouth twice, then retract into the pipe. After one detection, it should play the full animation and then stop detecting for a short time so the player can pass with timing.

**AI Response Summary**

ChatGPT helped add a pipe flower enemy system that reads the TMX `flowers` object group, loads `enemies/Flower.plist`, and generates flowers at runtime. Each flower has a state machine: hidden, playing, and cooldown. The flower collider is enabled only while the flower is active.

**Final Code / Files Used**

| File | AI-assisted Change |
|---|---|
| `assets/scripts/FlowerSpawner.ts` | Reads the TMX `flowers` object group and creates flower enemy nodes. |
| `assets/scripts/FlowerEnemy.ts` | Controls proximity detection, emerge / mouth / retract animation, cooldown, and active collision. |
| `assets/resources/enemies/Flower.plist` | Provides `flower_0.png` and `flower_1.png` frames. |
| `assets/scripts/TileCollisionBounds.ts` | Tuned pipe collision bounds so nearby pipes do not create invisible floors. |

**Refinement & Explanation**

The flower was first too wide and did not collide with Mario. The visual size and collider were reduced together, and the flower collider was changed from a sensor to a solid kinematic collider while the flower is visible. Pipe collision bounds were also narrowed for the pipe top and body tiles.

## 4. Current AI Usage Summary

AI was mainly used for:

- Understanding the teacher's grading criteria.
- Planning the Cocos project development order.
- Creating the start screen, level select screen, and scene switching flow.
- Fixing Cocos Creator 2.4.8 and 3.x syntax differences.
- Improving pixel-art and bitmap font display.
- Debugging the main gameplay scene.
- Implementing Mario movement and animation.
- Prototyping the first generated ground and level intro flow before the TMX map workflow replaced them.
- Importing and validating a TMX-based playable map.
- Generating tile-based physics colliders and collision bounds.
- Implementing grouped Mario animations and vine climbing.
- Adding X/Y camera follow with zoom, dead-zone smoothing, and map-bound clamping.
- Adding parallax background behavior.
- Adding coin generation, collection effects, and HUD updates.
- Building the in-game HUD.
- Implementing question block animation, hit detection, used-state conversion, and reward coin placement.
- Implementing pipe flower enemy spawning, animation, cooldown, and active collision.
- Tuning pipe and spike collision bounds.
- Drafting and updating project documentation.

## 5. Current COCO Setup Notes

| Node | Component / Setup |
|---|---|
| `Canvas > Main Camera` | Attach `CameraFollow`; set Target Node Path to `Canvas/World/Player/mario_grouped_small.plist`; set Map Node Path to `Canvas/World/Map/mario map`. Attach `ParallaxBackground` and use `pictures/map_background`. |
| `Canvas` | Attach `GameHUD` so the HUD stays in screen space and is not affected by camera movement. |
| `Canvas > World > Map > mario map` | Attach `cc.TiledMap`, `TileMapCollisionBuilder`, `CoinSpawner`, `QuestionBlockSpawner`, and `FlowerSpawner`; set Solid Layer Names to `*`, Ignored Layer Names to `no collide`, Vine Layer Names to `vines`, and keep Enable Top Only Layers disabled. |
| `Canvas > World > Player > mario_grouped_small.plist` | Attach `PlayerController`, `RigidBody`, `PhysicsBoxCollider`, and `Sprite`; keep the physics root scale at `1`. |

## 6. Remaining Work

| Item | Status |
|---|:---:|
| Camera follow | Complete for current map |
| Question block behavior and animation | Basic version complete |
| Enemy behavior | Pipe flower complete; Goomba / Turtle not yet |
| Coin behavior | Basic version complete |
| Flower behavior | Basic version complete |
| Item behavior | Not yet |
| Score, timer, life UI | Basic HUD complete |
| Player damage / death / respawn | Not yet |
| Sound effects and BGM | Not yet |
| Firebase deployment | Not yet |
