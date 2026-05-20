# Web Mario

本專案是使用 **Cocos Creator 2.4.8** 製作的 Mario 風格 2D 平台遊戲。  
目前版本先完成基本遊戲流程：玩家可以從開始畫面進入關卡選擇畫面，再點選 `LEVEL 1` 進入主遊戲場景。後續會再逐步加入地圖、玩家操作、敵人、問號方塊、UI、音效與 Firebase 部署。

## 網站與專案資訊

- Firebase Hosting：尚未部署
- GitHub / GitLab repository：尚未上傳
- Cocos Creator 版本：`2.4.8`

## 評分項目完成狀態

### Complete Game Process

| 項目 | 分數 | 狀態 | 說明 |
|---|---:|:---:|---|
| Start menu | 5% | Y | 已完成開始畫面，包含 Mario 風格背景、標題圖片與 `START` 按鈕。 |
| Level select | 5% | Y | 已完成關卡選擇畫面，包含 `LEVEL SELECT` 標題與 `LEVEL 1` 按鈕。 |
| Game view / game start / game over | 5% | 部分完成 | 已建立 `MainGameScene`，並可從 `LEVEL 1` 進入。實際遊戲內容與 game over 流程尚未完成。 |

### Basic Rules

| 項目 | 分數 | 狀態 | 說明 |
|---|---:|:---:|---|
| World map：物理、重力、碰撞 | 10% | N | 尚未實作。 |
| 背景與相機跟隨玩家 | 10% | N | 尚未實作。 |
| 至少一張 world map | 10% | N | 地圖素材已匯入，但尚未建立正式關卡。 |
| Static wall | 5% | N | 尚未實作。 |
| Question blocks | 5% | N | 問號方塊素材已匯入，但互動邏輯尚未實作。 |
| Player 移動、跳躍、受傷、死亡、重生 | 15% | N | 玩家素材已匯入，但操作與物理邏輯尚未實作。 |
| Enemies 與踩頭擊殺規則 | 15% | N | 敵人素材已匯入，預計先實作 Goomba。 |
| Super mushroom 讓 Mario 變大 | 5% | N | 預計作為第一個 question block 效果。 |

### Animations

| 項目 | 分數 | 狀態 | 說明 |
|---|---:|:---:|---|
| Player walk / jump animations | 5% | N | 玩家 sprite 已匯入，但尚未建立 animation clip。 |
| Enemy animation | 最多 5% | N | 敵人 sprite 已匯入，但尚未建立 animation clip。 |

### Sound Effects

| 項目 | 分數 | 狀態 | 說明 |
|---|---:|:---:|---|
| 至少一個 BGM | 2% | N | 音效素材已匯入，但尚未接到場景中。 |
| Player jump / die sound effects | 3% | N | 音效素材已匯入，但尚未接到玩家行為中。 |
| Additional sound effects | 最多 5% | N | 已匯入 coin、kick、power up、stomp、level clear 等音效。 |
| 音效不能中斷 BGM | 必要條件 | N | 後續會用分開播放 BGM 與 sound effect 的方式處理。 |

### UI

| 項目 | 分數 | 狀態 | 說明 |
|---|---:|:---:|---|
| Player life | 3% | N | 尚未實作。 |
| Player score | 5% | N | 尚未實作。 |
| Timer | 2% | N | 尚未實作。 |

### Appearance / Bonus / Git

| 項目 | 分數 | 狀態 | 說明 |
|---|---:|:---:|---|
| Appearance | 10% | 部分完成 | 開始畫面與關卡選擇畫面已使用 Mario 風格背景、標題、按鈕與 bitmap font。Pixel art 圖片也已調整為較清楚的顯示方式。 |
| Firebase bonus | 5% | N | 尚未部署。 |
| Leaderboard / multiplayer / other bonus | 最多 10% | N | 尚未實作。 |
| Git version control | 5% | N | 將在目前 menu flow 確認完成後進行第一次 commit。 |

## 遊戲玩法

目前版本可以測試基本流程：

1. 開啟遊戲。
2. 在開始畫面點選 **START**。
3. 進入關卡選擇畫面後，點選 **LEVEL 1**。
4. 遊戲會進入 `MainGameScene`。

目前 `MainGameScene` 還是空場景，因此尚未有實際平台跳躍玩法。現在可遊玩的部分是開始畫面與關卡選擇流程。

## 目前已完成的功能

- 建立 `StartScene` 開始畫面。
- 建立 `LevelSelectScene` 關卡選擇畫面。
- 建立 `MainGameScene` 作為主遊戲場景 placeholder。
- `START` 按鈕可以從 `StartScene` 切換到 `LevelSelectScene`。
- `LEVEL 1` 按鈕可以從 `LevelSelectScene` 切換到 `MainGameScene`。
- 使用 TA 提供的背景圖、標題圖、按鈕圖與 bitmap font。
- 調整 pixel art 圖片與字型貼圖，使畫面顯示更清楚。
- 已匯入 TA 提供的 `audio`、`pictures`、`player`、`enemies`、`tiles`、`fonts`、`others` 等素材。

## 操作方式

目前版本：

| 動作 | 操作 |
|---|---|
| 開始遊戲流程 | 點選 `START` |
| 選擇第一關 | 點選 `LEVEL 1` |

預計後續遊戲操作：

| 動作 | 操作 |
|---|---|
| 左右移動 | `A / D` 或方向鍵 |
| 跳躍 | `Space` 或 `W` |

## 專案結構

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
```

## 場景說明

| Scene | 用途 | 目前狀態 |
|---|---|---|
| `StartScene` | 遊戲開始畫面 | 目前版本已完成 |
| `LevelSelectScene` | 關卡選擇畫面 | 目前版本已完成 |
| `MainGameScene` | 主遊戲畫面 | 已建立，尚未實作遊戲內容 |

## 主要程式

### `SceneChanger.ts`

此 script 掛在 UI button 上，用 `cc.director.loadScene()` 切換場景。

| Function | 用途 |
|---|---|
| `goToLevelSelect()` | `START` 按鈕呼叫，切換到 `LevelSelectScene`。 |
| `goToMainGame()` | `LEVEL 1` 按鈕呼叫，切換到 `MainGameScene`。 |
| `goToStart()` | 保留給之後返回首頁或 game over 流程使用。 |

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

## 本機執行方式

1. 使用 **Cocos Creator 2.4.8** 開啟專案。
2. 打開 `assets/scenes/StartScene.fire`。
3. 按下 Preview / Play。
4. 測試流程：

```text
StartScene → LevelSelectScene → MainGameScene
```

## 後續開發計畫

1. 初始化 Git 並完成第一次 commit。
2. 建立主遊戲地圖。
3. 加入 Mario 玩家物理與鍵盤控制。
4. 加入 camera follow。
5. 加入敵人與踩頭擊殺規則。
6. 加入 question block 與 mushroom 變大效果。
7. 加入 life、score、timer UI。
8. 加入 BGM 與 sound effects。
9. Build Web 版本並部署到 Firebase。
