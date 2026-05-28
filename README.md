# Web Mario Game

本專案是一款使用 **Cocos Creator 2.4.8** 製作的 Mario 風格 2D 平台遊戲。

遊戲包含完整可遊玩的流程，從開始選單、登入／註冊、關卡選擇、載入轉場、主要遊戲、過關、遊戲結束、Firebase 歷史紀錄、排行榜，到 Firebase Hosting 部署皆已完成。

## 網站與專案資訊

- Firebase Hosting：[https://web-mario-game.web.app](https://web-mario-game.web.app)
- GitHub repository：[https://github.com/ismesid/web-mario-game](https://github.com/ismesid/web-mario-game)
- Cocos Creator version：`2.4.8`
- Main build target：Web Desktop
- Build output：`build/web-desktop`

## 遊戲流程

```text
開啟遊戲
  -> 可選擇 LOGIN / REGISTER
  -> START
  -> Level Select
  -> 選擇 WORLD1
  -> WORLD1 載入畫面
  -> 遊玩 MainGameScene
  -> 過關或遊戲結束
  -> 回到 Level Select
```

登入彈窗採用同一套帳號流程：輸入已存在的 email 會登入，輸入新的 email 則會註冊新帳號。玩家也可以在關卡選擇畫面按下 `BACK` 登出並回到開始選單。`WORLD1` 載入畫面刻意放在關卡選擇與遊戲進行之間。它會在主遊戲場景載入時顯示黑色畫面、原地奔跑的 Mario，以及黃色字體的 `WORLD1`。此緩衝場景中 BGM 會靜音。

## 評分進度

### 完整遊戲流程

| 項目 | 分數 | 狀態 | 備註 |
|---|---:|:---:|---|
| 開始選單 | 5% | Y | 開始畫面包含標題、開始按鈕、登入按鈕、BGM 與按鈕音效。 |
| 關卡選擇 | 5% | Y | 關卡選擇包含 `WORLD1`、返回按鈕、歷史紀錄、排行榜與設定按鈕。 |
| 遊戲畫面／遊戲開始／遊戲結束 | 5% | Y | 可以進入 `MainGameScene`，並能遊玩、過關、接關或以遊戲結束收尾。 |

### 基本規則

| 項目 | 分數 | 狀態 | 備註 |
|---|---:|:---:|---|
| 世界地圖：物理、重力、碰撞 | 10% | Y | 已實作 TMX 地圖、物理、重力、自動產生的 tile 碰撞器、藤蔓感測器、金幣感測器、敵人碰撞器、危險地形，以及調整過的 tile 邊界。 |
| 背景與攝影機跟隨玩家 | 10% | Y | 攝影機會跟隨 Mario，限制在地圖邊界內，支援 960px 遊戲視窗，並在寬螢幕上使用黑色側邊留白。 |
| 至少一張世界地圖 | 10% | Y | `mario map.tmx` 是可遊玩的第一關。 |
| 靜態牆壁 | 5% | Y | 實心 TMX 圖層會產生靜態物理碰撞器。 |
| 問號方塊 | 5% | Y | 問號方塊會播放動畫、偵測從下方撞擊、變成使用過的方塊、生成獎勵金幣並播放 kick 音效。 |
| 玩家移動、跳躍、受傷、死亡、重生 | 15% | Y | 已實作移動、跳躍、長跳、攀爬、受傷、無敵閃爍、死亡流程、接關與重生。 |
| 敵人與踩踏規則 | 15% | Y | 已實作水管花與 Goomba。Goomba 可以被踩踏，會加分、播放 stomp 音效，並在接關後維持被擊敗狀態。 |
| 超級蘑菇讓 Mario 變大 | 5% | N | 尚未實作蘑菇強化道具。 |

### 動畫

| 項目 | 分數 | 狀態 | 備註 |
|---|---:|:---:|---|
| 玩家走路／跳躍動畫 | 5% | Y | Mario 具有 idle、walk、upward jump、long jump、climb、defeat 與 victory 動畫。長跳在空中的 frame 會維持不變，避免腳在空中持續走路。 |
| 敵人動畫 | Up to 5% | Y | 花會播放張開／閉合／縮回動畫；Goomba 會走路、被壓扁，擊敗後使用天使 frame。 |

### 音效

| 項目 | 分數 | 狀態 | 備註 |
|---|---:|:---:|---|
| 至少一首 BGM | 2% | Y | `bgm_1` 用於遊戲外場景，`bgm_3` 用於 `MainGameScene`。 |
| 玩家跳躍／死亡音效 | 3% | Y | 已接上跳躍與失去一條命的音效。 |
| 額外音效 | Up to 5% | Y | 已接上金幣、攀爬、踩踏、踢擊、確認按鈕、遊戲結束與過關音效。 |
| 音效不得中斷 BGM | Required | Y | BGM 與 SFX 分別透過 `SceneChanger` 與 `GameAudio` 管理。 |

### UI

| 項目 | 分數 | 狀態 | 備註 |
|---|---:|:---:|---|
| 玩家生命 | 3% | Y | HUD 顯示 Mario 圖示與生命數。接關會花費金幣並將生命恢復為 3。 |
| 玩家分數 | 5% | Y | 金幣與擊敗敵人會增加分數。Firebase 會記錄最後分數。 |
| 計時器 | 2% | Y | HUD 計時器會在遊戲中倒數，並在死亡／勝利轉場期間暫停。 |

### 外觀／Bonus／Git

| 項目 | 分數 | 狀態 | 備註 |
|---|---:|:---:|---|
| 外觀 | 10% | Y | 開始畫面、關卡選擇、載入畫面、HUD、彈窗、pixel font、按鈕、地圖、背景、敵人與特效皆已美化。 |
| Firebase bonus | 5% | Y | 已實作 Firebase Auth、Firestore 遊玩紀錄與 Firebase Hosting 部署。 |
| 排行榜／多人／其他 bonus | Up to 10% | Y | 已實作歷史紀錄、最佳排名與前五名排行榜。 |
| Git 版本控制 | 5% | Y | 開發內容已 commit 並 push 到 GitHub。 |

## 功能

- 具有 `START` 與 `LOGIN` 的開始畫面。
- Firebase email/password 登入，若輸入的 email 不存在則自動註冊。
- 登入成功會直接進入關卡選擇。
- 註冊成功會先顯示成功訊息，再進入關卡選擇。
- 關卡選擇包含 `WORLD1`、`BACK`、`HISTORY`、`LEADERBOARD` 與 `SETTING`。
- `BACK` 會登出並回到開始場景。
- 玩家未登入時，`HISTORY` 會被停用。
- 歷史紀錄彈窗顯示最新 3 筆遊玩紀錄，以及玩家最佳完成紀錄。
- 排行榜彈窗顯示前 5 名完成關卡的紀錄。
- 設定彈窗可用 0 到 100 的滑桿調整 BGM 與 SFX 音量。
- 音量值會儲存在本機。
- 初始 BGM 與 SFX 音量設為 50。
- 主遊戲使用 TMX 地圖、自動產生的 tile 碰撞器、金幣、問號方塊、藤蔓、花、Goomba、HUD、攝影機跟隨與視差背景。
- 玩家登入時，遊戲結束與過關紀錄會儲存到 Firestore。

## 操作方式

### 選單

| 動作 | 操作 |
|---|---|
| 開始遊戲流程 | 點擊 `START` |
| 登入／註冊 | 點擊 `LOGIN` |
| 選擇第 1 關 | 點擊 `WORLD1` |
| 返回開始畫面並登出 | 在關卡選擇中點擊 `BACK` |
| 開啟彈窗 | 點擊 `HISTORY`、`LEADERBOARD` 或 `SETTING` |

### 主遊戲

| 動作 | 操作 |
|---|---|
| 左右移動 | `A / D` |
| 跳躍 | `W` |
| 長跳 | 跑向左／右後再跳躍 |
| 攀爬藤蔓 | 接觸藤蔓時按 `W / S` |

## 遊戲系統

### 玩家

- 從 TMX `start point` 物件群組出生。
- 支援左右移動、跳躍、長跳與攀爬藤蔓。
- 使用 `player/mario_grouped_small` 中分組好的 Mario frames。
- 跳躍時播放一次 `jump`。
- 只有在攀爬且上下移動時，才會重複播放 `climb` SFX。
- 會受到敵人與危險地形傷害。
- 受傷後會有短暫無敵閃爍。
- 生命歸 0 時，Mario 會向上飛起，保持在地圖頂端邊界內，並播放失去一條命動畫。
- 在擊敗流程中，背景 BGM 會暫停，遊戲其餘部分也會暫停。
- 失去一條命音效結束後，如果玩家至少有 10 枚金幣，會出現接關提示。
- 接關會花費 10 枚金幣，將生命恢復為 3，保留分數／已收集金幣／已擊敗敵人，並讓 Mario 在地面以 idle 狀態重生。
- 如果玩家無法接關或選擇不接關，遊戲會進入 game-over 黑畫面並回到關卡選擇。
- 勝利時，Mario 會播放兩格 victory 動畫，其餘遊戲內容暫停。

### 地圖與碰撞

- `mario map.tmx` 是第一張可遊玩關卡。
- 除 `no collide` 以外，所有實心 TMX 圖層都會產生物理碰撞器。
- 藤蔓圖層會產生 sensor 碰撞器。
- Tile 碰撞邊界會依照可見像素產生，以減少不可見碰撞。
- 水管、尖刺與花的碰撞範圍經過手動調整。
- 終點偵測根據城堡門 tile 區域，使用門左側附近的窄 trigger，並設定高度限制，避免收集城堡上方金幣時誤觸勝利。

### 金幣與分數

- 金幣由 TMX `coins` 物件群組產生。
- 問號方塊可以生成獎勵金幣。
- 收集金幣會更新金幣數、分數、收集特效與 SFX。
- 金幣 SFX 使用較強的 engine volume，讓聲音保持可聽見。
- 踩踏 Goomba 會增加分數。

### 問號方塊

- 由 TMX `questions` 物件群組產生。
- 使用四格問號方塊動畫。
- 偵測從正下方置中撞擊。
- 被撞擊後會變成使用過的方塊。
- 在最近的有效表面上生成獎勵金幣。
- 觸發獎勵時播放 `kick`。

### 敵人

- 水管花由 TMX `flowers` 物件群組產生。
- 花會偵測附近的 Mario，伸出、播放動畫、縮回，然後進入冷卻。
- 花的 Y 方向碰撞範圍已縮小，以更符合可見 sprite。
- Goomba 會在與 Mario 位於同一平台時追逐 Mario。
- Goomba 失去 Mario 後會回到起始點。
- 踩踏 Goomba 會播放 `stomp`、讓 Mario 向上反彈、增加分數，並在短暫動畫後銷毀 Goomba。

### HUD 與狀態

- HUD 顯示世界、生命、計時器、金幣數與分數。
- HUD 固定在螢幕空間中，不受攝影機移動影響。
- 計時器會在遊戲暫停、死亡流程、接關彈窗與勝利流程期間暫停。
- 遊玩紀錄會在遊戲結束與過關時儲存。

### 音訊

- `bgm_1` 會在非遊戲場景中播放。
- `bgm_3` 會在 `MainGameScene` 中播放。
- 關卡載入緩衝，以及 game-over／level-clear 黑畫面會控制各自的音訊行為。
- 已連接的 SFX：
  - `jump`
  - `coin`
  - `climb`
  - `stomp`
  - `kick`
  - `reserve`
  - `loseOneLife`
  - `Game Over`
  - `levelClear`
- BGM 與 SFX 音量使用 0-100 的 UI 數值。
- `GameAudio` 會將 100 映射為較低的 engine volume，使遊戲不會過大聲。

### Firebase

- Firebase SDK 會在瀏覽器 build 中動態載入。
- Firebase Auth 用於 email/password 登入。
- 如果因使用者不存在而登入失敗，同一個彈窗會註冊新帳號。
- Firestore 將使用者 profile 儲存在 `users/{uid}`。
- Firestore 將遊玩紀錄儲存在 `users/{uid}/runs`。
- 一筆遊玩紀錄包含：
  - `uid`
  - `email`
  - `score`
  - `coins`
  - `playTimeSec`
  - `timeLeft`
  - `world`
  - `cleared`
  - `createdAt`
- 排行榜只使用 `cleared == true` 的紀錄。
- 排行榜排序：
  1. 分數較高者優先。
  2. 遊玩時間較短者優先。
  3. 金幣數較高者優先。
- 玩家顯示名稱使用 email 中 `@` 前的前綴，例如 `test1@gmail.com` 會顯示為 `TEST1`。

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

## 主要腳本

| Script | 用途 |
|---|---|
| `SceneChanger.ts` | 場景切換、BGM 控制、登入彈窗、關卡選擇 UI、歷史紀錄彈窗、排行榜彈窗、設定彈窗、載入畫面與按鈕 SFX。 |
| `FirebaseService.ts` | Firebase SDK 載入、Auth 登入／註冊／登出、Firestore 遊玩紀錄儲存、歷史紀錄查詢、排行榜查詢與最佳排名查詢。 |
| `GameAudio.ts` | 集中式 SFX 載入／播放與 0-100 音量縮放。 |
| `GamePause.ts` | 供死亡、接關與勝利期間遊戲系統共用的暫停旗標。 |
| `PlayerController.ts` | Mario 移動、跳躍、長跳、攀爬、傷害、死亡流程、接關重生、勝利觸發、動畫與 SFX。 |
| `GameHUD.ts` | HUD、計時器、分數、金幣、生命、接關彈窗、game-over 流程、level-clear 流程與 Firebase 遊玩紀錄儲存。 |
| `CameraFollow.ts` | 攝影機跟隨、地圖邊界限制、視窗處理與側邊黑邊支援。 |
| `ParallaxBackground.ts` | 遊戲場景中以攝影機為中心的背景定位。 |
| `TileMapCollisionBuilder.ts` | 執行時產生 TMX tile 碰撞器。 |
| `TileCollisionBounds.ts` | 以像素為基礎的 tile 碰撞邊界。 |
| `CoinSpawner.ts` | TMX 金幣生成、動態獎勵金幣生成、金幣動畫與金幣收集 SFX／特效。 |
| `CoinCollectible.ts` | 金幣與玩家碰撞處理。 |
| `QuestionBlockSpawner.ts` | 執行時建立問號方塊並放置獎勵。 |
| `QuestionBlock.ts` | 從下方撞擊偵測與使用過方塊轉換觸發。 |
| `FlowerSpawner.ts` | 從 TMX 物件執行時建立水管花。 |
| `FlowerEnemy.ts` | 水管花狀態機與碰撞。 |
| `GoombaSpawner.ts` | 執行時建立 Goomba 與平台邊界。 |
| `GoombaEnemy.ts` | Goomba 追逐／返回行為、踩踏偵測、擊敗動畫與分數獎勵。 |

## Cocos 設定備註

### 場景

| Scene | 用途 |
|---|---|
| `StartScene.fire` | 開始選單與登入／註冊彈窗。 |
| `LevelSelectScene.fire` | 關卡選擇、Firebase 歷史紀錄、排行榜、設定面板與登出返回按鈕。 |
| `MainGameScene.fire` | 主要遊戲。 |

### 主遊戲節點

| Node | Component / Setup |
|---|---|
| `Canvas > Main Camera` | 掛上 `CameraFollow` 與 `ParallaxBackground`。 |
| `Canvas` | 掛上 `GameHUD`。 |
| `Canvas > World > Map > mario map` | 掛上 `cc.TiledMap`、`TileMapCollisionBuilder`、`CoinSpawner`、`QuestionBlockSpawner`、`FlowerSpawner` 與 `GoombaSpawner`。 |
| `Canvas > World > Player > mario_grouped_small.plist` | 掛上 `PlayerController`、`RigidBody`、`PhysicsBoxCollider` 與 `Sprite`。物理縮放維持 `1`。 |

### Build 備註

當 build path 含有空白時，Cocos Creator 會回報 build 錯誤。因為原始資料夾路徑包含 `SW Studio Lab`，所以 build/deploy 使用無空白路徑的副本：

```text
C:\Users\User\Desktop\web_mario_game
```

一般開發 repository 仍維持在：

```text
C:\Users\User\Desktop\SW Studio Lab\web_mario_game
```

建議的 Cocos build 設定：

- Platform：`Web Desktop`
- Build path：`./build`
- Initial scene：`db://assets/scenes/StartScene.fire`
- Build scenes：`StartScene`、`LevelSelectScene`、`MainGameScene`
- Inline all SpriteFrame：enabled
- Debug mode：disabled for deployment

## 如何在本機執行

1. 使用 **Cocos Creator 2.4.8** 開啟專案。
2. 開啟 `assets/scenes/StartScene.fire`。
3. 按下 Preview / Play。
4. 測試流程：

```text
StartScene -> LevelSelectScene -> WORLD1 loading screen -> MainGameScene
```

## 如何 Build 與 Deploy

1. 如有需要，在 Cocos Creator 中開啟無空白路徑的專案副本。
2. 開啟 **Project > Build...**。
3. 選擇 **Web Desktop**。
4. 將 build path 設為 `./build`。
5. 確認三個場景都有被包含。
6. 點擊 **Build**。
7. 將產生出的 web build 部署到 Firebase Hosting。

`.firebase/` 資料夾與 `settings/builder.json` 會被 Git 忽略，因為它們是本機 build/deploy 產物。

## 開發過程中也完成的工作

即使後來被最終版本取代，有些工作仍曾在開發過程中實作或測試過：

- 匯入並整理 TA 提供的 assets，包括 `audio`、`pictures`、`player`、`enemies`、`tiles`、`fonts` 與 `others`。
- 將 Cocos Creator 3.x 風格的腳本範例修正為相容 Cocos Creator 2.4.8 的 TypeScript。
- 多次調整 pixel-art texture filtering 與 bitmap font 設定，以避免文字模糊或被裁切。
- 在專案完全改用 TMX 地圖流程之前，先使用 `tiles_271`、`tiles_272` 與 `tiles_273` 建立早期自動生成地面原型。
- 使用 `tiles_570` 到 `tiles_573` 建立早期具有水流感動畫 tile 的關卡介紹原型。
- 以最終黑色 `WORLD1` 載入畫面取代舊 intro 原型後，移除舊的 intro prototype。
- 測試 top-only tile collision，後來因為會讓玩家從側邊進入實心方塊而停用。
- Tiled 儲存較新的地圖版本導致 Cocos Creator 2.4.8 無法正確讀取後，檢查並調整 TMX 檔案。
- Debug 多個只在部署後出現的 viewport 問題，包括地圖起點／終點出現多餘背景條。
- 多次調整彈窗 UI label 範圍、按鈕 label 範圍、按鈕縮放、顏色與輸入欄位行為。
- 在 commits 前檢查 Git status，並忽略本機 build/deploy 產物。

## 剩餘工作

| 項目 | 狀態 |
|---|:---:|
| 蘑菇強化道具 | Not implemented |
| 額外關卡 | Not implemented |
| 手機觸控操作 | Not implemented |
| 更多敵人種類，例如烏龜 | Not implemented |
| 最終平衡與遊玩測試打磨 | Ongoing |
