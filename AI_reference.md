# AI Reference

Web Mario Game：AI 輔助開發紀錄

## 1. 使用的 AI 工具

- **ChatGPT / Codex**：用於分析作業需求、規劃實作順序、撰寫與修改 Cocos Creator 2.4.8 腳本、除錯執行時行為、改善 UI 版面、調整音訊、連接 Firebase、引導 build/deploy 步驟，以及更新文件。

## 2. 使用範圍／程式碼位置

| 檔案／位置 | AI 協助內容 | 目前使用狀態 |
|---|---|---|
| `assets/scripts/SceneChanger.ts` | 場景切換、BGM 路由、登入／註冊彈窗、關卡選擇按鈕、歷史紀錄／排行榜／設定彈窗、載入轉場與 UI SFX。 | 用於開始場景與關卡選擇場景。 |
| `assets/scripts/FirebaseService.ts` | Firebase SDK 載入、Auth 登入／註冊／登出、Firestore 遊玩紀錄、歷史紀錄、排行榜與最佳排名。 | 用於登入 UI、HUD、歷史紀錄彈窗與排行榜彈窗。 |
| `assets/scripts/GameAudio.ts` | 集中式 SFX 載入／播放、音效長度查詢、0-100 音量轉換與 SFX 主音量。 | 用於玩家、金幣、敵人、問號方塊與 UI。 |
| `assets/scripts/GamePause.ts` | 遊戲系統共用的暫停狀態。 | 用於死亡、接關與勝利流程。 |
| `assets/scripts/PlayerController.ts` | Mario 移動、跳躍、長跳、攀爬、受傷、無敵、死亡、接關重生、勝利觸發、動畫與 SFX。 | 用於 Mario 玩家節點。 |
| `assets/scripts/GameHUD.ts` | HUD、計時器、分數／生命／金幣更新、接關彈窗、game-over 流程、level-clear 流程與 Firebase 遊玩紀錄儲存。 | 用於 `MainGameScene`。 |
| `assets/scripts/CameraFollow.ts` | X/Y 跟隨、攝影機限制、縮放、Y dead zone、viewport 寬度處理與黑色側邊留白。 | 用於遊戲中的 `Main Camera`。 |
| `assets/scripts/ParallaxBackground.ts` | 遊戲背景定位與相對攝影機移動。 | 用於遊戲中的 `Main Camera`。 |
| `assets/scripts/TileMapCollisionBuilder.ts` | 執行時產生 TMX tile 碰撞與藤蔓 sensor。 | 用於 TMX 地圖節點。 |
| `assets/scripts/TileCollisionBounds.ts` | 以像素為基礎的 tile 碰撞邊界與手動碰撞調整。 | 用於 tile 碰撞器生成。 |
| `assets/scripts/CoinSpawner.ts` | TMX 金幣生成、動態問號方塊金幣生成、金幣動畫、收集特效與金幣 SFX。 | 用於 TMX 地圖節點。 |
| `assets/scripts/CoinCollectible.ts` | 金幣與玩家接觸處理。 | 用於產生出的金幣節點。 |
| `assets/scripts/QuestionBlockSpawner.ts` | 執行時產生問號方塊、使用狀態處理與獎勵金幣放置。 | 用於 TMX 地圖節點。 |
| `assets/scripts/QuestionBlock.ts` | 從下方撞擊偵測與問號方塊觸發邏輯。 | 用於產生出的問號方塊節點。 |
| `assets/scripts/FlowerSpawner.ts` | 依照 TMX 物件執行時產生水管花。 | 用於 TMX 地圖節點。 |
| `assets/scripts/FlowerEnemy.ts` | 花的偵測、伸出／縮回動畫、嘴巴動畫、冷卻與碰撞。 | 用於產生出的花節點。 |
| `assets/scripts/GoombaSpawner.ts` | 執行時產生 Goomba、表面偵測與平台邊界。 | 用於 TMX 地圖節點。 |
| `assets/scripts/GoombaEnemy.ts` | Goomba 追逐、失去玩家後返回、踩踏偵測、分數獎勵、stomp SFX 與擊敗動畫。 | 用於產生出的 Goomba 節點。 |
| `assets/scripts/GroundGenerator.ts` | 使用指定地面 tile 的早期自動生成地面原型。 | 開發期間曾實作，切換為 TMX 地圖流程後已移除。 |
| `assets/scripts/LevelIntro.ts` | 早期可重複使用的關卡介紹 overlay。 | 開發期間曾實作，之後由最終 `WORLD1` 載入畫面取代。 |
| `assets/scripts/AnimatedTileBackground.ts` | 早期水流風格 intro 動畫背景。 | 開發期間曾實作，之後與舊 intro UI 一併移除。 |
| `assets/scripts/IntroTextGroupSwitcher.ts` | 早期 intro 文字切換輔助工具。 | 開發期間曾實作，之後與舊 intro UI 一併移除。 |
| `assets/scenes/StartScene.fire` | 開始 UI、登入按鈕、登入彈窗版面與按鈕／字型調整。 | 作為第一個場景使用。 |
| `assets/scenes/LevelSelectScene.fire` | 關卡選擇 UI、back button 位置、側邊選單按鈕與彈窗顏色／版面。 | 作為關卡選擇場景使用。 |
| `assets/scenes/MainGameScene.fire` | 遊戲階層、HUD、攝影機、地圖、玩家、spawner 與背景。 | 作為第一個可遊玩關卡使用。 |
| `assets/resources/tiles/mario map.tmx` | 地圖檢查、圖層／物件群組使用、起點／終點／金幣／問號方塊／花／Goomba 設定。 | 作為第一張可遊玩地圖使用。 |
| `assets/resources/player/mario_grouped_small.plist` | 分組後的 Mario 動畫 frame 對應。 | 用於 idle、walk、jump、climb、defeat 與 victory frames。 |
| `assets/resources/audio/` | BGM 與 SFX 路由及音量調整。 | 用於 BGM、jump、coin、climb、stomp、kick、reserve、lose-one-life、game over 與 level clear。 |
| `assets/resources/pictures/` | 按鈕素材、背景圖片與 UI 風格。 | 用於選單畫面、彈窗與背景。 |
| `README.md` | 功能／狀態文件。 | 已更新以符合目前實作。 |
| `AI_reference.md` | AI 使用文件。 | 已更新以包含所有 AI 輔助工作。 |

