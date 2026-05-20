# AI Reference

Web Mario: AI-assisted development record

## 1. AI Tool(s) Used

- **ChatGPT**: Used to analyze assignment requirements, plan the development order, confirm Cocos Creator 2.4.8 scripting patterns, solve UI layout issues, debug gameplay behavior, and draft `README.md` and `AI_reference.md`.

## 2. Scope of Usage / Code Location

| File / Location | AI Assistance | Current Usage |
|---|---|---|
| `assets/scripts/SceneChanger.ts` | Helped write a Cocos Creator 2.4.8-compatible scene switching script. | Used by the `START` and `LEVEL 1` buttons. |
| `assets/scripts/PlayerController.ts` | Helped implement Mario movement, jump, sprite direction, walking animation, and intro lock behavior. | Used by the Player node in `MainGameScene`. |
| `assets/scripts/GroundGenerator.ts` | Helped generate the first-level ground from tile assets and create a static ground collider. | Used by the Map / Ground node in `MainGameScene`. |
| `assets/scripts/LevelIntro.ts` | Helped implement the reusable level intro overlay and fade-out flow. | Used by the Canvas in `MainGameScene`. |
| `assets/scripts/AnimatedTileBackground.ts` | Helped build an animated tiled water background from `tiles_570` to `tiles_573`. | Used by `LevelIntroUI > WaterBackground`. |
| `assets/scripts/IntroTextGroupSwitcher.ts` | Helped switch between manually arranged intro text groups. | Used by `LevelIntroUI`. |
| `assets/scenes/StartScene.fire` | Helped plan the start screen UI structure and button setup. | Used as the game start screen. |
| `assets/scenes/LevelSelectScene.fire` | Helped plan the level select UI structure and button setup. | Used as the level selection screen. |
| `assets/scenes/MainGameScene.fire` | Helped debug the main scene hierarchy and runtime setup. | Used as the first gameplay scene. |
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

## 4. Current AI Usage Summary

AI was mainly used for:

- Understanding the teacher's grading criteria.
- Planning the Cocos project development order.
- Creating the start screen, level select screen, and scene switching flow.
- Fixing Cocos Creator 2.4.8 and 3.x syntax differences.
- Improving pixel-art and bitmap font display.
- Debugging the main gameplay scene.
- Implementing Mario movement and animation.
- Generating the first-level ground.
- Building the reusable level intro and animated water loading background.
- Drafting and updating project documentation.

## 5. Current COCO Setup Notes

| Node | Component / Setup |
|---|---|
| `Canvas` | Attach `LevelIntro`; assign `Intro Root` to `LevelIntroUI`. |
| `Canvas > LevelIntroUI > WaterBackground` | Attach `AnimatedTileBackground`; set atlas to `tiles/tiles`; set frames to `tiles_570.png,tiles_571.png,tiles_572.png,tiles_573.png`. |
| `Canvas > LevelIntroUI` | Attach `IntroTextGroupSwitcher`; assign `InitialTextGroup` and `ReadyTextGroup`. |
| `Canvas > World > Map` or `Ground` | Attach `GroundGenerator`; keep a manually placed `tiles_272` as the starting position marker. |
| `Canvas > World > Player` | Attach `PlayerController`; adjust visual scale in COCO if needed. |

## 6. Remaining Work

| Item | Status |
|---|:---:|
| Camera follow | Not yet |
| Question block behavior and animation | Not yet |
| Enemy behavior | Not yet |
| Score, timer, life UI | Not yet |
| Sound effects and BGM | Not yet |
| Firebase deployment | Not yet |
