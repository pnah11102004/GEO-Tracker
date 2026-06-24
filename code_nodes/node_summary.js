// Node: Summarize Results
// Nhận 15 items từ Loop → gộp thành 1 item duy nhất → Email gửi 1 lần

const items = $input.all();

// ── Tổng hợp số liệu ──────────────────────────────────────────────
const total    = items.length;
const mentioned = items.filter(i => i.json.brand_mentioned === "YES").length;
const positive  = items.filter(i => i.json.sentiment === "POSITIVE").length;
const early     = items.filter(i => i.json.position_in_response === "EARLY").length;
const visRate   = Math.round((mentioned / total) * 100);
const posRate   = mentioned > 0 ? Math.round((positive / mentioned) * 100) : 0;

// ── Tìm câu hỏi bị miss ───────────────────────────────────────────
const missedQueries = items
  .filter(i => i.json.brand_mentioned === "NO")
  .map(i => `• ${i.json.question_text}`)
  .join("\n") || "None";

// ── Đếm competitor ────────────────────────────────────────────────
const compNames = ["Maybelline", "Nivea", "The Ordinary", "Cetaphil"];  // ✅ đã sửa
const compCounts = {};
compNames.forEach(c => {
  compCounts[c] = items.filter(i =>
    (i.json.competitors_mentioned || "").includes(c)
  ).length;
});
const topComp = Object.entries(compCounts)
  .sort((a, b) => b[1] - a[1])[0];

// ── Ngày chạy ─────────────────────────────────────────────────────
const today = new Date().toLocaleDateString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh"
});

// ── Output 1 item duy nhất ────────────────────────────────────────
return [{
  json: {
    run_date:        today,
    total_queries:   total,
    mentioned:       mentioned,
    visibility_rate: visRate,
    positive_rate:   posRate,
    early_rate:      Math.round((early / Math.max(mentioned, 1)) * 100),
    top_competitor:  `${topComp[0]} (${topComp[1]} lần)`,
    missed_queries:  missedQueries,
    missed_count:    total - mentioned,

    email_subject: `[GEO Tracker] L'Oreal SEA Visibility Report — ${today}`,  // ✅ đã sửa

    email_body:
`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e8175d; border-bottom: 2px solid #e8175d; padding-bottom: 8px;">
    📊 L'Oreal AI Visibility Report — SEA — ${today}
  </h2>
  <h3 style="color: #333;">📈 KẾT QUẢ HÔM NAY</h3>
  <table style="width:100%; border-collapse: collapse;">
    <tr style="background:#f9f9f9;">
      <td style="padding:8px 12px;">✅ Visibility Rate</td>
      <td style="padding:8px 12px; font-weight:bold;">${visRate}% (${mentioned}/${total} queries)</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;">😊 Positive Rate</td>
      <td style="padding:8px 12px; font-weight:bold;">${posRate}% của lần được mention</td>
    </tr>
    <tr style="background:#f9f9f9;">
      <td style="padding:8px 12px;">⚡ Early Position</td>
      <td style="padding:8px 12px; font-weight:bold;">${Math.round((early / Math.max(mentioned,1)) * 100)}% xuất hiện đầu response</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;">🏆 Top Competitor</td>
      <td style="padding:8px 12px; font-weight:bold;">${topComp[0]} (${topComp[1]} lần)</td>
    </tr>
  </table>
  <h3 style="color: #e85d04; margin-top: 24px;">
    ⚠️ QUERIES CHƯA ĐƯỢC MENTION (${total - mentioned} câu)
  </h3>
  <div style="background:#fff3e0; border-left:4px solid #e85d04; padding:12px 16px; border-radius:4px;">
    ${missedQueries === "None"
      ? "<em>Tất cả queries đều có mention! 🎉</em>"
      : missedQueries.split("\n").map(q =>
          `<div style="padding:4px 0;">❌ ${q.replace("• ","")}</div>`
        ).join("")
    }
  </div>
  <h3 style="margin-top: 24px;">🔗 XEM DASHBOARD ĐẦY ĐỦ</h3>
  <a href="https://datastudio.google.com/reporting/4fff625c-9ac7-41bf-9e13-196af9952d7e"
     style="display:inline-block; background:#e8175d; color:white;
            padding:10px 20px; border-radius:6px; text-decoration:none;
            font-weight:bold;">
    Mở Looker Studio Dashboard →
  </a>
  <hr style="margin-top:32px; border:none; border-top:1px solid #eee;">
  <p style="color:#999; font-size:12px;">
    GEO Tracker • Tự động gửi lúc
    ${new Date().toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
    • Powered by n8n + Groq
  </p>
</div>`

  }  // đóng json: {
}];  // đóng object trong array