## 3. Prompt / Response 證據

### Record 1：作業分析與開發順序

**Prompt（翻譯）**

> 先分析老師的評分標準和資源檔。然後教我如何建立 Cocos 專案、push 到 Git，並一步一步實作功能。

**AI 回應摘要**

AI 將評分標準整理成場景、地圖／物理、玩家、敵人、問號方塊、UI、音訊、Firebase、Git 與部署等項目。工作被拆成小型、可測試的階段。

**最終結果**

目前專案具有完整流程：開始畫面、登入／註冊、關卡選擇、遊戲進行、勝利／遊戲結束、Firebase 紀錄、排行榜與部署。

---

### Record 2：Cocos Creator 版本相容性

**Prompt（翻譯）**

> 我無法掛上 script，Cocos 也顯示錯誤。

**AI 回應摘要**

一開始的 script 寫法從 Cocos Creator 3.x import 風格，調整為 Cocos Creator 2.4.8 語法，使用 `cc._decorator`、`cc.Component` 與 `cc.director.loadScene()`。

**最終結果**

所有專案腳本皆使用相容 Cocos Creator 2.4.8 的 TypeScript 寫法。

---

### Record 3：開始畫面與關卡選擇場景

**Prompt（翻譯）**

> 建立專案後，教我下一步。

**AI 回應摘要**

AI 引導建立 `StartScene`、`LevelSelectScene` 與 `MainGameScene`，包含按鈕設定、Cocos click events 與場景切換。

**最終結果**

