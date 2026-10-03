const form = document.getElementById("qrForm");
const qrcodeDiv = document.getElementById("qrcode");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");
const previewBtn = document.getElementById("previewBtn");
const savedQrsDiv = document.getElementById("savedQrs");
const generateBtn = document.querySelector(".generate-btn");

// ── Color elements ──────────────────────────────────────────
const qrDotColor = document.getElementById("qrDotColor");
const qrDotHex = document.getElementById("qrDotHex");
const qrCsColor = document.getElementById("qrCsColor");
const qrCsHex = document.getElementById("qrCsHex");
const qrCdColor = document.getElementById("qrCdColor");
const qrCdHex = document.getElementById("qrCdHex");
const qrBgColor = document.getElementById("qrBgColor");
const qrBgHex = document.getElementById("qrBgHex");

// ── Style option elements ───────────────────────────────────
const dotStyleOptions = document.getElementById("dotStyleOptions");
const cornerSquareOptions = document.getElementById("cornerSquareOptions");
const cornerDotOptions = document.getElementById("cornerDotOptions");

// ── Slider elements ─────────────────────────────────────────
const qrSize = document.getElementById("qrSize");
const qrSizeVal = document.getElementById("qrSizeVal");
const logoSizeSlider = document.getElementById("logoSize");
const logoSizeVal = document.getElementById("logoSizeVal");
const logoMarginSlider = document.getElementById("logoMargin");
const logoMarginVal = document.getElementById("logoMarginVal");
const dlMargin = document.getElementById("dlMargin");
const dlMarginVal = document.getElementById("dlMarginVal");

// ── Logo elements ───────────────────────────────────────────
const logoUpload = document.getElementById("logoUpload");
const logoUploadBtn = document.getElementById("logoUploadBtn");
const logoPreviewWrap = document.getElementById("logoPreviewWrap");
const logoPreview = document.getElementById("logoPreview");
const logoRemove = document.getElementById("logoRemove");
const logoSlidersWrap = document.getElementById("logoSlidersWrap");

// ── Misc elements ───────────────────────────────────────────
const resetStyleBtn = document.getElementById("resetStyleBtn");
const stylingToggle = document.getElementById("stylingToggle");
const stylingBody = document.getElementById("stylingBody");
const presetsGrid = document.getElementById("presetsGrid");

// ── Shortener elements ──────────────────────────────────────
const lengthWarning = document.getElementById("lengthWarning");
const lengthWarnCount = document.getElementById("lengthWarnCount");
const shortenYesBtn = document.getElementById("shortenYesBtn");
const shortenNoBtn = document.getElementById("shortenNoBtn");
const shortenNotice = document.getElementById("shortenNotice");
const shortUrlLink = document.getElementById("shortUrlLink");
const shortUrlCopy = document.getElementById("shortUrlCopy");
const shortenLoading = document.getElementById("shortenLoading");

let isGenerating = false;
let currentQrCode = null;
let currentText = "";
let logoDataUrl = "logo.svg";
let activePreviewModal = null;
let activePresetId = null;
let applyingPreset = false;
let shortenerToken = null;
const shortenedCache = new Map();
try { shortenerToken = localStorage.getItem("qr_shorten_token"); } catch (e) {}

const SHORTENER_BASE = "https://link.joulezy.net";
const SHORTEN_THRESHOLD = 60;

const STORAGE_KEY = "qr_styling_config";
const DEFAULTS = {
  dotColor: "#000000",
  csColor: "#000000",
  cdColor: "#000000",
  bgColor: "#ffffff",
  dotStyle: "rounded",
  cornerSquare: "extra-rounded",
  cornerDot: "dot",
  qrSize: 250,
  errorCorrection: "H",
  downloadQuality: 2,
  logoSize: 35,
  logoMargin: 4,
  dlMargin: 2,
};

