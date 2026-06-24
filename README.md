# 🔍 GEO Tracker — AI Brand Visibility Monitor

> **Automatically track how AI models mention your brand** — every day, for free.

![Stack](https://img.shields.io/badge/n8n-workflow_automation-orange?style=flat-square)
![Stack](https://img.shields.io/badge/Groq_API-LLaMA_3.1-purple?style=flat-square)
![Stack](https://img.shields.io/badge/Looker_Studio-dashboard-blue?style=flat-square)
![Cost](https://img.shields.io/badge/cost-$0_free-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/status-active-success?style=flat-square)

---

## 📌 What is this?

When users ask ChatGPT or Perplexity *"best skincare brands on Shopee SEA"*, does your brand get mentioned? Positively or negatively? First or last?

Traditional SEO tools measure Google rankings — but **no tool measures AI visibility**.

**GEO Tracker** (Generative Engine Optimization Tracker) solves this by automatically querying an AI model daily with brand-relevant questions, analyzing the responses, and delivering a structured dashboard + email report.

---

## 🎯 Use Case

This project tracks **L'Oreal's AI visibility** in the Southeast Asian e-commerce market.

| | |
|---|---|
| **Brand tracked** | L'Oreal |
| **Competitors** | Maybelline · Nivea · The Ordinary · Cetaphil |
| **Platforms** | Shopee · Lazada · TikTok Shop · Zalora |
| **Market** | Vietnam · Indonesia · Thailand · SEA |
| **Questions/day** | 15 (Discovery · Comparison · How-to) |
| **Schedule** | Automated — every day at 8:00 AM |

---

## ⚙️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    n8n Workflow                      │
│                                                      │
│  [Schedule 8AM] → [Read Questions] → [Loop x15]     │
│                                          ↓           │
│                          [HTTP Request → Groq API]   │
│                                          ↓           │
│                          [Code Node — JS Analysis]   │
│                                          ↓           │
│                          [Append → Google Sheets]    │
│                                          ↓ (done)    │
│                          [Summarize] → [Send Email]  │
└─────────────────────────────────────────────────────┘
         ↓                        ↓
  [Google Sheets]          [Gmail — 1 email/day]
  Results · Summary
         ↓
  [Looker Studio Dashboard]
```

---

## 📊 Dashboard Metrics

| Metric | Description |
|---|---|
| **Visibility Rate** | % of queries where AI mentions the brand |
| **Positive Rate** | % of mentions with positive sentiment |
| **Early Position Rate** | % of mentions appearing in the first ⅓ of response |
| **Competitor Share** | How often each competitor is mentioned alongside brand |
| **Platform Mentions** | Which e-commerce platforms AI associates with brand |
| **Purchase Intent** | HIGH / MEDIUM / LOW based on query language |

> 📸 *See `/assets/screenshots/` for dashboard preview*

---

## 📂 Repo Structure

```
geo-tracker/
│
├── README.md                        # You are here
│
├── workflow/
│   └── n8n_workflow.json            # Import directly into n8n
│
├── code_nodes/
│   ├── node_analysis.js             # Node 5: JS analysis logic
│   └── node_summarize.js            # Node 6: Summarize + email HTML
│
├── data/
│   └── questions_template.csv       # 15 starter questions (editable)
│
│
└── assets/
    └── screenshots/                 # Dashboard & email screenshots
```

---

## 🚀 Quick Start

### Prerequisites
- [n8n](https://n8n.io) (self-hosted: `npx n8n`) — free
- [Groq API key](https://console.groq.com) — free, no credit card
- Google account (Sheets + Looker Studio + Gmail)

### Setup in 4 steps

**Step 1 — Clone & prepare data**
```bash
git clone https://github.com/YOUR_USERNAME/geo-tracker.git
```
Copy `data/questions_template.csv` content into a new Google Sheet named `GEO Tracker`, tab named `Questions`.

**Step 2 — Import n8n workflow**
```
n8n → New Workflow → Import → upload workflow/n8n_workflow.json
```
Add your Groq API key in the HTTP Request node header.

**Step 3 — Connect Google Sheets**

In n8n, authenticate Google Sheets nodes with your Google account and point them to your spreadsheet.

**Step 4 — Activate**
```
n8n → Toggle workflow to Active
```
Runs automatically at 8:00 AM daily. Or click "Execute Workflow" to test immediately.

---

## 📋 Data Schema

Each daily run appends rows to the `Results` sheet with 18 columns:

| Column | Values |
|---|---|
| `brand_mentioned` | YES / NO |
| `sentiment` | POSITIVE / NEUTRAL / NEGATIVE |
| `position_in_response` | EARLY / MIDDLE / LATE / NOT_MENTIONED |
| `competitors_mentioned` | Comma-separated list or NONE |
| `platforms_mentioned` | Shopee, Lazada, TikTok Shop... |
| `countries_mentioned` | Vietnam, Indonesia, SEA... |
| `purchase_intent` | HIGH / MEDIUM / LOW |

---

## 📬 Email Report Sample

Sent automatically after each run:

```
📊 L'Oreal AI Visibility Report — SEA — 02/06/2026

✅ Visibility Rate  : 87% (13/15 queries)
😊 Positive Rate   : 77% of mentions
⚡ Early Position  : 92% appear at top of response
🏆 Top Competitor  : Nivea (8 mentions)

⚠️ MISSED QUERIES (2)
❌ How to find authentic skincare on TikTok Shop?
❌ Best budget sunscreen brands in Vietnam

🔗 View Full Dashboard → [Looker Studio Link]
```

---

## 💡 Business Value

This tool is directly applicable for **e-commerce enablers** helping brands sell on Shopee, Lazada, and TikTok Shop in SEA:

- **Identify AI visibility gaps** before they affect sales
- **Track competitor positioning** in AI-generated recommendations
- **Measure content strategy impact** — run for 2+ weeks to see if new content improves AI mention rate
- **Zero cost** — runs indefinitely on free tiers

---

## 🛠 Tech Stack

| Tool | Purpose | Cost |
|---|---|---|
| n8n | Workflow orchestration | Free (self-hosted) |
| Groq API (LLaMA 3.1-8b) | AI query engine | Free tier |
| Google Sheets | Data storage & pipeline | Free |
| Looker Studio | Dashboard visualization | Free |
| Gmail (via n8n) | Automated email reports | Free |

**Total infrastructure cost: $0**

---

## 📈 Sample Results

From a 2-day run with 30 total queries (HubSpot pilot):

| Metric | Result |
|---|---|
| Visibility Rate | 83.3% (25/30) |
| Positive Rate | 72% |
| Early Position Rate | 88% |
| Top Competitor | Salesforce (11×) |
| Key Gap Found | Email marketing queries → competitor dominates |

---

## 🔧 Customization

Change brand, competitors, and questions in two places:

**1. `code_nodes/node_analysis.js` — top of file:**
```javascript
const BRAND = "Your Brand";
const COMPETITORS = ["Competitor A", "Competitor B"];
const SEA_PLATFORMS = ["Shopee", "Lazada", "TikTok Shop"];
```

**2. Google Sheets — `Questions` tab:**
Replace the 15 questions with queries relevant to your brand and industry.

---

## 📄 License

MIT — free to use, adapt, and build on.

---

## 👤 Author

**Pham Ngoc Anh Hong**
E-commerce / MIS Graduate · QA & Automation enthusiast
[LinkedIn](https://linkedin.com/in/YOUR_PROFILE) · [Email](mailto:YOUR_EMAIL)
