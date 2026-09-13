/* ============================================================
   AutoBook AI — config.js
   إعدادات التطبيق العامة (تُحمَّل قبل app.js)
   ============================================================ */

const AppConfig = {
  brand: {
    name: "AutoBook",
    suffix: ".ai",
    fullName: "AutoBook.ai",
    url: "https://islamsiso644-sudo.github.io/autobook/",
    email: "hello@autobook.ai",
    phone: "+213 000 000 000",
  },

  defaults: {
    lang: "ar",           // اللغة الافتراضية عند أول زيارة
    fallbackLang: "en",   // لغة احتياطية إذا لم تتوفر ترجمة
    currency: "USD",
  },

  // ترتيب أزرار الطاقة السريعة في الديمو
  quickActions: ["book", "prices", "hours", "contact"],

  // إعدادات الديمو
  demo: {
    typingDelay: 600,     // مدة ظهور رد الذكاء الاصطناعي (ms)
    autoStart: true,      // بدء محادثة الديمو تلقائياً
  },

  // الباقات والأسعار (يُعرض السعر بعملة الزائر في النسخة الكاملة)
  pricing: [
    {
      id: "starter",
      icon: "🌱",
      color: "emerald",
      monthly: 0,
      yearly: 0,
      popular: false,
      featureKeys: [
        "f_starter_1", "f_starter_2", "f_starter_3", "f_starter_4",
      ],
    },
    {
      id: "pro",
      icon: "⚡",
      color: "indigo",
      monthly: 29,
      yearly: 290,
      popular: true,
      featureKeys: [
        "f_pro_1", "f_pro_2", "f_pro_3", "f_pro_4", "f_pro_5", "f_pro_6",
      ],
    },
    {
      id: "business",
      icon: "🏢",
      color: "violet",
      monthly: 99,
      yearly: 990,
      popular: false,
      featureKeys: [
        "f_biz_1", "f_biz_2", "f_biz_3", "f_biz_4", "f_biz_5", "f_biz_6",
      ],
    },
  ],

  // روابط التواصل
  links: {
    github: "https://github.com/islamsiso644-sudo/autobook",
    demo: "https://islamsiso644-sudo.github.io/autobook/",
  },

  // إحصائيات الواجهة
  stats: [
    { value: "15",   key: "stat_langs" },
    { value: "24/7", key: "stat_avail" },
    { value: "90%",  key: "stat_auto" },
    { value: "5s",   key: "stat_reply" },
  ],
};

/* تسجيل التكوين عالمياً */
window.AppConfig = AppConfig;