`StartScene` 包含 `START` 與 `LOGIN`。`LevelSelectScene` 包含 `WORLD1`、`BACK`、`HISTORY`、`LEADERBOARD` 與 `SETTING`。

---

### Record 4：Pixel-art 顯示與 bitmap font 調整

**Prompt（翻譯）**

> 圖片很清楚，但字體還是模糊。

**AI 回應摘要**

AI 解釋 pixel art 與 bitmap font texture 應該使用 point filtering，而且非整數縮放會讓文字模糊。

**最終結果**

Pixel-art textures、button sprites 與 bitmap fonts 經過多次調整。當 bitmap font 沒有空白字元時，部分 UI labels 被拆成多個 labels。

---

### Record 5：TMX 地圖設定

**Prompt（翻譯）**

> 我用 16x16 tiles 重畫了地圖。請確認地圖位置、camera size，以及我在 Cocos 需要設定什麼。

**AI 回應摘要**

AI 檢查 TMX 地圖大小、圖層名稱、物件群組與 Cocos 2.4.8 的 TMX 相容性。確認地圖為 `240 x 40` tiles，每個 tile 為 `16 x 16`。

**最終結果**

`assets/resources/tiles/mario map.tmx` 是可遊玩地圖。它包含起點、金幣、問號方塊、花、Goomba 與城堡／終點區域資料。

---

### Record 6：執行時 tile 碰撞

**Prompt（翻譯）**

> 除了 `no collide` 以外，其他地圖圖層都應該有碰撞。碰撞範圍可能太大。你可以讀我的 tile map，並把實際碰撞範圍寫進程式碼嗎？

**AI 回應摘要**

AI 協助從可見像素產生每個 tile 的碰撞邊界，並加入執行時 TMX tile layer collision builder。

**最終檔案**

| 檔案 | 變更 |
|---|---|
| `TileCollisionBounds.ts` | 儲存 tile-specific collision bounds 與手動調整。 |
| `TileMapCollisionBuilder.ts` | 從 TMX layers 建立 solid colliders 與 vine sensor colliders。 |

**最終結果**

實心 tiles、藤蔓、水管、尖刺與平台邊緣都有可用的物理效果。水管與花的碰撞邊界後續也根據遊戲截圖手動調整。

---

### Record 7：Mario 移動、跳躍、長跳與攀爬

**Prompt（翻譯）**

> 使用我分組好的 Mario 動畫。普通移動用 walk，往前跳用 forward jump，直上跳用 upward jump，idle 用 idle，藤蔓用 climbing。

**AI 回應摘要**

AI 更新 `PlayerController`，讓它載入分組 frames，並根據移動、跳躍、長跳狀態與攀爬狀態切換動畫。

**最終結果**

Mario 支援：

- Idle
- Walking
- Upward jump
- Long jump
- Long-jump air frame hold，讓腳不會在空中持續移動
- Vine climbing
- Defeat animation
- Victory animation

---

### Record 8：攝影機跟隨與寬螢幕行為

**Prompt（翻譯）**

> 攝影機不會往右移。之後部署後，為什麼左邊會多顯示一塊？

**AI 回應摘要**

AI 加入攝影機跟隨與地圖邊界限制，之後又協助 debug 只在部署後出現的寬螢幕問題。解法是加入 viewport handling 與黑色側邊留白，讓遊戲畫面像關卡選擇一樣運作，不會露出背景／地圖邊緣。

**最終檔案**

| 檔案 | 變更 |
|---|---|
| `CameraFollow.ts` | Follow、clamp、zoom、dead zone、design-width viewport 與 side letterbox。 |
| `GameHUD.ts` | HUD layout 跟隨有效遊戲 viewport。 |
| `ParallaxBackground.ts` | 背景置中到攝影機視圖。 |

**最終結果**

遊戲現在使用 960px 參考視圖，在較寬螢幕上會出現側邊黑邊，與關卡選擇風格一致。

---

### Record 9：視差與背景定位

**Prompt（翻譯）**

