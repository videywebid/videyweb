// config.js
const cfg = {
  // === Set URL tujuan di sini ===
  // Bisa static string, atau kosong untuk memakai ENV var jika kamu mau:
  TARGET_URL: process.env.TARGET_URL || "https://example.com/landing-page",

  // Jika true, server akan melakukan pemeriksaan UA + Referer sebelum redirect
  PROTECTED: true,

  // Daftar domain yang diizinkan sebagai referrer (substring match).
  // Kosongkan array [] untuk menerima semua referrer.
  ALLOWED_REFERRERS: ["google.com", "instagram.com", "facebook.com"],

  // Log aktivitas blocked (debug)
  LOG_BLOCKED: true,

  // Port server
  PORT: process.env.PORT || 8080,

  // Rate limiter setting (requests per window per IP)
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 menit
  RATE_LIMIT_MAX: 60 // max 60 request per IP per window
};

export default cfg;