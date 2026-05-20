# AI_reference

Web Mario：AI 協作開發紀錄

## 1. AI Tool(s) Used

- **ChatGPT**：協助分析作業要求、規劃開發順序、確認 Cocos Creator 2.4.8 寫法、處理 UI 版面問題，以及協助撰寫 `README.md` 與 `AI_reference.md` 草稿。

## 2. Scope of Usage / Code Location

| 檔案 / 位置 | AI 協助內容 | 目前使用情況 |
|---|---|---|
| `assets/scripts/SceneChanger.ts` | 協助撰寫 Cocos Creator 2.4.8 可用的場景切換 script。 | 用於 `START` 與 `LEVEL 1` 按鈕。 |
| `assets/scenes/StartScene.fire` | 協助規劃開始畫面的 UI 結構與按鈕設定。 | 用於遊戲開始畫面。 |
| `assets/scenes/LevelSelectScene.fire` | 協助規劃關卡選擇畫面的 UI 結構與按鈕設定。 | 用於關卡選擇畫面。 |
| `README.md` | 協助整理目前功能、玩法與評分項目狀態。 | 由我再修改成使用者導向的 README。 |
| `AI_reference.md` | 協助整理 AI 使用紀錄。 | 之後會轉成 `AI_reference.pdf`。 |

## 3. Prompt / Response Evidence

### 紀錄 1：分析作業要求與開發順序

**Prompt**

> 先分析老師的評分標準 和我給你的資源檔 然後從教我建立一個COCOS檔 然後怎麼git上去 然後一個一個功能實做出來 我完成一步會跟你說 再跟我說下一步怎麼做

**AI Response Summary**

ChatGPT 協助整理老師的評分項目，並建議用逐步開發的方式完成專案：先建立 Cocos 專案、匯入素材、建立場景與選單流程，再依序實作玩家、地圖、敵人、問號方塊、UI、音效、Git 與 Firebase 部署。

**Refinement & Explanation**

我目前只先完成第一階段，也就是建立可測試的基本流程：`StartScene → LevelSelectScene → MainGameScene`。這樣可以避免一次實作太多功能，也比較容易在每個階段確認專案沒有壞掉。

---

### 紀錄 2：素材匯入與素材使用範圍

**Prompt**

> others 裡面的那兩張圖要放進來嗎 看起來像不同種類的馬力歐

**AI Response Summary**

ChatGPT 建議可以先把 `others` 資料夾一起匯入，但第一版先不要使用，因為那些圖片可能代表其他型態的 Mario，若要做火焰或狸貓能力會增加遊戲邏輯複雜度。

**Refinement & Explanation**

我有將 `others` 資料夾匯入專案，但目前版本只使用 menu、title、button、font 等素材。其他型態的 Mario 會留到基本功能完成後再評估是否加入。

---

### 紀錄 3：開始畫面與關卡選擇畫面

**Prompt**

> 好了 教我下一步

**AI Response Summary**

ChatGPT 引導建立 `StartScene`、`LevelSelectScene` 與 `MainGameScene`，並說明如何放入背景、標題圖片、button sprite，以及設定按鈕的 hover / pressed 狀態。

**Refinement & Explanation**

我在 Cocos Creator 中手動調整位置、大小與顯示效果，並使用 TA 提供的 UI 素材取代 Cocos 預設 button，讓畫面風格更接近 Mario 遊戲。

---

### 紀錄 4：修正 Cocos Creator 版本造成的 script 問題

**Prompt**

> 我找不到scenechanger可以掛在哪 而且coco抱錯

**AI Response Summary**

一開始 AI 提供的 script 是 Cocos Creator 3.x 寫法。後來 ChatGPT 根據錯誤訊息與畫面判斷我使用的是 Cocos Creator 2.4.8，因此改成 `cc._decorator`、`cc.Component` 與 `cc.director.loadScene()` 的寫法。

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

我將原本不相容的 Cocos 3.x import 寫法改成 Cocos Creator 2.4.8 可用的寫法。這個 script 會掛在 button node 上，再由 Button 的 Click Events 指定要呼叫的 function。

---

### 紀錄 5：調整 pixel art 與 bitmap font 顯示

**Prompt**

> 圖片都變清楚了 但字體還是糊的

**AI Response Summary**

ChatGPT 說明 pixel art 與 bitmap font 的貼圖需要將 Filter 設成 `Point`，而且 Label 盡量不要用非整數 scale，否則會讓字體看起來模糊。

**Refinement & Explanation**

我調整了背景、按鈕、標題與 bitmap font 相關貼圖的 Filter 設定，讓目前選單畫面的圖片與字體顯示更清楚。

## 4. 目前 AI 使用總結

目前 AI 主要用於：

- 理解老師的評分標準。
- 規劃 Cocos 專案開發順序。
- 建立開始畫面、關卡選擇畫面與場景切換流程。
- 修正 Cocos Creator 2.4.8 與 3.x 語法不同造成的 script 問題。
- 協助撰寫目前版本的文件草稿。

目前尚未實作 Mario 移動、碰撞、敵人、question block、UI、音效與 Firebase 部署。之後若這些功能有使用 AI 協助，會再把新的紀錄補到此文件中。