// ── Style Presets ───────────────────────────────────────────
// Each preset applies colors + dot/corner shapes. Logo, size, error
// correction and download settings are left untouched.
const PRESETS = [
  {
    id: "classic", name: "Classic",
    dotColor: "#1f1b24", csColor: "#1f1b24", cdColor: "#1f1b24", bgColor: "#ffffff",
    dotStyle: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot",
  },
  {
    id: "midnight", name: "Midnight",
    dotColor: "#ffffff", csColor: "#4cc9f0", cdColor: "#ffd93d", bgColor: "#1f1b24",
    dotStyle: "dots", cornerSquare: "extra-rounded", cornerDot: "dot",
  },
  {
    id: "ocean", name: "Ocean",
    dotColor: "#0077b6", csColor: "#023e8a", cdColor: "#03045e", bgColor: "#caf0f8",
    dotStyle: "rounded", cornerSquare: "square", cornerDot: "square",
  },
  {
    id: "forest", name: "Forest",
    dotColor: "#2d6a4f", csColor: "#1b4332", cdColor: "#40916c", bgColor: "#d8f3dc",
    dotStyle: "extra-rounded", cornerSquare: "extra-rounded", cornerDot: "dot",
  },
  {
    id: "sunset", name: "Sunset",
    dotColor: "#d00000", csColor: "#e85d04", cdColor: "#ffba08", bgColor: "#ffe8d6",
    dotStyle: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "dot",
  },
  {
    id: "lavender", name: "Lavender",
    dotColor: "#7b2cbf", csColor: "#5a189a", cdColor: "#c77dff", bgColor: "#f3e8ff",
    dotStyle: "dots", cornerSquare: "dot", cornerDot: "dot",
  },
  {
    id: "ruby", name: "Ruby",
    dotColor: "#9d0208", csColor: "#6a040f", cdColor: "#d00000", bgColor: "#fff0f0",
    dotStyle: "square", cornerSquare: "square", cornerDot: "square",
  },
  {
    id: "coffee", name: "Coffee",
    dotColor: "#6f4e37", csColor: "#4a2c2a", cdColor: "#8a5a44", bgColor: "#f5e6d3",
    dotStyle: "classy", cornerSquare: "extra-rounded", cornerDot: "dot",
  },
  {
    id: "neon", name: "Neon",
    dotColor: "#00f5d4", csColor: "#00bbf9", cdColor: "#c77dff", bgColor: "#0b0b16",
    dotStyle: "dots", cornerSquare: "extra-rounded", cornerDot: "dot",
  },
  {
    id: "mono", name: "Mono Sharp",
    dotColor: "#000000", csColor: "#000000", cdColor: "#000000", bgColor: "#ffffff",
    dotStyle: "square", cornerSquare: "square", cornerDot: "square",
  },
];

// ── Helpers ──────────────────────────────────────────────────

function isValidHex(hex) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function safeFileName(str) {
  return str.replace(/[^a-z0-9]/gi, "_").toLowerCase().substring(0, 40) || "qrcode";
}

function getActiveValue(container) {
  return container.querySelector(".style-opt.active")?.dataset.value;
}

// ── LocalStorage ─────────────────────────────────────────────

function saveStylingConfig() {
  const config = {
    dotColor: qrDotColor.value,
    csColor: qrCsColor.value,
    cdColor: qrCdColor.value,
    bgColor: qrBgColor.value,
    dotStyle: getActiveValue(dotStyleOptions) || DEFAULTS.dotStyle,
    cornerSquare: getActiveValue(cornerSquareOptions) || DEFAULTS.cornerSquare,
    cornerDot: getActiveValue(cornerDotOptions) || DEFAULTS.cornerDot,
    qrSize: parseInt(qrSize.value) || DEFAULTS.qrSize,
    errorCorrection: document.querySelector(".err-opt.active")?.dataset.value || DEFAULTS.errorCorrection,
    downloadQuality: parseInt(document.querySelector(".dl-opt.active")?.dataset.value) || DEFAULTS.downloadQuality,
    logo: logoDataUrl || null,
    logoSize: parseInt(logoSizeSlider.value) || DEFAULTS.logoSize,
    logoMargin: parseInt(logoMarginSlider.value) || DEFAULTS.logoMargin,
    dlMargin: parseInt(dlMargin.value) || DEFAULTS.dlMargin,
    preset: activePresetId,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}
}

function loadStylingConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function applyStylingConfig(cfg) {
  if (!cfg) return;

  // Colors
  if (cfg.dotColor && isValidHex(cfg.dotColor)) {
    qrDotColor.value = cfg.dotColor;
    qrDotHex.value = cfg.dotColor;
  }
  if (cfg.csColor && isValidHex(cfg.csColor)) {
    qrCsColor.value = cfg.csColor;
    qrCsHex.value = cfg.csColor;
  }
  if (cfg.cdColor && isValidHex(cfg.cdColor)) {
    qrCdColor.value = cfg.cdColor;
    qrCdHex.value = cfg.cdColor;
  }
  if (cfg.bgColor && isValidHex(cfg.bgColor)) {
    qrBgColor.value = cfg.bgColor;
    qrBgHex.value = cfg.bgColor;
  }

  // Style buttons
  [["dotStyleOptions", cfg.dotStyle], ["cornerSquareOptions", cfg.cornerSquare], ["cornerDotOptions", cfg.cornerDot]].forEach(([id, val]) => {
    if (!val) return;
    const container = document.getElementById(id);
    container.querySelectorAll(".style-opt").forEach(b => b.classList.remove("active"));
    const btn = container.querySelector(`[data-value="${val}"]`);
    if (btn) btn.classList.add("active");
  });

  // Size
  if (cfg.qrSize) {
    qrSize.value = cfg.qrSize;
    qrSizeVal.textContent = cfg.qrSize + "px";
  }

  // Error correction
  if (cfg.errorCorrection) {
    document.querySelectorAll(".err-opt").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.err-opt[data-value="${cfg.errorCorrection}"]`);
    if (btn) btn.classList.add("active");
  }

  // Download quality
  if (cfg.downloadQuality) {
    document.querySelectorAll(".dl-opt").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.dl-opt[data-value="${cfg.downloadQuality}"]`);
    if (btn) btn.classList.add("active");
  }

  // Logo
  logoDataUrl = cfg.logo || "logo.svg";
  logoPreview.src = logoDataUrl;
  logoPreviewWrap.style.display = "block";
  logoUploadBtn.style.display = "none";
  logoSlidersWrap.style.display = "grid";

  // Logo sliders
  if (cfg.logoSize) {
    logoSizeSlider.value = cfg.logoSize;
    logoSizeVal.textContent = cfg.logoSize + "%";
  }
  if (cfg.logoMargin !== undefined) {
    logoMarginSlider.value = cfg.logoMargin;
    logoMarginVal.textContent = cfg.logoMargin + "px";
  }

  // Download margin
  if (cfg.dlMargin !== undefined) {
    dlMargin.value = cfg.dlMargin;
    dlMarginVal.textContent = cfg.dlMargin + "px";
  }

  // Preset
  setActivePreset(cfg.preset || null);
}

// ── Init ─────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", function () {
  const qrModal = document.getElementById("qrModal");
  if (qrModal) qrModal.style.display = "none";

  renderPresets();
  applyStylingConfig(loadStylingConfig() || {});
  showSavedQrs();
  initStylingPanel();

  const urlParams = new URLSearchParams(window.location.search);
  const urlParam = urlParams.get("url") || urlParams.get("text");
  if (urlParam) {
    document.getElementById("text").value = urlParam;
    setTimeout(() => generateQRCode(urlParam), 500);
  }
});

// ── Style Presets ─────────────────────────────────────────────

function setStyleActive(containerId, value) {
  const container = document.getElementById(containerId);
  if (!container || !value) return;
  container.querySelectorAll(".style-opt").forEach(b => b.classList.remove("active"));
  const btn = container.querySelector(`[data-value="${value}"]`);
  if (btn) btn.classList.add("active");
}

function setColorInputs(colorEl, hexEl, value) {
  colorEl.value = value;
  hexEl.value = value;
}

function renderPresets() {
  if (!presetsGrid) return;
  presetsGrid.innerHTML = "";

  PRESETS.forEach(preset => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "preset-card";
    card.dataset.preset = preset.id;
    card.title = "Apply " + preset.name + " preset";
    card.innerHTML = '<div class="preset-thumb"></div><span class="preset-name">' + preset.name + "</span>";
    card.addEventListener("click", () => applyPreset(preset));
    presetsGrid.appendChild(card);

    // Render a real mini QR with the preset styling (no logo) as the thumbnail
    const thumb = card.querySelector(".preset-thumb");
    const qr = new QRCodeStyling({
      width: 64,
      height: 64,
      type: "canvas",
      data: "https://joulezy.net",
      dotsOptions: { color: preset.dotColor, type: preset.dotStyle },
      cornersSquareOptions: { color: preset.csColor, type: preset.cornerSquare },
      cornersDotOptions: { color: preset.cdColor, type: preset.cornerDot },
      backgroundOptions: { color: preset.bgColor },
      qrOptions: { errorCorrectionLevel: "Q" },
    });
    qr.append(thumb);
  });
}

function setActivePreset(id) {
  activePresetId = id || null;
  document.querySelectorAll(".preset-card").forEach(c => {
    c.classList.toggle("active", c.dataset.preset === id);
  });
}

function applyPreset(preset) {
  applyingPreset = true;

  setColorInputs(qrDotColor, qrDotHex, preset.dotColor);
  setColorInputs(qrCsColor, qrCsHex, preset.csColor);
  setColorInputs(qrCdColor, qrCdHex, preset.cdColor);
  setColorInputs(qrBgColor, qrBgHex, preset.bgColor);

  setStyleActive("dotStyleOptions", preset.dotStyle);
  setStyleActive("cornerSquareOptions", preset.cornerSquare);
  setStyleActive("cornerDotOptions", preset.cornerDot);

  setActivePreset(preset.id);

  onStyleChange();
  applyingPreset = false;

  showNotification('Preset "' + preset.name + '" applied', "success");
}

