const form = document.getElementById("qrForm");
const qrcodeDiv = document.getElementById("qrcode");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");
const savedQrsDiv = document.getElementById("savedQrs");

window.addEventListener("DOMContentLoaded", showSavedQrs);

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value.trim();
  qrcodeDiv.innerHTML = "";
  downloadBtn.style.display = "none";
  saveBtn.style.display = "none";
  if (text) {
    new QRCode(qrcodeDiv, {
      text: text,
      width: 220,
      height: 220,
      colorDark: "#181a20",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    setTimeout(() => {
      downloadBtn.style.display = "inline-block";
      saveBtn.style.display = "inline-block";
    }, 200);
  }
});

downloadBtn.addEventListener("click", function () {
  const text = document.getElementById("text").value.trim();
  // Fungsi untuk membuat nama file yang aman
  function safeFileName(str) {
    return (
      str
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()
        .substring(0, 40) || "qrcode"
    );
  }
  const img = qrcodeDiv.querySelector("img");
  const canvas = qrcodeDiv.querySelector("canvas");
  let url;
  if (img) {
    const tempImg = new window.Image();
    tempImg.src = img.src;
    tempImg.onload = function () {
      const padding = 10; // px
      const size = tempImg.width + padding * 2;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = size;
      tempCanvas.height = size;
      const ctx = tempCanvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(tempImg, padding, padding);
      const paddedUrl = tempCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = paddedUrl;
      a.download = safeFileName(text) + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    return;
  } else if (canvas) {
    const padding = 32; // px
    const size = canvas.width + padding * 2;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(canvas, padding, padding);
    url = tempCanvas.toDataURL("image/png");
  }
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFileName(text) + ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

saveBtn.addEventListener("click", function () {
  const text = document.getElementById("text").value.trim();
  const img = qrcodeDiv.querySelector("img");
  const canvas = qrcodeDiv.querySelector("canvas");
  let url;
  if (img) {
    url = img.src;
  } else if (canvas) {
    url = canvas.toDataURL("image/png");
  }
  if (url && text) {
    let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
    if (!saved.some((qr) => qr.text === text)) {
      saved.push({ text, url });
      localStorage.setItem("savedQrs", JSON.stringify(saved));
      showSavedQrs();
    } else {
      alert("QR sudah pernah disimpan.");
    }
  }
});

function showSavedQrs() {
  let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
  savedQrsDiv.innerHTML = "";
  if (saved.length === 0) {
    savedQrsDiv.innerHTML = "<p style='color:#888;'>Belum ada QR code tersimpan.</p>";
    return;
  }
  saved.forEach((qr) => {
    const wrap = document.createElement("div");
    wrap.className = "saved-qr";
    wrap.innerHTML = `
      <img src="${qr.url}" alt="qr" width="120" height="120">
      <div style="margin-top:8px; color:#aaa; font-size:0.9em; word-break:break-all;">${qr.text}</div>
    `;
    wrap.onclick = () => openQrModal(qr);
    savedQrsDiv.appendChild(wrap);
  });
}

const qrModal = document.getElementById("qrModal");
const modalQrImg = document.getElementById("modalQrImg");
const modalQrText = document.getElementById("modalQrText");
const modalDownload = document.getElementById("modalDownload");
const modalDelete = document.getElementById("modalDelete");
const closeModal = document.getElementById("closeModal");

let currentModalQr = null;

function openQrModal(qr) {
  currentModalQr = qr;
  modalQrImg.src = qr.url;
  modalQrText.textContent = qr.text;
  qrModal.style.display = "flex";
}

closeModal.onclick = function () {
  qrModal.style.display = "none";
  currentModalQr = null;
};

modalDownload.onclick = function () {
  if (currentModalQr) {
    // Fungsi untuk membuat nama file yang aman
    function safeFileName(str) {
      return (
        str
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()
          .substring(0, 40) || "qrcode"
      );
    }
    const a = document.createElement("a");
    a.href = currentModalQr.url;
    a.download = safeFileName(currentModalQr.text) + ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

modalDelete.onclick = function () {
  if (currentModalQr) {
    let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
    saved = saved.filter((qr) => qr.text !== currentModalQr.text);
    localStorage.setItem("savedQrs", JSON.stringify(saved));
    showSavedQrs();
    qrModal.style.display = "none";
    currentModalQr = null;
  }
};

qrModal.onclick = function (e) {
  if (e.target === qrModal) {
    qrModal.style.display = "none";
    currentModalQr = null;
  }
};