> 我想讓 `map_background` 成為整張地圖背景。它應該感覺在遠方，像 Mario 在前景奔跑。

**AI 回應摘要**

AI 協助實作相對攝影機移動的背景，之後又調整以避免部署時出現邊緣瑕疵。

**最終結果**

主遊戲背景會保持在地圖後方視覺層，且不再於地圖起點／終點露出不想要的背景邊緣條。

---

### Record 10：金幣與 HUD

**Prompt（翻譯）**

> 依照地圖標記的位置產生金幣。金幣應該要旋轉並更新 HUD。

**AI 回應摘要**

AI 協助實作由 TMX 物件產生金幣、金幣動畫、收集邏輯、收集特效、SFX 與 HUD 更新事件。

**最終檔案**

| 檔案 | 變更 |
|---|---|
| `CoinSpawner.ts` | 產生靜態與動態金幣、播放動畫、播放金幣 SFX。 |
| `CoinCollectible.ts` | 處理玩家接觸。 |
| `GameHUD.ts` | 更新金幣數與分數。 |

**最終結果**

金幣會同時更新金幣數與分數。因為金幣聲比其他 SFX 更不容易聽見，所以金幣音效另外調整過。

---

### Record 11：問號方塊

**Prompt（翻譯）**

> 從地圖產生問號方塊。當 Mario 從下方撞擊時，讓它們變成使用過的方塊並生成獎勵。

**AI 回應摘要**

AI 協助切分問號方塊圖片、由 TMX 物件產生方塊、偵測從下方撞擊、防止相鄰方塊一起被觸發，並安全放置獎勵金幣。

**最終結果**

問號方塊會播放動畫、變成使用過的方塊、生成金幣，並在觸發獎勵時播放 `kick`。

---

### Record 12：花敵人

**Prompt（翻譯）**

> 加入花敵人。當 Mario 在附近時，它們應該伸出、播放動畫、縮回，然後冷卻。

**AI 回應摘要**

AI 建立花敵人的 state machine，並將它連接到 TMX 物件生成。

**最終結果**

水管花會偵測 Mario，播放完整伸出／開合／縮回流程，在可見時具有 active collision，並使用較小的 Y collision 以更符合 sprite。

---

### Record 13：Goomba 敵人與踩踏規則

**Prompt（翻譯／摘要）**

> 加入敵人行為與踩踏音效。當 Mario 踩敵人時，播放 `stomp`。

**AI 回應摘要**

AI 加入 Goomba 生成與行為。Goomba 會在 Mario 位於同一平台時啟動、追逐、失去 Mario、回到起始點，並且可以被踩踏。

**最終檔案**

| 檔案 | 變更 |
|---|---|
| `GoombaSpawner.ts` | 在有效表面上建立 Goomba。 |
| `GoombaEnemy.ts` | 控制追逐／返回與踩踏擊敗。 |
| `PlayerController.ts` | 偵測無害的已擊敗 Goomba 與敵人接觸。 |
| `GameHUD.ts` | 敵人被擊敗時加分。 |

**最終結果**

踩踏 Goomba 會播放 `stomp`、讓 Mario 反彈、加分並移除 Goomba。已擊敗敵人在接關後不會再次出現。

---

### Record 14：BGM 與 SFX 架構

**Prompt（翻譯）**

> 加入背景音樂。`gamescene` 使用 `bgm_3`，其他場景使用 `bgm_1`。讓音量可以調整。之後加入跳躍、金幣、攀爬、踩踏、踢擊與按鈕聲。

**AI 回應摘要**

AI 協助加入分離的 BGM 與 SFX 處理。BGM 由 `SceneChanger` 控制；SFX 使用 `GameAudio`。音量根據測試反覆調整，因為原本 0-1 的 engine volume 太大聲，而部分 SFX 變得聽不見。

**最終結果**

