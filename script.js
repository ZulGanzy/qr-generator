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

let isGenerating = false;
let currentQrCode = null;
let currentText = "";
let logoDataUrl = null;
let activePreviewModal = null;

const STORAGE_KEY = "qr_styling_config";
const DEFAULTS = {
  dotColor: "#000000",
  csColor: "#000000",
  cdColor: "#000000",
  bgColor: "#ffffff",
  dotStyle: "square",
  cornerSquare: "square",
  cornerDot: "square",
  qrSize: 250,
  errorCorrection: "H",
  downloadQuality: 2,
  logoSize: 35,
  logoMargin: 4,
  dlMargin: 2,
};

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
  if (cfg.logo) {
    logoDataUrl = cfg.logo;
    logoPreview.src = logoDataUrl;
    logoPreviewWrap.style.display = "block";
    logoUploadBtn.style.display = "none";
    logoSlidersWrap.style.display = "grid";
  }

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
}

// ── Init ─────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", function () {
  const qrModal = document.getElementById("qrModal");
  if (qrModal) qrModal.style.display = "none";

  applyStylingConfig(loadStylingConfig());
  showSavedQrs();
  initStylingPanel();

  const urlParams = new URLSearchParams(window.location.search);
  const urlParam = urlParams.get("url") || urlParams.get("text");
  if (urlParam) {
    document.getElementById("text").value = urlParam;
    setTimeout(() => generateQRCode(urlParam), 500);
  }
});

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

    [dotStyleOptions, cornerSquareOptions, cornerDotOptions].forEach(g => {
      g.querySelectorAll(".style-opt").forEach(b => b.classList.remove("active"));
      g.querySelector('[data-value="square"]').classList.add("active");
    });

    qrSize.value = DEFAULTS.qrSize;
    qrSizeVal.textContent = DEFAULTS.qrSize + "px";

    document.querySelectorAll(".err-opt").forEach(b => b.classList.remove("active"));
    document.querySelector('.err-opt[data-value="H"]').classList.add("active");

    document.querySelectorAll(".dl-opt").forEach(b => b.classList.remove("active"));
    document.querySelector('.dl-opt[data-value="2"]').classList.add("active");

    logoDataUrl = null;
    logoPreview.src = "";
    logoPreviewWrap.style.display = "none";
    logoUploadBtn.style.display = "flex";
    logoSlidersWrap.style.display = "none";
    logoUpload.value = "";
    logoSizeSlider.value = DEFAULTS.logoSize;
    logoSizeVal.textContent = DEFAULTS.logoSize + "%";
    logoMarginSlider.value = DEFAULTS.logoMargin;
    logoMarginVal.textContent = DEFAULTS.logoMargin + "px";

    dlMargin.value = DEFAULTS.dlMargin;
    dlMarginVal.textContent = DEFAULTS.dlMargin + "px";

    localStorage.removeItem(STORAGE_KEY);
    onStyleChange();
    showNotification("Styles reset to default", "info");
  });
}

function onStyleChange() {
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

// ── Form Submit ─────────────────────────────────────────────

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value.trim();
  generateQRCode(text);
  const url = new URL(window.location);
  url.searchParams.set("url", text);
  window.history.pushState({}, "", url);
});

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
      <div class="modal-qr-display" style="text-align: center; padding: 20px;">
        <div id="previewQrContainer"></div>
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
  document.body.appendChild(n);
  setTimeout(() => n.classList.add("show"), 100);
  setTimeout(() => { n.classList.remove("show"); setTimeout(() => { if (n.parentNode) n.remove(); }, 300); }, 3000);
}