// ── Styling Panel ────────────────────────────────────────────

function initStylingPanel() {
  // Toggle open/close
  stylingToggle.addEventListener("click", function () {
    stylingBody.classList.toggle("open");
    stylingToggle.classList.toggle("active");
  });

  // ── Color picker <-> Hex input sync ──────────────────────
  function syncColor(colorInput, hexInput) {
    colorInput.addEventListener("input", function () {
      hexInput.value = this.value;
      onStyleChange();
    });
    hexInput.addEventListener("input", function () {
      let val = this.value.trim();
      if (val && !val.startsWith("#")) val = "#" + val;
      if (isValidHex(val)) {
        colorInput.value = val;
        onStyleChange();
      }
    });
    hexInput.addEventListener("blur", function () {
      let val = this.value.trim();
      if (val && !val.startsWith("#")) val = "#" + val;
      if (isValidHex(val)) {
        colorInput.value = val;
        this.value = val;
      } else {
        this.value = colorInput.value;
      }
      onStyleChange();
    });
    hexInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") this.blur();
    });
  }

  syncColor(qrDotColor, qrDotHex);
  syncColor(qrCsColor, qrCsHex);
  syncColor(qrCdColor, qrCdHex);
  syncColor(qrBgColor, qrBgHex);

  // ── Style option buttons ─────────────────────────────────
  function initGroup(container) {
    container.addEventListener("click", function (e) {
      const btn = e.target.closest(".style-opt");
      if (!btn) return;
      container.querySelectorAll(".style-opt").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onStyleChange();
    });
  }

  initGroup(dotStyleOptions);
  initGroup(cornerSquareOptions);
  initGroup(cornerDotOptions);

  // ── Sliders ──────────────────────────────────────────────
  qrSize.addEventListener("input", function () {
    qrSizeVal.textContent = this.value + "px";
    onStyleChange();
  });
  logoSizeSlider.addEventListener("input", function () {
    logoSizeVal.textContent = this.value + "%";
    onStyleChange();
  });
  logoMarginSlider.addEventListener("input", function () {
    logoMarginVal.textContent = this.value + "px";
    onStyleChange();
  });
  dlMargin.addEventListener("input", function () {
    dlMarginVal.textContent = this.value + "px";
    onStyleChange();
  });

  // ── Error correction buttons ─────────────────────────────
  document.querySelectorAll(".err-opt").forEach(btn => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".err-opt").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      onStyleChange();
    });
  });

  // ── Download quality buttons ─────────────────────────────
  document.querySelectorAll(".dl-opt").forEach(btn => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".dl-opt").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      onStyleChange();
    });
  });

  // ── Logo upload ──────────────────────────────────────────
  logoUploadBtn.addEventListener("click", () => logoUpload.click());

  function handleLogoFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      logoDataUrl = e.target.result;
      logoPreview.src = logoDataUrl;
      logoPreviewWrap.style.display = "block";
      logoUploadBtn.style.display = "none";
      logoSlidersWrap.style.display = "grid";
      onStyleChange();
    };
    reader.readAsDataURL(file);
  }

  logoUpload.addEventListener("change", function () {
    handleLogoFile(this.files[0]);
  });

  // Drag and drop on logo upload button
  logoUploadBtn.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("drag-over");
  });
  logoUploadBtn.addEventListener("dragleave", function () {
    this.classList.remove("drag-over");
  });
  logoUploadBtn.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    handleLogoFile(file);
  });

  logoRemove.addEventListener("click", function () {
    logoDataUrl = null;
    logoPreview.src = "";
    logoPreviewWrap.style.display = "none";
    logoUploadBtn.style.display = "flex";
    logoSlidersWrap.style.display = "none";
    logoUpload.value = "";
    onStyleChange();
  });

  // ── Reset ────────────────────────────────────────────────
  resetStyleBtn.addEventListener("click", function () {
    qrDotColor.value = DEFAULTS.dotColor;
    qrDotHex.value = DEFAULTS.dotColor;
    qrCsColor.value = DEFAULTS.csColor;
    qrCsHex.value = DEFAULTS.csColor;
    qrCdColor.value = DEFAULTS.cdColor;
    qrCdHex.value = DEFAULTS.cdColor;
    qrBgColor.value = DEFAULTS.bgColor;
    qrBgHex.value = DEFAULTS.bgColor;

    [["dotStyleOptions", DEFAULTS.dotStyle], ["cornerSquareOptions", DEFAULTS.cornerSquare], ["cornerDotOptions", DEFAULTS.cornerDot]].forEach(([id, val]) => {
      const container = document.getElementById(id);
      container.querySelectorAll(".style-opt").forEach(b => b.classList.remove("active"));
      container.querySelector(`[data-value="${val}"]`).classList.add("active");
    });

    qrSize.value = DEFAULTS.qrSize;
    qrSizeVal.textContent = DEFAULTS.qrSize + "px";

    document.querySelectorAll(".err-opt").forEach(b => b.classList.remove("active"));
    document.querySelector('.err-opt[data-value="H"]').classList.add("active");

    document.querySelectorAll(".dl-opt").forEach(b => b.classList.remove("active"));
    document.querySelector('.dl-opt[data-value="2"]').classList.add("active");

    logoDataUrl = "logo.svg";
    logoPreview.src = "logo.svg";
    logoPreviewWrap.style.display = "block";
    logoUploadBtn.style.display = "none";
    logoSlidersWrap.style.display = "grid";
    logoUpload.value = "";
    logoSizeSlider.value = DEFAULTS.logoSize;
    logoSizeVal.textContent = DEFAULTS.logoSize + "%";
    logoMarginSlider.value = DEFAULTS.logoMargin;
    logoMarginVal.textContent = DEFAULTS.logoMargin + "px";

    dlMargin.value = DEFAULTS.dlMargin;
    dlMarginVal.textContent = DEFAULTS.dlMargin + "px";

    setActivePreset(null);

    localStorage.removeItem(STORAGE_KEY);
    onStyleChange();
    showNotification("Styles reset to default", "info");
  });
}

