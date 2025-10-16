// server.js
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config.js";

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Helper: check if user-agent looks like bot
function looksLikeBot(ua = "") {
  if (!ua) return false;
  const pattern = /(bot|crawl|spider|slurp|phantom|headless|mediapartners|twitterbot|bingbot|yandex)/i;
  return pattern.test(ua);
}

// Helper: check allowed referer
function allowedRef(referer = "") {
  const list = config.ALLOWED_REFERRERS || [];
  if (!Array.isArray(list) || list.length === 0) return true; // jika kosong -> izinkan semua
  const ref = (referer || "").toLowerCase();
  return list.some((domain) => ref.includes(domain.toLowerCase()));
}

// Root route: terima request dan redirect 302 bila lolos
app.get("/", (req, res) => {
  const ua = (req.get("User-Agent") || "").toLowerCase();
  const referer = (req.get("Referer") || "").toLowerCase();

  // validasi
  const isBot = looksLikeBot(ua);
  const isAllowedRef = allowedRef(referer);

  if (config.PROTECTED && (isBot || !isAllowedRef)) {
    if (config.LOG_BLOCKED) {
      console.log(
        `[BLOCKED] time=${new Date().toISOString()} ip=${req.ip} ua="${ua}" referer="${referer}"`
      );
    }
    // Jangan redirect; tampilkan pesan / 403
    return res
      .status(403)
      .send(
        `<html><head><meta charset="utf-8"><title>Access Restricted</title></head><body style="font-family:system-ui,Arial;margin:2rem;"><h3>Access restricted</h3><p>Halaman ini tidak tersedia. Jika kamu manusia, buka link tujuan secara langsung atau hubungi support.</p></body></html>`
      );
  }

  // === Buat URL target ===
  // Kita preserve query string (mis. utm params)
  const target = config.TARGET_URL || process.env.TARGET_URL;
  if (!target) {
    return res
      .status(500)
      .send("Server configuration error: TARGET_URL not set.");
  }

  // Jika ada query string pada original request, lampirkan ke target
  const originalQs = req.originalUrl.split("?")[1] || "";
  const separator = target.includes("?") ? "&" : "?";
  const redirectUrl = originalQs ? `${target}${separator}${originalQs}` : target;

  // Redirect 302 (temporary)
  return res.redirect(302, redirectUrl);
});

// Optional route untuk healthcheck
app.get("/health", (req, res) => res.status(200).send("OK"));

// Start server
const port = config.PORT || process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Redirect server listening on port ${port}`);
});