- 非遊戲場景使用 `audio/bgm_1`。
- `MainGameScene` 使用 `audio/bgm_3`。
- 載入轉場沒有 BGM。
- 擊敗流程中 BGM 會暫停。
- UI 音量為 0-100。
- 初始 BGM 與 SFX 音量為 50。
- SFX 與 BGM 獨立播放。

---

### Record 15：關卡載入轉場

**Prompt（翻譯）**

> 在關卡選擇與主遊戲中間加入黑色畫面，畫面上有 Mario 原地跑步與 `WORLD1`。我想要這樣，因為遊戲場景應該先載入完成再切換。

**AI 回應摘要**

AI 實作中間載入 overlay，而不是立刻顯示 `MainGameScene`。它會在顯示 Mario 奔跑與黃色 `WORLD1` 字體時，預載／載入遊戲場景。

**最終結果**

轉場畫面沒有 BGM，會顯示 Mario 在 `WORLD1` 旁邊奔跑，並在場景載入完成後進入主遊戲。

---

### Record 16：死亡、接關與 game over 流程

**Prompt（翻譯）**

> 當 Mario 生命歸 0 時，Mario 應該飛到空中但不能超過地圖頂端。播放 lose-one-life 動畫與聲音。除了 Mario 以外，所有東西都要暫停。之後詢問玩家是否花 10 枚金幣重試。如果是，就重生並保留分數／金幣／時間與已移除物件。如果否或金幣不夠，就顯示 game-over 黑畫面並回到關卡選擇。

**AI 回應摘要**

AI 將邏輯拆分到 `PlayerController`、`GameHUD`、`GamePause` 與 `GameAudio`。

**最終結果**

- Mario 會向上飛並停在空中。
- Defeat frames 會依照 `loseOneLife` 音訊長度安排時間。
- 遊戲狀態、動畫、敵人與計時器會暫停。
- BGM 會暫停。
- 接關花費 10 枚金幣並恢復 3 條命。
- 重生會讓 Mario 對齊地面並強制進入 idle。
- 已收集金幣與已擊敗敵人會維持被移除。
- Game over 會儲存 failed Firebase run、播放 game-over 音效、顯示黑畫面並返回關卡選擇。

---

### Record 17：勝利與 level clear 流程

**Prompt（翻譯）**

> 當 Mario 到達終點時，播放 victory animation，暫停除了 Mario 以外的所有遊戲狀態，然後切換到 level-clear 黑畫面。播放 `levelclear`；音效結束後回到關卡選擇。

**AI 回應摘要**

AI 加入城堡門附近的終點 trigger 偵測、勝利動畫、level-clear overlay、Firebase cleared record 儲存與 level-clear audio timing。

**最終結果**

- 終點偵測位於城堡門左側附近。
- Trigger 設有 Y 限制，避免城堡上方的金幣觸發勝利。
- 勝利動畫使用兩格 frames，每格約一秒。
- Level-clear 畫面在播放 `levelClear` 時使用勝利姿勢 frames。
- `levelClear` 音訊尾端的靜音部分不計入 timing。
- 完成關卡的 Firebase run 會被儲存。

---

### Record 18：Firebase 登入／註冊

**Prompt（翻譯）**

> 在 `START` 下方加入 `LOGIN` 按鈕。如果帳號存在就登入，如果不存在就註冊。如果需要的話，彈窗按鈕使用 `button_blue`。

**AI 回應摘要**

AI 加入 Firebase config handling、動態 SDK 載入、Auth 登入／註冊邏輯與登入彈窗。

**最終結果**

- `LOGIN` 出現在 `START` 下方。
- Email/password 彈窗接受輸入。
- 已存在帳號會登入。
- 不存在帳號會註冊。
- 登入成功會進入關卡選擇。
- 註冊成功會顯示 `REGISTER SUCCESS`。
- 從關卡選擇返回會登出。

---

### Record 19：登入彈窗 UI 調整

**Prompt（翻譯／摘要）**

> 按鈕大小與字體應該和 `START` 一樣。文字不見了。彈窗文字太小、距離太開、沒對齊，而且輸入文字看不到或在 focus 改變後會移動。