function onStyleChange() {
  if (!applyingPreset) setActivePreset(null);
  saveStylingConfig();
  regenerateWithNewStyle();
}

function getStylingConfig() {
  return {
    dotsColor: qrDotColor.value,
    dotsType: getActiveValue(dotStyleOptions) || DEFAULTS.dotStyle,
    cornersSquareColor: qrCsColor.value,
    cornersSquareType: getActiveValue(cornerSquareOptions) || DEFAULTS.cornerSquare,
    cornersDotColor: qrCdColor.value,
    cornersDotType: getActiveValue(cornerDotOptions) || DEFAULTS.cornerDot,
    backgroundColor: qrBgColor.value,
    logo: logoDataUrl || undefined,
    logoSize: (parseInt(logoSizeSlider.value) || DEFAULTS.logoSize) / 100,
    logoMargin: parseInt(logoMarginSlider.value) || DEFAULTS.logoMargin,
    size: parseInt(qrSize.value) || DEFAULTS.qrSize,
    errorCorrection: document.querySelector(".err-opt.active")?.dataset.value || DEFAULTS.errorCorrection,
    downloadQuality: parseInt(document.querySelector(".dl-opt.active")?.dataset.value) || DEFAULTS.downloadQuality,
    dlMargin: parseInt(dlMargin.value) || DEFAULTS.dlMargin,
  };
}

function regenerateWithNewStyle() {
  if (!currentText || isGenerating) return;
  generateQRCode(currentText, true);
}

// ── QR Generation ───────────────────────────────────────────

function setLoadingState(isLoading) {
  if (isLoading) {
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';
    generateBtn.classList.add("loading");
    generateBtn.disabled = true;
  } else {
    generateBtn.innerHTML = '<i class="fas fa-magic"></i><span>Generate QR Code</span>';
    generateBtn.classList.remove("loading");
    generateBtn.disabled = false;
  }
}

// ── Default Logo Generator ────────────────────────────────────

function generateDefaultLogo(bgColor, textColor) {
  const canvas = document.createElement("canvas");
  const s = 200;
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");

  // Rounded rectangle background
  const radius = 24;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(s - radius, 0);
  ctx.quadraticCurveTo(s, 0, s, radius);
  ctx.lineTo(s, s - radius);
  ctx.quadraticCurveTo(s, s, s - radius, s);
  ctx.lineTo(radius, s);
  ctx.quadraticCurveTo(0, s, 0, s - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = bgColor || "#ffffff";
  ctx.fill();

  // Text
  ctx.fillStyle = textColor || "#000000";
  ctx.font = "bold 52px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Joulezy", s / 2, s / 2);

  return canvas.toDataURL("image/png");
}

function buildQrOptions(text, style, sizeOverride) {
  const size = sizeOverride || style.size;
  const opts = {
    width: size,
    height: size,
    type: "canvas",
    data: text,
    dotsOptions: { color: style.dotsColor, type: style.dotsType },
    cornersSquareOptions: { color: style.cornersSquareColor, type: style.cornersSquareType },
    cornersDotOptions: { color: style.cornersDotColor, type: style.cornersDotType },
    backgroundOptions: { color: style.backgroundColor },
    qrOptions: { errorCorrectionLevel: style.errorCorrection },
  };
  if (style.logo) {
    opts.image = style.logo;
  } else {
    opts.image = generateDefaultLogo(style.backgroundColor, style.dotsColor);
  }
  opts.imageOptions = {
    crossOrigin: "anonymous",
    margin: style.logoMargin,
    imageSize: style.logoSize,
  };
  return opts;
}

