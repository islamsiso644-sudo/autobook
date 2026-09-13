/* ============================================================
   AutoBook AI — agents.js
   بيانات الوكلاء الأذكياء الأربعة (تُحمَّل قبل app.js)
   كل نصوص العرض تأتي من translations.js بمفاتيح ag_<id>_name/desc
   ============================================================ */

const AgentsData = [
  {
    id: "booking",
    icon: "📅",
    color: "indigo",
    capabilities: ["cal", "remind", "confirm"],
    capKeys: ["cap_cal", "cap_remind", "cap_confirm"],
  },
  {
    id: "sales",
    icon: "💬",
    color: "emerald",
    capabilities: ["pitch", "pricing", "upsell"],
    capKeys: ["cap_pitch", "cap_pricing", "cap_upsell"],
  },
  {
    id: "support",
    icon: "🛟",
    color: "sky",
    capabilities: ["faq", "ticket", "escalate"],
    capKeys: ["cap_faq", "cap_ticket", "cap_escalate"],
  },
  {
    id: "analytics",
    icon: "📊",
    color: "violet",
    capabilities: ["metrics", "reports", "insights"],
    capKeys: ["cap_metrics", "cap_reports", "cap_insights"],
  },
];

window.AgentsData = AgentsData;