**AI 回應摘要**

AI 多次調整彈窗 label 大小、label bounds、input field styling、placeholder handling、button scale 與文字對齊。

**最終結果**

登入彈窗具有可見的輸入欄位、placeholder 文字、樣式化的 OK/CANCEL 按鈕、可讀的標題文字，以及 focus 變化後仍穩定的輸入顯示。

---

### Record 20：關卡選擇歷史紀錄、排行榜與設定

**Prompt（翻譯）**

> 在關卡選擇中，於 `WORLD1` 下方加入 back button。左下方加入 setting area，包含 `history`、`leaderboard` 與 `setting`。History 顯示玩家近期紀錄與最佳排名。Leaderboard 顯示前五名完成紀錄。Setting 調整 BGM 與 SFX 音量。

**AI 回應摘要**

AI 加入關卡選擇側邊按鈕、彈窗、Firebase 查詢、視覺樣式、圖示與音量滑桿。

**最終結果**

- `BACK` button 位於 `WORLD1` 下方。
- 側邊按鈕：`HISTORY`、`LEADERBOARD`、`SETTING`。
- 未登入時，History 會被停用。
- History 顯示最新 3 筆紀錄。
- 最佳完成紀錄會顯示全域排名。
- Leaderboard 顯示前 5 筆完成紀錄。
- Leaderboard 排序：高分、較短時間、較多金幣。
- Setting popup 可調整 BGM 與 SFX 音量。

---

### Record 21：歷史紀錄與排行榜資料顯示

**Prompt（翻譯／摘要）**

> Firebase 有紀錄，但 history 和 leaderboard 是空白的。可能是文字顯示範圍太小。把文字變大，使用金幣／時間圖示，用 email prefix 當玩家名稱，不要顯示多餘的 query count 文字。

**AI 回應摘要**

AI 修正資料載入與顯示問題，之後反覆調整 label bounds、font size、icon size、spacing、alignment 與 popup colors。

**最終結果**

- History 與 leaderboard 會載入 Firestore 資料。
- 玩家名稱顯示為 email prefix，例如 `test1@gmail.com` 變成 `TEST1`。
- History 顯示 `LATEST 3 RECORDS`。
- Leaderboard 表頭使用 `RANK`、`PLAYER`、`SCORE`、`TIME`、`COIN`。
- 紀錄使用可讀的圖示與 labels。
- 彈窗使用主題化顏色與較大文字。

---

### Record 22：Firebase 遊玩紀錄與排行榜規則

**Prompt（翻譯）**

> 我想儲存登入帳號、歷史分數、歷史金幣數與遊戲時間。Leaderboard 只參考完成關卡的紀錄。先依分數排序，再依遊戲時間，再依金幣排序。

**AI 回應摘要**

AI 設計 Firestore 資料形狀與排序邏輯。

**最終結果**

遊玩紀錄儲存在：

```text
users/{uid}/runs/{runId}
```

每筆紀錄包含 score、coins、play time、time left、world、cleared flag、email、uid 與 server timestamp。

排行榜排序：

1. 分數較高者優先。
2. 遊玩時間較短者優先。
3. 金幣數較高者優先。

---

### Record 23：UI 按鈕顏色與彈窗樣式

**Prompt（翻譯／摘要）**

> 側邊按鈕顏色很醜。使用藍色、橘色、藍色。改變 popup background 與 border colors。Popup 裡面的 back button 要是橘色。

**AI 回應摘要**

AI 調整側邊按鈕 tint、彈窗背景顏色、邊框顏色、disabled button state 與返回按鈕外觀。

**最終結果**

關卡選擇現在具有更清楚的視覺分組：

- History：藍色風格。
- Leaderboard：橘色風格。
- Setting：藍色風格。
- 登出時 disabled history 使用灰色按鈕素材。
- Leaderboard popup 使用橘／棕色樣式與橘色 back button。

---

### Record 24：部署與 Cocos build path 問題