function generateQRCode(text, isRestyle) {
  if (!text || isGenerating) return;
  isGenerating = true;
  currentText = text;

  qrcodeDiv.innerHTML = "";
  qrcodeDiv.classList.remove("success-animation");
  previewBtn.style.display = "none";
  downloadBtn.style.display = "none";
  saveBtn.style.display = "none";

  if (!isRestyle) setLoadingState(true);

  const style = getStylingConfig();
  const qrOptions = buildQrOptions(text, style);
  const delay = isRestyle ? 100 : 400;

  setTimeout(() => {
    try {
      currentQrCode = new QRCodeStyling(qrOptions);
      currentQrCode.append(qrcodeDiv);

      setTimeout(() => {
        if (!isRestyle) setLoadingState(false);
        qrcodeDiv.classList.add("success-animation");
        previewBtn.style.display = "inline-flex";
        downloadBtn.style.display = "inline-flex";
        saveBtn.style.display = "inline-flex";
        if (!isRestyle) showNotification("QR Code generated successfully!", "success");
        isGenerating = false;
      }, 250);
    } catch (err) {
      console.error("QR generation error:", err);
      isGenerating = false;
      if (!isRestyle) setLoadingState(false);
      showNotification("Failed to generate QR Code. Try different style.", "warning");
    }
  }, delay);
}

// ── Form Submit (with long-URL check) ───────────────────────

function isShortenerUrl(text) {
  return text.startsWith(SHORTENER_BASE + "/");
}

function hideLengthWarning() {
  if (lengthWarning) lengthWarning.style.display = "none";
}

function showLengthWarning(charCount) {
  if (!lengthWarning) return;
  lengthWarnCount.textContent = charCount;
  lengthWarning.style.display = "flex";
  lengthWarning.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideShortenNotice() {
  if (shortenNotice) shortenNotice.style.display = "none";
}

function showShortenNotice(shortUrl, original) {
  if (!shortenNotice) return;
  shortUrlLink.textContent = shortUrl;
  shortUrlLink.href = shortUrl;
  shortenNotice.style.display = "flex";
  shortenNotice.dataset.original = original;
  shortenNotice.dataset.short = shortUrl;
}

async function shortenUrl(originalUrl) {
  shortenYesBtn.disabled = true;
  shortenNoBtn.disabled = true;
  shortenLoading.style.display = "inline-block";

  try {
    const res = await fetch(SHORTENER_BASE + "/api/shorten", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: originalUrl, qrgen: true, ...(shortenerToken ? { token: shortenerToken } : {}) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Shorten failed");
    if (data.token) {
      shortenerToken = data.token;
      try { localStorage.setItem("qr_shorten_token", data.token); } catch (e) {}
    }
    showShortenNotice(SHORTENER_BASE + "/" + data.code, originalUrl);
    shortenedCache.set(originalUrl, SHORTENER_BASE + "/" + data.code);
    return SHORTENER_BASE + "/" + data.code;
  } catch (err) {
    console.error("Shorten failed:", err);
    showNotification("Shortener unavailable, using original URL", "warning");
    return null;
  } finally {
    shortenYesBtn.disabled = false;
    shortenNoBtn.disabled = false;
    shortenLoading.style.display = "none";
  }
}

function proceedGenerate(text, pushHistory) {
  generateQRCode(text);
  if (pushHistory) {
    const url = new URL(window.location);
    url.searchParams.set("url", text);
    window.history.pushState({}, "", url);
  }
}

// ── Permanent-or-temporary modal ───────────────────────────

function showPermModal(shortUrl, original) {
  const modal = document.getElementById("permModal");
  if (!modal) { proceedGenerate(shortUrl, true); return; }
  modal.style.display = "flex";

  document.getElementById("permYesBtn").onclick = function () {
    try {
      localStorage.setItem("qr_pending", JSON.stringify({ short: shortUrl, original: original }));
    } catch (e) {}
    const back = location.origin + location.pathname + "?restored=1";
    location.href = "https://link.joulezy.net/login?redirect_url=" + encodeURIComponent(back);
  };

  document.getElementById("permNoBtn").onclick = function () {
    modal.style.display = "none";
    const oldToken = shortenerToken;
    shortenerToken = null;
    try {
      localStorage.removeItem("qr_shorten_token");
      localStorage.removeItem("jlstnr_token");
    } catch (e) {}
    try {
      fetch(SHORTENER_BASE + "/api/token/revoke", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: oldToken }),
      }).catch(function () {});
    } catch (e) {}
    proceedGenerate(shortUrl, true);
  };
}

