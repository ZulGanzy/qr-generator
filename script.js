const form = document.getElementById("qrForm");
const qrcodeDiv = document.getElementById("qrcode");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");
const previewBtn = document.getElementById("previewBtn");
const savedQrsDiv = document.getElementById("savedQrs");
const generateBtn = document.querySelector(".generate-btn");

window.addEventListener("DOMContentLoaded", function() {
  const qrModal = document.getElementById("qrModal");
  if (qrModal) {
    qrModal.style.display = "none";
  }
  showSavedQrs();
});

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  
  const iconClass = type === "success" ? "fa-check-circle" : 
                   type === "warning" ? "fa-exclamation-triangle" : "fa-info-circle";
  
  notification.innerHTML = `
    <i class="fas ${iconClass} notification-icon"></i>
    <span class="notification-text">${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function setLoadingState(isLoading) {
  if (isLoading) {
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
  } else {
    generateBtn.innerHTML = '<i class="fas fa-magic"></i><span>Generate QR Code</span>';
    generateBtn.classList.remove('loading');
    generateBtn.disabled = false;
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value.trim();

  if (!text) {
    showNotification("Please enter some text to generate QR code", "warning");
    return;
  }

  qrcodeDiv.innerHTML = "";
  qrcodeDiv.classList.remove('success-animation');
  previewBtn.style.display = "none";
  downloadBtn.style.display = "none";
  saveBtn.style.display = "none";

  setLoadingState(true);

  setTimeout(() => {
    new QRCode(qrcodeDiv, {
      text: text,
      width: 220,
      height: 220,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    setTimeout(() => {
      const qrImg = qrcodeDiv.querySelector("img");
      const qrCanvas = qrcodeDiv.querySelector("canvas");
      
      if (qrImg) {
        qrImg.style.backgroundColor = "white";
        qrImg.style.border = "1px solid #e5e7eb";
      }
      
      if (qrCanvas) {
        qrCanvas.style.backgroundColor = "white";
        qrCanvas.style.border = "1px solid #e5e7eb";
      }
    }, 100);

    setTimeout(() => {
      setLoadingState(false);
      qrcodeDiv.classList.add('success-animation');
      previewBtn.style.display = "inline-flex";
      downloadBtn.style.display = "inline-flex";
      saveBtn.style.display = "inline-flex";
      showNotification("QR Code generated successfully!", "success");
    }, 500);
  }, 800);
});

downloadBtn.addEventListener("click", function () {
  const text = document.getElementById("text").value.trim();
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
      const padding = 10;
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
    const padding = 32;
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
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    const padding = 16;
    tempCanvas.width = img.width + padding * 2;
    tempCanvas.height = img.height + padding * 2;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    ctx.drawImage(img, padding, padding);
    url = tempCanvas.toDataURL("image/png");
  } else if (canvas) {
    const padding = 16;
    const size = canvas.width + padding * 2;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext("2d");
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    
    ctx.drawImage(canvas, padding, padding);
    url = tempCanvas.toDataURL("image/png");
  }
  
  if (url && text) {
    let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
    if (!saved.some((qr) => qr.text === text)) {
      saved.push({ text, url });
      localStorage.setItem("savedQrs", JSON.stringify(saved));
      showSavedQrs();
      showNotification("QR Code saved successfully!", "success");
    } else {
      showNotification("This QR Code has already been saved", "warning");
    }
  } else {
    showNotification("Please generate a QR Code first", "warning");
  }
});

previewBtn.addEventListener("click", function () {
  const text = document.getElementById("text").value.trim();
  const img = qrcodeDiv.querySelector("img");
  const canvas = qrcodeDiv.querySelector("canvas");
  
  if (img || canvas) {
    const previewModal = document.createElement("div");
    previewModal.className = "modal";
    previewModal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-eye"></i>
            QR Code Preview
          </h3>
          <button class="close-modal" onclick="this.closest('.modal').style.display='none'">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-qr-display" style="text-align: center; padding: 20px;">
          <div id="previewQrContainer"></div>
          <div style="margin-top: 16px; color: var(--text-secondary); font-size: 0.875rem; word-break: break-all;">
            ${text}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(previewModal);
    previewModal.style.display = "flex";
    
    setTimeout(() => {
      new QRCode(document.getElementById("previewQrContainer"), {
        text: text,
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      
      setTimeout(() => {
        const previewImg = document.querySelector("#previewQrContainer img");
        const previewCanvas = document.querySelector("#previewQrContainer canvas");
        
        if (previewImg) {
          previewImg.style.backgroundColor = "white";
          previewImg.style.border = "2px solid #e5e7eb";
        }
        
        if (previewCanvas) {
          previewCanvas.style.backgroundColor = "white";
          previewCanvas.style.border = "2px solid #e5e7eb";
        }
      }, 100);
    }, 100);
  } else {
    showNotification("Please generate a QR Code first", "warning");
  }
});

function showSavedQrs() {
  try {
    let saved = JSON.parse(localStorage.getItem("savedQrs") || "[]");
    savedQrsDiv.innerHTML = "";
    if (saved.length === 0) {
      savedQrsDiv.innerHTML = "<p>No saved QR codes yet.</p>";
      return;
    }
    saved.forEach((qr, index) => {
      if (!qr.url || !qr.text) {
        console.warn(`Invalid QR data at index ${index}:`, qr);
        return;
      }
      
      const wrap = document.createElement("div");
      wrap.className = "saved-qr";
      wrap.innerHTML = `
        <img src="${qr.url}" alt="QR Code" width="120" height="120" onerror="this.style.display='none'" onload="this.style.backgroundColor='white'; this.style.border='1px solid #d1d5db'; this.style.borderRadius='4px'">
        <div>${qr.text}</div>
      `;
      wrap.onclick = () => openQrModal(qr);
      savedQrsDiv.appendChild(wrap);
    });
  } catch (error) {
    console.error("Error loading saved QR codes:", error);
    savedQrsDiv.innerHTML = "<p>Error loading saved QR codes.</p>";
  }
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
  
  const qrContainer = document.querySelector('.qr-preview-container');
  if (qrContainer) {
    qrContainer.classList.add('modal-loading');
  }
  
  modalQrImg.src = qr.url;
  modalQrText.textContent = qr.text;
  qrModal.style.display = "flex";
  
  modalQrImg.onload = function() {
    modalQrImg.style.backgroundColor = "white";
    modalQrImg.style.border = "1px solid #d1d5db";
    modalQrImg.style.borderRadius = "4px";
    
    if (qrContainer) {
      qrContainer.classList.remove('modal-loading');
    }
  };
  
  modalQrImg.onerror = function() {
    if (qrContainer) {
      qrContainer.classList.remove('modal-loading');
    }
    showNotification("Failed to load QR code image", "warning");
  };
}

closeModal.onclick = function () {
  qrModal.style.display = "none";
  currentModalQr = null;
};

modalDownload.onclick = function () {
  if (currentModalQr) {
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
    showNotification("QR Code deleted successfully!", "success");
  }
};

qrModal.onclick = function (e) {
  if (e.target === qrModal) {
    qrModal.style.display = "none";
    currentModalQr = null;
  }
};