**Prompt（翻譯）**

> 幫我部署這個網頁。或告訴我要怎麼在 Cocos 按 build。

**AI 回應摘要**

AI 引導 Cocos Creator build settings，並解釋 build error 是由 build path 中的空白造成。

**最終結果**

- Cocos build 使用 Web Desktop。
- Initial scene 為 `StartScene.fire`。
- 包含 `StartScene`、`LevelSelectScene` 與 `MainGameScene`。
- 因為 Cocos 拒絕含有空白的路徑，所以使用位於 `C:\Users\User\Desktop\web_mario_game` 的無空白專案副本。
- 專案已部署到 Firebase Hosting。

---

### Record 25：Firebase 安全性與 Git ignore

**Prompt（翻譯／摘要）**

> GitHub 警告我。你是不是 push 了不應該 push 的東西？

**AI 回應摘要**

AI 檢查 repo status，並釐清 Firebase web config 是公開給前端使用的 client config，不是私人的 admin key。Build/deploy artifacts 已被忽略。

**最終結果**

`.firebase/` 與 `/settings/builder.json` 會被忽略，因為它們是本機 build/deploy 產物。Firebase client config 仍保留在瀏覽器程式碼中，這對 Firebase web apps 是預期做法。

---

### Record 26：早期自動生成地面原型

**Prompt（翻譯）**

> `tiles_272` 是中間地面 tile，`tiles_271` 是左邊界地面 tile，`tiles_273` 是右邊界地面 tile。用原圖三倍大小生成地面，並使用已放置的 `tiles_272` 位置作為起點。

**AI 回應摘要**

AI 建立早期 ground generator，使用手動放在 editor 中的 tiles 作為位置參考，並用左、中、右地面 tile frames 生成平台。

**最終結果**

此原型在 TMX 地圖準備好之前，對測試移動與碰撞很有幫助。後來因為最終關卡使用 `mario map.tmx` 與執行時 TMX 碰撞生成，所以此原型已移除。

---

### Record 27：早期動畫關卡 intro 原型

**Prompt（翻譯）**

> Mario 在地面生成前就掉下去了。可以加入一個進入關卡畫面嗎？我希望 level intro background 使用 `tiles_570` 到 `tiles_573` 做成看起來像水往下流的動畫。

**AI 回應摘要**

AI 建立早期可重複使用的 intro system，包含 `LevelIntro.ts`、`AnimatedTileBackground.ts` 與 `IntroTextGroupSwitcher.ts`。

**最終結果**

此原型會在等待關卡準備好時顯示動畫 tile 背景。後來被關卡選擇與主遊戲之間的最終黑色載入轉場取代，因為使用者希望主遊戲場景先載入完畢再顯示 gameplay。

---

### Record 28：Cocos 與 TMX 相容性除錯

**Prompt（翻譯／摘要）**

> Cocos 無法正確讀取或顯示地圖。確認 TMX 設定與 Cocos setup。

**AI 回應摘要**

AI 協助檢查 TMX 檔案、Cocos import 行為、場景階層與 map/camera 尺寸。

**最終結果**

透過檢查 TMX layer names、object groups、object coordinates、tile size、map size 與 Cocos Creator 2.4.8 相容性，地圖工作流程穩定下來。由於較新的 TMX metadata 可能會讓 Cocos 2.4.8 混淆，因此也記錄了 Tiled 版本差異。

---

### Record 29：依據截圖反覆調整 UI

**Prompt（翻譯／摘要）**

> 文字太小、被裁切、太高、距離太開，或按鈕顏色不好看。調整顯示範圍、位置與顏色。

**AI 回應摘要**

AI 根據截圖回饋，反覆調整 label bounds、font sizes、split labels、popup layout、button scale、disabled button assets 與 popup colors。

**最終結果**

登入彈窗、關卡選擇側邊按鈕、歷史紀錄彈窗、排行榜彈窗、設定彈窗，以及 loading／game-over／level-clear 畫面，都透過多次截圖比較完成視覺調整。