// On return from login, regenerate QR from the pending short link
(function restorePending() {
  try {
    const pending = localStorage.getItem("qr_pending");
    if (!pending) return;
    localStorage.removeItem("qr_pending");
    const data = JSON.parse(pending);
    const input = document.getElementById("text");
    if (input) input.value = data.short;
    showShortenNotice(data.short, data.original);
    proceedGenerate(data.short, true);
    showNotification("Link sudah permanen — QR di-generate ulang", "success");
  } catch (e) {}
})();

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value.trim();
  if (!text) return;

  hideLengthWarning();
  hideShortenNotice();

  if (text.length > SHORTEN_THRESHOLD && /^https?:\/\//i.test(text) && !isShortenerUrl(text)) {
    const cached = shortenedCache.get(text);
    if (cached) {
      showShortenNotice(cached, text);
      document.getElementById("text").value = cached;
      showPermModal(cached, text);
      return;
    }
    showLengthWarning(text.length);
    shortenYesBtn.onclick = async function () {
      hideLengthWarning();
      const shortUrl = await shortenUrl(text);
      if (shortUrl) {
        document.getElementById("text").value = shortUrl;
        showPermModal(shortUrl, text);
      } else {
        proceedGenerate(text, true);
      }
    };
    shortenNoBtn.onclick = function () {
      hideLengthWarning();
      proceedGenerate(text, true);
    };
    return;
  }

  proceedGenerate(text, true);
});

// ── Short URL copy button ─────────────────────────────────────
if (shortUrlCopy) {
  shortUrlCopy.addEventListener("click", function () {
    const link = shortUrlLink.textContent;
    const done = () => showNotification("Short link copied!", "success");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done).catch(() => fallbackCopy(link, done));
    } else {
      fallbackCopy(link, done);
    }
  });
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); done(); } catch (e) {
    showNotification("Copy failed", "warning");
  }
  ta.remove();
}

// ── Download ────────────────────────────────────────────────

downloadBtn.addEventListener("click", function () {
  if (!currentQrCode) {
    showNotification("Please generate a QR Code first", "warning");
    return;
  }
  const text = document.getElementById("text").value.trim();
  const quality = parseInt(document.querySelector(".dl-opt.active")?.dataset.value) || 2;
  const style = getStylingConfig();
  const renderSize = style.size * quality;

  // Generate QR at target size
  const bigOpts = buildQrOptions(text, style, renderSize);
  const tempQr = new QRCodeStyling(bigOpts);

  // Render to temp canvas then add padding
  tempQr.getRawData("png").then(function (blob) {
    const img = new Image();
    img.onload = function () {
      const pad = Math.round(renderSize * (style.dlMargin / 100));
      const finalSize = renderSize + pad * 2;
      const c = document.createElement("canvas");
      c.width = finalSize;
      c.height = finalSize;
      const ctx = c.getContext("2d");
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, finalSize, finalSize);
      ctx.drawImage(img, pad, pad);

      const a = document.createElement("a");
      a.href = c.toDataURL("image/png");
      a.download = safeFileName(text) + ".png";
      a.click();
    };
    img.src = URL.createObjectURL(blob);
  });
});

// ── Save ────────────────────────────────────────────────────

saveBtn.addEventListener("click", function () {
  const text = document.getElementById("text").value.trim();
  if (!currentQrCode || !text) {
    showNotification("Please generate a QR Code first", "warning");
    return;
  }
  const canvas = qrcodeDiv.querySelector("canvas");
  if (!canvas) {
    showNotification("Failed to get QR image", "warning");
    return;
  }

  const padding = 16;
  const size = canvas.width + padding * 2;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = size;
  tempCanvas.height = size;
  const ctx = tempCanvas.getContext("2d");
  ctx.fillStyle = qrBgColor.value;
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(canvas, padding, padding);
  const url = tempCanvas.toDataURL("image/png");

  let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
  if (!saved.some((qr) => qr.text === text)) {
    saved.push({ text, url });
    localStorage.setItem("savedQrs", JSON.stringify(saved));
    showSavedQrs();
    showNotification("QR Code saved successfully!", "success");
  } else {
    showNotification("This QR Code has already been saved", "warning");
  }
});

// ── Preview ─────────────────────────────────────────────────

