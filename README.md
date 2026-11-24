# 二十一弦：古箏少女養成文字遊戲

從第一次纏膠布，到最後一次上台。排好每一季的行程，陪一個人把箏彈成一輩子。

**線上試玩：** https://lidichu.github.io/zheng21/

- 四季行程排程、考級、比賽、升學，四條職涯路線（樂團、演奏家、老師、成人班）
- SVG 繪製的少女風立繪，可自由換髮型、瀏海、服裝、飾品
- 純 HTML + JavaScript，不需要安裝任何套件

## 檔案

| 路徑 | 內容 |
|---|---|
| `zheng/` | 遊戲原始檔（index.html、avatar.js、data.js、events.js、game.js），`avgal.html` 是換裝圖庫 |
| `docs/` | GitHub Pages 發佈用，由 `node build.js` 從 `zheng/` 產生，不要直接改 |
| `serve.js` | 本機測試伺服器：`node serve.js zheng 8731`，開 http://localhost:8731/ |
| `sim.js` | 無畫面模擬：`node sim.js zheng 30`，最後一行 `ERRORS {}` 代表沒有錯誤 |
| `說明.md` | 更詳細的開發與發佈說明 |

## 更新流程

1. 改 `zheng/` 裡的檔案，用 `serve.js` 在本機測試
2. `node build.js` 更新 `docs/`
3. commit 後 `git push`，GitHub Pages 約一分鐘後更新
