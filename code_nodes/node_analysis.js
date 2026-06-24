// ================================================================
// GEO Tracker v2 — SEA E-commerce Edition
// Brand: L'Oreal | Market: Southeast Asia
// Node 5: Code in JavaScript (n8n)
// ================================================================

const BRAND = "L'Oreal";
const BRAND_VARIANTS = ["l'oreal", "loreal", "l'oréal", "loréal", "l oreal"];

const COMPETITORS = ["Maybelline", "Nivea", "The Ordinary", "Cetaphil", "Pond's"];

const SEA_PLATFORMS = ["Shopee", "Lazada", "TikTok Shop", "Zalora", "Tokopedia"];

const SEA_COUNTRIES  = ["Vietnam", "Indonesia", "Thailand", "Malaysia",
                        "Philippines", "Singapore", "SEA", "Southeast Asia"];

// ── Lấy AI response từ HTTP Request node ─────────────────────────
const groqData    = $input.first().json;
const responseText = groqData.choices?.[0]?.message?.content || "";

if (!responseText) {
  return [{ json: { error: "Empty response from Groq",
                    timestamp: new Date().toISOString() } }];
}

// ── Lấy question data từ Google Sheets node ───────────────────────
// ⚠️ Đổi "Read Questions" thành tên đúng của node đọc sheet
const questionItem = $('Read Questions').item.json;
const questionId   = String(questionItem.question_id   || questionItem[0] || "");
const questionText = String(questionItem.question_text  || questionItem[1] || "");
const category     = String(questionItem.category       || questionItem[2] || "");
const market       = String(questionItem.market         || questionItem[3] || "SEA");

// ================================================================
// HÀM PHÂN TÍCH CHÍNH
// ================================================================
function analyzeResponse(text, brand, brandVariants, competitors,
                          platforms, countries) {
  const lower = text.toLowerCase();

  // ── 1. Brand detection ─────────────────────────────────────────
  const brandMentioned = brandVariants.some(v => lower.includes(v))
    ? "YES" : "NO";

  const mentionCount = brandVariants.reduce((n, v) =>
    n + (lower.match(new RegExp(v.replace(/'/g, "[''']"), "gi")) || []).length, 0);

  // ── 2. Position in response ────────────────────────────────────
  let position = "NOT_MENTIONED";
  if (brandMentioned === "YES") {
    const firstIdx = brandVariants.reduce((minIdx, v) => {
      const idx = lower.indexOf(v);
      return (idx !== -1 && idx < minIdx) ? idx : minIdx;
    }, lower.length);
    const ratio = firstIdx / lower.length;
    if (ratio < 0.33)       position = "EARLY";
    else if (ratio < 0.66)  position = "MIDDLE";
    else                    position = "LATE";
  }

  // ── 3. Sentiment (context 200 ký tự quanh brand) ──────────────
  let sentiment = "NEUTRAL";
  if (brandMentioned === "YES") {
    const positiveWords = [
      "best", "great", "excellent", "recommend", "top", "leading",
      "popular", "trusted", "quality", "effective", "affordable",
      "moisturizing", "gentle", "suitable", "love", "favorite",
      "widely available", "authentic", "reliable"
    ];
    const negativeWords = [
      "expensive", "overpriced", "fake", "counterfeit", "harmful",
      "irritating", "disappointing", "poor", "avoid", "bad",
      "allergic", "heavy", "greasy", "ineffective"
    ];
    const foundVariant = brandVariants.find(v => lower.includes(v));
    const idx     = lower.indexOf(foundVariant);
    const context = lower.substring(Math.max(0, idx - 200),
                                    Math.min(lower.length, idx + 200));
    const pos = positiveWords.filter(w => context.includes(w)).length;
    const neg = negativeWords.filter(w => context.includes(w)).length;
    if (pos > neg)       sentiment = "POSITIVE";
    else if (neg > pos)  sentiment = "NEGATIVE";
  }

  // ── 4. Competitors ─────────────────────────────────────────────
  const competitorsMentioned = competitors
    .filter(c => lower.includes(c.toLowerCase()))
    .join(", ") || "NONE";
  const competitorCount = competitors
    .filter(c => lower.includes(c.toLowerCase())).length;

  // ── 5. E-commerce Platform mentions (NEW) ─────────────────────
  const platformsMentioned = platforms
    .filter(p => lower.includes(p.toLowerCase()))
    .join(", ") || "NONE";
  const platformCount = platforms
    .filter(p => lower.includes(p.toLowerCase())).length;

  // Platform nào được nhắc nhiều nhất
  const platformCounts = {};
  platforms.forEach(p => {
    const matches = (lower.match(new RegExp(p.toLowerCase(), "g")) || []).length;
    if (matches > 0) platformCounts[p] = matches;
  });
  const topPlatform = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "NONE";

  // ── 6. SEA Country mentions (NEW) ─────────────────────────────
  const countriesMentioned = countries
    .filter(c => lower.includes(c.toLowerCase()))
    .join(", ") || "NONE";

  // ── 7. Purchase intent signal (NEW) ───────────────────────────
  const highIntentWords   = ["buy", "purchase", "order", "shop", "get", "price"];
  const mediumIntentWords = ["recommend", "suggest", "consider", "try"];
  const intentScore = highIntentWords.filter(w => lower.includes(w)).length * 2
                    + mediumIntentWords.filter(w => lower.includes(w)).length;
  const purchaseIntent = intentScore >= 4 ? "HIGH"
                       : intentScore >= 2 ? "MEDIUM" : "LOW";

  return {
    brandMentioned, mentionCount, position, sentiment,
    competitorsMentioned, competitorCount,
    platformsMentioned, platformCount, topPlatform,
    countriesMentioned, purchaseIntent
  };
}

// ── Chạy phân tích ────────────────────────────────────────────────
const analysis = analyzeResponse(
  responseText, BRAND, BRAND_VARIANTS,
  COMPETITORS, SEA_PLATFORMS, SEA_COUNTRIES
);

// ── Timestamp (Vietnam timezone) ──────────────────────────────────
const tzOpts = { timeZone: "Asia/Ho_Chi_Minh" };
const now    = new Date().toLocaleString("vi-VN", tzOpts);
const today  = new Date().toLocaleDateString("vi-VN", tzOpts);

// ── Output cho Google Sheets node ─────────────────────────────────
return [{
  json: {
    timestamp:             now,
    date:                  today,
    question_id:           questionId,
    question_text:         questionText,
    category:              category,
    market:                market,
    ai_response:           responseText.substring(0, 50000),
    brand_mentioned:       analysis.brandMentioned,
    mention_count:         analysis.mentionCount,
    position_in_response:  analysis.position,
    sentiment:             analysis.sentiment,
    competitors_mentioned: analysis.competitorsMentioned,
    competitor_count:      analysis.competitorCount,
    platforms_mentioned:   analysis.platformsMentioned,   // NEW
    platform_count:        analysis.platformCount,         // NEW
    top_platform:          analysis.topPlatform,           // NEW
    countries_mentioned:   analysis.countriesMentioned,    // NEW
    purchase_intent:       analysis.purchaseIntent,        // NEW
    response_length:       responseText.length
  }
}];