## 4. 目前 AI 使用摘要

AI 被用於：

- 理解評分 rubric。
- 規劃實作順序。
- 建立場景流程。
- 修正 Cocos Creator 2.4.8 腳本相容性。
- 設定 pixel-art fonts 與 textures。
- 建立並後續取代早期自動生成地面與動畫 intro 原型。
- 匯入並驗證 TMX 地圖資料。
- 建立執行時 tile 碰撞。
- 實作 Mario 移動、跳躍、長跳、攀爬、受傷、死亡、接關與勝利。
- 實作攝影機跟隨與寬螢幕側邊黑邊。
- 實作視差／背景定位。
- 實作金幣、分數、HUD 與計時器。
- 實作問號方塊與獎勵金幣放置。
- 實作水管花。
- 實作 Goomba 與踩踏規則。
- 連接 BGM 與 SFX。
- 調整 0-100 音量控制。
- 建立載入轉場。
- 建立 game-over 與 level-clear 黑畫面。
- 連接 Firebase Auth 與 Firestore。
- 設計 Firestore 紀錄結構。
- 實作歷史紀錄與排行榜彈窗。
- 設計關卡選擇彈窗與按鈕樣式。
- 引導 Cocos build 與 Firebase deploy。
- 更新 `README.md` 與 `AI_reference.md`。

## 5. 目前 Cocos 設定備註

| Node | Component / Setup |
|---|---|
| `Canvas > Main Camera` | 掛上 `CameraFollow` 與 `ParallaxBackground`。使用玩家節點與 TMX 地圖節點路徑。 |
| `Canvas` | 掛上 `GameHUD`，讓 HUD 維持在螢幕空間中。 |
| `Canvas > World > Map > mario map` | 掛上 `cc.TiledMap`、`TileMapCollisionBuilder`、`CoinSpawner`、`QuestionBlockSpawner`、`FlowerSpawner` 與 `GoombaSpawner`。 |
| `Canvas > World > Player > mario_grouped_small.plist` | 掛上 `PlayerController`、`RigidBody`、`PhysicsBoxCollider` 與 `Sprite`。物理縮放維持 `1`。 |
| `StartScene` UI node | 掛上／使用 `SceneChanger`，用於 start、login、BGM 與 button sound。 |
| `LevelSelectScene` UI node | 掛上／使用 `SceneChanger`，用於 world button、back/sign-out、history、leaderboard、setting 與 loading transition。 |

## 6. Build 與 Deploy 備註

建議的 Cocos build 設定：

| Setting | Value |
|---|---|
| Platform | Web Desktop |
| Build path | `./build` |
| Initial scene | `db://assets/scenes/StartScene.fire` |
| Build scenes | `StartScene`、`LevelSelectScene`、`MainGameScene` |
| Inline all SpriteFrame | Enabled |
| Debug mode | Disabled for deployment |
| Source Maps | Disabled for deployment |

原始開發 repo 路徑包含空白：

```text
C:\Users\User\Desktop\SW Studio Lab\web_mario_game
```

當 build path 含有空白時，Cocos build 會失敗。因此 build/deploy 使用無空白路徑的副本：

```text
C:\Users\User\Desktop\web_mario_game
```

## 7. 剩餘工作

| 項目 | 狀態 |
|---|:---:|
| 開始、關卡選擇、遊戲流程 | Complete |
| 登入／註冊 | Complete |
| 歷史紀錄與排行榜 | Complete |
| Firebase Hosting 部署 | Complete |
| 攝影機與寬螢幕黑邊 | Complete |
| BGM/SFX 與音量滑桿 | Complete |
| 玩家死亡／接關／game-over | Complete |
| 勝利／level-clear | Complete |
| 金幣、問號方塊、花、Goomba | Complete |
| 蘑菇強化道具 | Not implemented |
| 額外關卡 | Not implemented |
| 手機操作 | Not implemented |
| 更多敵人種類，例如烏龜 | Not implemented |
