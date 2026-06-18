# 遊艇證照題庫練習

營業用動力小船證照題庫的互動練習網頁，含遊戲化進度與錯題分類追蹤。

## 功能

- **681 題**多選題練習（來源：遊艇證照題庫中文 PDF）
- **遊戲化**：XP、等級、連續練習天數
- **錯題本**：答錯自動記錄，依大分類／小分類歸檔
- **統計**：各分類答題進度與弱點分析
- **本機儲存**：進度保存在瀏覽器 localStorage

## 使用方式

```bash
npm install
npm run dev
```

瀏覽器開啟終端機顯示的網址（預設 http://localhost:5173）。

## 重新解析題庫

若更新了 PDF，可重新擷取題目：

```bash
python -m pip install pymupdf
python scripts/parse_questions.py
```

## 建置正式版

```bash
npm run build
npm run preview
```

`dist/` 資料夾可部署至任何靜態網站託管服務。

## 部署至 Railway

此專案已設定為 Railway 靜態網站服務（build → `dist/`，以 `serve` 提供 SPA）。

### 方式一：Railway Dashboard（建議）

1. 將專案推送到 GitHub（需先 `git init` 並建立 repository）
2. 登入 [Railway](https://railway.com/) → **New Project** → **Deploy from GitHub repo**
3. 選擇此 repository，Railway 會自動讀取 `railway.toml` 與 `nixpacks.toml`
4. 部署完成後，到服務的 **Settings → Networking → Generate Domain** 取得公開網址

### 方式二：Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway domain
```

### 環境變數

通常不需額外設定。Railway 會自動注入 `PORT`，`npm start` 會監聽該埠號。
"# Second-class-Yacht-and-Power-driven-Small-Ship-Driver-s-Examination-Practice-Tool" 