previewBtn.addEventListener("click", function () {
  if (!currentQrCode) {
    showNotification("Please generate a QR Code first", "warning");
    return;
  }

  if (activePreviewModal) {
    activePreviewModal.remove();
    activePreviewModal = null;
  }

  const text = document.getElementById("text").value.trim();
  const style = getStylingConfig();

  activePreviewModal = document.createElement("div");
  activePreviewModal.className = "modal";
  activePreviewModal.style.display = "flex";
  activePreviewModal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-eye"></i>
          QR Code Preview
        </h3>
        <button class="close-modal preview-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-qr-display">
        <div class="qr-preview-container" id="previewQrContainer"></div>
        <div class="modal-qr-text">${text}</div>
      </div>
    </div>
  `;

  document.body.appendChild(activePreviewModal);

  const closePreview = () => { activePreviewModal.remove(); activePreviewModal = null; };
  activePreviewModal.querySelector(".preview-close").addEventListener("click", closePreview);
  activePreviewModal.addEventListener("click", (e) => { if (e.target === activePreviewModal) closePreview(); });

  const container = activePreviewModal.querySelector("#previewQrContainer");
  const previewQr = new QRCodeStyling(buildQrOptions(text, style, 300));
  previewQr.append(container);
});

// ── Saved QRs ───────────────────────────────────────────────

function showSavedQrs() {
  try {
    let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
    savedQrsDiv.innerHTML = "";
    if (saved.length === 0) {
      savedQrsDiv.innerHTML = "<p>No saved QR codes yet.</p>";
      return;
    }
    saved.forEach((qr) => {
      if (!qr.url || !qr.text) return;
      const wrap = document.createElement("div");
      wrap.className = "saved-qr";
      wrap.innerHTML = `<img src="${qr.url}" alt="QR Code" width="120" height="120"><div>${qr.text}</div>`;
      wrap.onclick = () => openQrModal(qr);
      savedQrsDiv.appendChild(wrap);
    });
  } catch (error) {
    console.error("Error loading saved QR codes:", error);
    savedQrsDiv.innerHTML = "<p>Error loading saved QR codes.</p>";
  }
}

// ── Modal ───────────────────────────────────────────────────

const qrModal = document.getElementById("qrModal");
const modalQrImg = document.getElementById("modalQrImg");
const modalQrText = document.getElementById("modalQrText");
const modalDownload = document.getElementById("modalDownload");
const modalDelete = document.getElementById("modalDelete");
const closeModalBtn = document.getElementById("closeModal");

let currentModalQr = null;

function openQrModal(qr) {
  currentModalQr = qr;
  const qc = document.querySelector(".qr-preview-container");
  if (qc) qc.classList.add("modal-loading");
  modalQrImg.src = qr.url;
  modalQrText.textContent = qr.text;
  qrModal.style.display = "flex";
  modalQrImg.onload = () => { if (qc) qc.classList.remove("modal-loading"); };
  modalQrImg.onerror = () => {
    if (qc) qc.classList.remove("modal-loading");
    showNotification("Failed to load QR code image", "warning");
  };
}

closeModalBtn.onclick = function () { qrModal.style.display = "none"; currentModalQr = null; };

modalDownload.onclick = function () {
  if (!currentModalQr) return;
  const a = document.createElement("a");
  a.href = currentModalQr.url;
  a.download = safeFileName(currentModalQr.text) + ".png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

modalDelete.onclick = function () {
  if (!currentModalQr) return;
  let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
  saved = saved.filter((qr) => qr.text !== currentModalQr.text);
  localStorage.setItem("savedQrs", JSON.stringify(saved));
  showSavedQrs();
  qrModal.style.display = "none";
  currentModalQr = null;
  showNotification("QR Code deleted successfully!", "success");
};

qrModal.onclick = function (e) {
  if (e.target === qrModal) { qrModal.style.display = "none"; currentModalQr = null; }
};

// ── Notifications ───────────────────────────────────────────

function showNotification(message, type = "info") {
  const n = document.createElement("div");
  n.className = `notification notification-${type}`;
  const icon = type === "success" ? "fa-check-circle" : type === "warning" ? "fa-exclamation-triangle" : "fa-info-circle";
  n.innerHTML = `<i class="fas ${icon} notification-icon"></i><span class="notification-text">${message}</span>`;
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }
  stack.prepend(n);
  setTimeout(() => n.classList.add("show"), 100);
  setTimeout(() => { n.classList.remove("show"); setTimeout(() => { if (n.parentNode) n.remove(); }, 300); }, 3000);
}

/* ===== FAQ Accordion ===== */
(function () {
  document.querySelectorAll(".faq").forEach(function (faq) {
    faq.querySelectorAll(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var wasOpen = item.classList.contains("open");
        faq.querySelectorAll(".faq-item.open").forEach(function (o) {
          o.classList.remove("open");
          o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
})();
