# MarTech 規劃平台 — CLAUDE.md

## 專案目的

協助行銷人員從「策略目的」出發，逐步完成一份完整的行銷活動規劃，
涵蓋漏斗配置、渠道規劃、受眾設定、素材規劃、KPI 目標、廣告活動識別碼（utm_campaign）、
活動網址（落地頁）設定，最終輸出完整 UTM 參數總覽並支援 Excel 匯出。

## 技術架構

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Google Cloud SQL)
- **ORM**: 無 Prisma（直接用 `pg` 套件執行 raw SQL）
- **Schema Migration**: `scripts/migrate.mjs`（每次 container 啟動自動執行）
- **Auth**: NextAuth.js v4
- **部署**: Google Cloud Run
  - Project: `utmaidaservice`
  - Region: `asia-east1`
  - Service name: `martech-manager`
  - Image: `asia-east1-docker.pkg.dev/utmaidaservice/cloud-run-source-deploy/martech-manager`
- **Excel 匯出**: `xlsx` 套件（client-side）

## OAuth 設定

- **Provider**: Auth0（透過 NextAuth）
- **Auth0 Domain**: `dev-e3225zfzbbgotx0o.us.auth0.com`
- **Callback URL**: `https://martech.oyag.com/api/auth/callback/auth0`
- **環境變數**（`.env.local`）:
  ```
  NEXTAUTH_URL=https://martech.oyag.com
  NEXTAUTH_SECRET=...
  AUTH0_CLIENT_ID=...
  AUTH0_CLIENT_SECRET=...
  AUTH0_ISSUER=https://dev-e3225zfzbbgotx0o.us.auth0.com
  DATABASE_URL=postgresql://...
  ```
- **備註**: 與 utm-manager 共用同一個 Auth0 應用程式（相同 CLIENT_ID / CLIENT_SECRET）

## 本機開發環境

- **Port**: `3000`（Next.js 預設，`npm run dev`）
- **本機 NEXTAUTH_URL**: 開發時需將 `.env.local` 的 `NEXTAUTH_URL` 改為 `http://localhost:3000`
- **搭配 utm-manager**: utm-manager 固定跑 port 3001，兩個專案可同時啟動不衝突

### Auth0 後台 Allowed Callback URLs 必須包含：
```
https://martech.oyag.com/api/auth/callback/auth0
https://utm.oyag.com/api/auth/callback/auth0
http://localhost:3000/api/auth/callback/auth0
http://localhost:3001/api/auth/callback/auth0
```

## 資料庫 Tables

- `PlanMaster` — 計畫主檔（planName, brandName, startDate, endDate, totalBudget, objectiveType, funnelConfigJson, status, userId）
- `PlanRow` — 所有 row 資料（channel / audience / creative / kpi / landing）
  - 重要欄位：rowType, funnelStage, utmSource, utmMedium, utmSourcePlatform, utmMarketingTactic, utmCampaign, utmTerm, utmCreativeFormat, utmContent, landingUrl, ctaType, budgetRatio, plannedBudget

## 10 個模組完成狀態

| # | 模組名稱 | 檔案 | 狀態 |
|---|---------|------|------|
| 1 | 活動基本設定 | `Module1Basic.tsx` | 完成（含策略目的按鈕） |
| 2 | 行銷策略 | `Module2Strategy.tsx` | 完成（intent × angle 兩步選擇、Settings 面板） |
| 3 | 漏斗配置 | `Module2Funnel.tsx` | 完成（AIDAM 比例、策略自動套入、drift 警告） |
| 4 | 渠道規劃 | `Module3Channel.tsx` | 完成（渠道矩陣、預設組合、預算占比） |
| 5 | 受眾規劃 | `Module4Audience.tsx` | 完成（utm_term、受眾類型、綁定渠道） |
| 6 | 素材規劃 | `Module5Creative.tsx` | 完成（contentGroup/Variant、utm_creative_format） |
| 7 | 目標與KPI | `Module6KPI.tsx` | 完成（campaignGoal、KPI 指標、目標落地頁） |
| 8 | 廣告活動 | `Module8Campaign.tsx` | 完成（7段式 utm_campaign 自動生成、可手動覆寫） |
| 9 | 活動網址 | `Module7Landing.tsx` | 完成（落地頁、CTA 設定） |
| 10 | 輸出與串接 | `Module8Export.tsx` + `PlanDashboard.tsx` | 完成（UTM 總覽表、Excel 匯出、3-chart Dashboard） |

## 關鍵資料結構

### utm_campaign 格式（7 段）
```
[階段]__[來源]__[策略]__[內容]__[目標]__[起始日]__[結束日]
例：desire__facebook__promo_conversion__carousel_v01__add_to_cart__20260401__20260430
```

### utm_marketing_tactic 格式
```
{tacticIntent}__{tacticAngle}
例：promo_conversion__limited_offer
```

### funnelConfigJson 儲存格式
```json
{
  "_tacticIntent": "promo_conversion",
  "_tacticAngle": "limited_offer",
  "Awareness": { "enabled": false, "ratio": 0, "task": "導流" },
  "Interest":  { "enabled": true,  "ratio": 20, "task": "互動留言" }
}
```

## 首頁流程

1. 用戶在首頁選擇「策略目的」（10 個 intent 按鈕）
2. 點擊「＋ 新建計畫」→ `/plans/new?intent=xxx`
3. 進入模組 1（活動基本設定），intent 已預帶入
4. 模組 2 顯示已選 intent，直接進入訊息訴求（angle）選擇

## 目前已知問題

- `CoreAxesSection.tsx` 已被 `TacticIntentSection.tsx` 取代，舊檔案仍殘留未刪除
- 首頁手動排序僅儲存於 client state，重新整理後恢復預設排序（尚未持久化至 DB）
- `objectiveType` 欄位在 PlanMaster 中仍存在但模組 1 已不再寫入，模組 10 改用 `tacticIntent` 顯示

## 部署指令

```bash
# Build
npx next build

# Build & push image
gcloud builds submit --tag asia-east1-docker.pkg.dev/utmaidaservice/cloud-run-source-deploy/martech-manager

# Deploy to Cloud Run
gcloud run deploy martech-manager \
  --image asia-east1-docker.pkg.dev/utmaidaservice/cloud-run-source-deploy/martech-manager \
  --region asia-east1 \
  --project utmaidaservice
```

## 未來開發方向

- [ ] 計畫列表手動排序持久化（寫入 DB 或 localStorage）
- [ ] 刪除 `CoreAxesSection.tsx`（舊版已不使用）
- [ ] 首頁計畫卡片加入「複製計畫」功能
- [ ] 模組 10 UTM 總覽表的本地編輯值可回存至計畫
- [ ] 多用戶協作支援（目前以 userId 隔離）
- [ ] 計畫匯出為完整 PDF 報告
- [ ] 與 utm-manager 專案的 UTM 產生器深度整合（目前僅複製連結）
